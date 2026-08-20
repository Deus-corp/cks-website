#!/usr/bin/env node
/**
 * generate-meta.mjs -- generate src/data/ecosystem-meta.json at build time.
 *
 * Reads live metadata (tool count, package versions, commit refs) from
 * sibling checkouts of the ecosystem repos (cks-core, cks-runtime, cks-mcp,
 * cks-studio), which CI clones next to this repo (see
 * .github/workflows/docs-sync.yml). If a sibling repo isn't present (e.g.
 * local dev without cloning everything), this script falls back to the
 * values already committed in src/data/ecosystem-meta.json, and if that's
 * also missing, to hardcoded static defaults. The build never fails just
 * because sibling repos are absent.
 *
 * No external dependencies -- Node.js standard library only.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SIBLINGS_ROOT = path.resolve(REPO_ROOT, ".."); // CI/local layout: repos as siblings
const OUT_PATH = path.join(REPO_ROOT, "src", "data", "ecosystem-meta.json");

const REPOS = ["cks-core", "cks-runtime", "cks-mcp", "cks-studio"];

const STATIC_DEFAULTS = {
  toolCount: 0,
  versions: {
    "cks-core": "0.0.0",
    "cks-runtime": "0.0.0",
    "cks-mcp": "0.0.0",
    "cks-studio": "0.0.0",
    "cks-website": "0.0.0",
  },
  generatedAt: null,
  sourceRefs: {},
};

function log(msg) {
  console.log(`[generate-meta] ${msg}`);
}

function siblingPath(repo) {
  return path.join(SIBLINGS_ROOT, repo);
}

function readPreviousCommitted() {
  if (existsSync(OUT_PATH)) {
    try {
      return JSON.parse(readFileSync(OUT_PATH, "utf-8"));
    } catch (err) {
      log(`WARN: could not parse existing ${OUT_PATH}: ${err.message}`);
    }
  }
  return null;
}

/** Extract __version__ = "x.y.z" from a Python _version.py file. */
function readPythonVersionFile(filePath) {
  if (!existsSync(filePath)) return null;
  const text = readFileSync(filePath, "utf-8");
  const m = text.match(/__version__\s*=\s*["']([^"']+)["']/);
  return m ? m[1] : null;
}

/** Fallback: read version = "x.y.z" from pyproject.toml (non-dynamic case). */
function readPyprojectVersion(filePath) {
  if (!existsSync(filePath)) return null;
  const text = readFileSync(filePath, "utf-8");
  const m = text.match(/^\s*version\s*=\s*["']([^"']+)["']/m);
  return m ? m[1] : null;
}

function readPackageJsonVersion(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    const pkg = JSON.parse(readFileSync(filePath, "utf-8"));
    return pkg.version ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve the version of a Python-packaged repo (cks-core, cks-runtime,
 * cks-mcp). Prefers src/<import_pkg>/_version.py, falls back to a
 * (non-dynamic) version in pyproject.toml.
 */
function resolvePythonRepoVersion(repoDir, importPkgCandidates) {
  for (const pkg of importPkgCandidates) {
    const v = readPythonVersionFile(path.join(repoDir, "src", pkg, "_version.py"));
    if (v) return v;
  }
  return readPyprojectVersion(path.join(repoDir, "pyproject.toml"));
}

function resolveGitRef(repoDir) {
  if (!existsSync(path.join(repoDir, ".git"))) return null;
  try {
    const commit = execSync("git rev-parse --short HEAD", { cwd: repoDir })
      .toString()
      .trim();
    let branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoDir })
      .toString()
      .trim();
    if (branch === "HEAD") branch = null; // detached HEAD (typical CI checkout)
    return { commit, branch };
  } catch {
    return null;
  }
}

/**
 * Count tools exposed by cks-mcp by statically parsing the `TOOLS = { ... }`
 * top-level dict in src/cks_mcp/registry.py via Python's ast module. We
 * deliberately avoid `import cks_mcp.registry` because that module pulls in
 * the rest of the package's runtime dependencies (cks_runtime, etc.), which
 * aren't guaranteed to be installed in the website's build environment.
 * Static AST parsing only needs the Python 3 standard library.
 */
function countMcpTools(cksMcpDir) {
  const registryPath = path.join(cksMcpDir, "src", "cks_mcp", "registry.py");
  if (!existsSync(registryPath)) return null;

  const pySnippet = [
    "import ast, sys",
    `tree = ast.parse(open(${JSON.stringify(registryPath)}, encoding="utf-8").read())`,
    "for node in ast.walk(tree):",
    "    if isinstance(node, ast.Assign):",
    "        for t in node.targets:",
    '            if isinstance(t, ast.Name) and t.id == "TOOLS" and isinstance(node.value, ast.Dict):',
    "                print(len(node.value.keys))",
    "                sys.exit(0)",
    "sys.exit(1)",
    "",
  ].join("\n");

  const tmpFile = path.join(os.tmpdir(), `cks-mcp-tool-count-${Date.now()}.py`);
  try {
    writeFileSync(tmpFile, pySnippet, "utf-8");
    const out = execSync(`python3 ${JSON.stringify(tmpFile)}`, {
      cwd: cksMcpDir,
    })
      .toString()
      .trim();
    const n = parseInt(out, 10);
    return Number.isFinite(n) ? n : null;
  } catch (err) {
    log(`WARN: failed to statically count TOOLS in registry.py: ${err.message}`);
    return null;
  } finally {
    try {
      if (existsSync(tmpFile)) execSync(`rm -f ${JSON.stringify(tmpFile)}`);
    } catch {
      /* best effort cleanup */
    }
  }
}

function main() {
  const previous = readPreviousCommitted();
  const base = previous ?? STATIC_DEFAULTS;

  const result = {
    toolCount: base.toolCount,
    versions: { ...STATIC_DEFAULTS.versions, ...(base.versions ?? {}) },
    generatedAt: new Date().toISOString(),
    sourceRefs: {},
  };

  // cks-website's own version, always available (we're running inside it).
  const ownVersion = readPackageJsonVersion(path.join(REPO_ROOT, "package.json"));
  if (ownVersion) result.versions["cks-website"] = ownVersion;
  const ownRef = resolveGitRef(REPO_ROOT);
  if (ownRef) result.sourceRefs["cks-website"] = ownRef;

  let usedFallbackFor = [];

  for (const repo of REPOS) {
    const dir = siblingPath(repo);
    if (!existsSync(dir)) {
      usedFallbackFor.push(repo);
      continue;
    }

    const ref = resolveGitRef(dir);
    if (ref) result.sourceRefs[repo] = ref;

    if (repo === "cks-studio") {
      const v = readPackageJsonVersion(path.join(dir, "package.json"));
      if (v) result.versions[repo] = v;
      else usedFallbackFor.push(`${repo} (version)`);
    } else {
      const importPkg = repo === "cks-mcp" ? "cks_mcp" : repo.replace(/-/g, "_");
      // cks-core imports as "cks", not "cks_core" -- check both.
      const candidates =
        repo === "cks-core" ? ["cks", "cks_core"] : [importPkg];
      const v = resolvePythonRepoVersion(dir, candidates);
      if (v) result.versions[repo] = v;
      else usedFallbackFor.push(`${repo} (version)`);
    }

    if (repo === "cks-mcp") {
      const count = countMcpTools(dir);
      if (count !== null) {
        result.toolCount = count;
      } else {
        usedFallbackFor.push("cks-mcp (toolCount)");
      }
    }
  }

  if (usedFallbackFor.length > 0) {
    log(
      `Using committed fallback values for: ${usedFallbackFor.join(", ")} ` +
        `(sibling repo(s) not found at ${SIBLINGS_ROOT} -- expected for local dev)`
    );
  }

  mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(result, null, 2) + "\n", "utf-8");
  log(`Wrote ${path.relative(REPO_ROOT, OUT_PATH)}`);
  log(`  toolCount: ${result.toolCount}`);
  log(`  versions: ${JSON.stringify(result.versions)}`);
}

main();
