#!/usr/bin/env python3
"""
sync-docs.py -- refresh cks-website's local copies of ecosystem documentation
from sibling checkouts of the other CKS repos.

Usage (from the cks-website repo root, with sibling checkouts already in
place -- see .github/workflows/docs-sync.yml):

    python scripts/sync-docs.py [--config docs-sync.config.json] [--dry-run]

Requires only the Python 3.12 standard library. No third-party packages.

Behaviour summary (see docs-sync.config.json for the actual mapping):

  * For every configured source repo, every file matching an `include`
    glob (relative to that repo's root) and not matching an `exclude`
    glob is copied into `dest`, mirroring its relative path.
  * Content is normalized (CRLF -> LF, single trailing newline) and, for
    Markdown files with no YAML frontmatter, a minimal Starlight-compatible
    frontmatter block (`title`, derived from the first `# ` heading or the
    filename) is prepended -- Starlight's docsSchema requires `title` on
    every page, and upstream READMEs/CHANGELOGs never have it.
  * A file is only written if its normalized content's SHA-256 differs
    from what's already on disk, so repeated runs with no upstream
    changes touch nothing and produce no commit.
  * Files under any `protected` glob (relative to the cks-website repo
    root) are never written to or removed, regardless of source config.
  * When `remove_orphaned` is true (default), a previously-synced file
    that has since disappeared upstream (or upstream renamed/dropped
    it) is removed from `dest` -- but only files inside a configured
    `dest` tree, and never anything under `protected`.
  * Every file considered is logged as exactly one of:
    UPDATED / UNCHANGED / SKIPPED (excluded) / REMOVED.
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import sys
from pathlib import Path


def log(message: str) -> None:
    print(message, flush=True)


def load_config(config_path: Path) -> dict:
    if not config_path.is_file():
        raise SystemExit(f"ERROR: config file not found: {config_path}")
    try:
        with config_path.open("r", encoding="utf-8") as fh:
            config = json.load(fh)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"ERROR: invalid JSON in {config_path}: {exc}") from exc

    if "sources" not in config or not isinstance(config["sources"], dict):
        raise SystemExit(f"ERROR: config {config_path} is missing a 'sources' object")

    return config


def matches_any(rel_posix: str, patterns: list[str]) -> bool:
    """True if rel_posix (forward-slash relative path) matches any glob pattern."""
    for pattern in patterns:
        if fnmatch.fnmatch(rel_posix, pattern):
            return True
    return False


def expand_include(source_root: Path, pattern: str) -> list[Path]:
    """
    Expand one include pattern (relative to source_root) into concrete
    existing files. Supports plain filenames ("README.md"), single
    directories/files, and "**" glob patterns understood by
    pathlib.Path.glob (e.g. "docs/**").
    """
    if any(ch in pattern for ch in "*?["):
        # pathlib's glob("dir/**") matches directories at every depth but
        # not the files inside them -- only "dir/**/*" reaches files. A
        # trailing "**" in config (the natural "everything under dir"
        # spelling) is therefore rewritten to "**/*" so it behaves the
        # way the config authors intend.
        effective_pattern = pattern[:-2] + "**/*" if pattern.endswith("**") else pattern
        matches = sorted(p for p in source_root.glob(effective_pattern) if p.is_file())
        return matches

    candidate = source_root / pattern
    if candidate.is_file():
        return [candidate]
    if candidate.is_dir():
        return sorted(p for p in candidate.rglob("*") if p.is_file())
    return []


def normalize_content(raw: bytes) -> bytes:
    """CRLF -> LF, then ensure exactly one trailing newline."""
    text = raw.decode("utf-8", errors="replace")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.rstrip("\n") + "\n"
    return text.encode("utf-8")


def yaml_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def derive_title(rel_path: Path, text: str) -> str:
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
        if stripped and not stripped.startswith("#"):
            # First non-empty, non-heading line reached before any H1:
            # fall through to filename-derived title instead of guessing.
            break
    stem = rel_path.stem.replace("_", " ").replace("-", " ").strip()
    return stem.title() if stem else rel_path.name


def ensure_frontmatter(content: bytes, rel_dest_path: Path) -> bytes:
    """
    Prepend a minimal Starlight frontmatter block to Markdown content that
    doesn't already have one. Starlight's docsSchema requires `title`;
    upstream README/CHANGELOG/docs files never carry it, so without this
    every synced page would fail the site build.
    """
    if rel_dest_path.suffix.lower() != ".md":
        return content

    text = content.decode("utf-8")
    if text.startswith("---\n") or text.startswith("---\r\n"):
        # Already has frontmatter (e.g. a source doc already written for
        # Starlight) -- leave it exactly as-is.
        return content

    title = derive_title(rel_dest_path, text)
    frontmatter = f'---\ntitle: "{yaml_escape(title)}"\n---\n\n'
    return (frontmatter + text).encode("utf-8")


def inject_sync_banner(content: bytes, source_repo: str, rel_from_source: Path) -> bytes:
    """
    Insert a small Starlight admonition right after the frontmatter block,
    noting that this page is synced automatically and pointing back at the
    upstream source file. Uses Starlight's built-in `:::note[...]` aside
    directive, so it works in plain Markdown -- no MDX/component import
    needed, and it survives every re-sync since it's generated fresh each
    time rather than hand-maintained.
    """
    text = content.decode("utf-8")
    if not (text.startswith("---\n") or text.startswith("---\r\n")):
        # No frontmatter (non-.md file, e.g. already-.mdx source) -- skip.
        return content

    end = text.find("\n---", 4)
    if end == -1:
        return content
    end += len("\n---")
    # Skip the newline(s) right after the closing "---".
    rest_start = end
    while rest_start < len(text) and text[rest_start] in "\r\n":
        rest_start += 1

    source_url = (
        f"https://github.com/PunctumActus/{source_repo}/blob/main/"
        f"{rel_from_source.as_posix()}"
    )
    banner = (
        f"\n\n:::note[Синхронизировано автоматически]\n"
        f"Эта страница подтягивается раз в сутки из "
        f"[`{rel_from_source.as_posix()}`]({source_url}) репозитория "
        f"`{source_repo}`. Вносите правки в исходном репозитории — "
        f"изменения прямо здесь будут перезаписаны при следующей синхронизации.\n"
        f":::\n\n"
    )
    return (text[:end] + banner + text[rest_start:]).encode("utf-8")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sync_source(
    name: str,
    spec: dict,
    repo_base: Path,
    website_root: Path,
    protected_patterns: list[str],
    remove_orphaned: bool,
    dry_run: bool,
) -> tuple[int, int, int, int]:
    """Sync one configured source. Returns (updated, unchanged, skipped, removed) counts."""
    updated = unchanged = skipped = removed = 0

    source_repo = spec.get("repo", name)
    source_root = repo_base / source_repo
    include_patterns = spec.get("include", [])
    exclude_patterns = spec.get("exclude", [])
    strip_prefix = spec.get("strip_prefix", "")
    dest_rel = spec.get("dest")

    if not dest_rel:
        raise SystemExit(f"ERROR: source '{name}' has no 'dest' configured")

    dest_root = (website_root / dest_rel).resolve()
    try:
        dest_root.relative_to(website_root.resolve())
    except ValueError:
        raise SystemExit(
            f"ERROR: source '{name}' dest '{dest_rel}' escapes the website repo root"
        )

    if not source_root.is_dir():
        raise SystemExit(
            f"ERROR: source repo directory not found for '{name}': {source_root} "
            "(expected a sibling checkout -- see docs-sync.yml)"
        )

    dest_root.mkdir(parents=True, exist_ok=True)

    synced_dest_files: set[Path] = set()

    candidate_files: dict[Path, None] = {}
    for pattern in include_patterns:
        for path in expand_include(source_root, pattern):
            candidate_files[path] = None

    for src_path in sorted(candidate_files):
        rel_from_source = src_path.relative_to(source_root)
        rel_posix = rel_from_source.as_posix()

        if matches_any(rel_posix, exclude_patterns):
            log(f"SKIPPED  {name}/{rel_posix} (excluded)")
            skipped += 1
            continue

        rel_for_dest = rel_from_source
        if strip_prefix and rel_posix.startswith(strip_prefix):
            rel_for_dest = Path(rel_posix[len(strip_prefix):])

        dest_path = dest_root / rel_for_dest
        dest_rel_from_website = dest_path.resolve().relative_to(website_root.resolve())
        dest_rel_posix = dest_rel_from_website.as_posix()

        if matches_any(dest_rel_posix, protected_patterns):
            log(f"SKIPPED  {dest_rel_posix} (protected)")
            skipped += 1
            continue

        raw = src_path.read_bytes()
        normalized = normalize_content(raw)
        final_content = ensure_frontmatter(normalized, dest_rel_from_website)
        final_content = inject_sync_banner(final_content, source_repo, rel_from_source)

        synced_dest_files.add(dest_path.resolve())

        if dest_path.is_file():
            existing = dest_path.read_bytes()
            if sha256(existing) == sha256(final_content):
                log(f"UNCHANGED {dest_rel_posix}")
                unchanged += 1
                continue

        log(f"UPDATED  {dest_rel_posix}")
        updated += 1
        if not dry_run:
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            dest_path.write_bytes(final_content)

    if remove_orphaned and dest_root.is_dir():
        for existing_path in sorted(dest_root.rglob("*")):
            if not existing_path.is_file():
                continue
            resolved = existing_path.resolve()
            if resolved in synced_dest_files:
                continue

            rel_from_website = resolved.relative_to(website_root.resolve())
            rel_posix = rel_from_website.as_posix()

            if matches_any(rel_posix, protected_patterns):
                continue

            log(f"REMOVED  {rel_posix} (no longer present upstream)")
            removed += 1
            if not dry_run:
                existing_path.unlink()

    return updated, unchanged, skipped, removed


def prune_empty_dirs(root: Path) -> None:
    if not root.is_dir():
        return
    for dirpath in sorted(root.rglob("*"), key=lambda p: len(p.parts), reverse=True):
        if dirpath.is_dir() and not any(dirpath.iterdir()):
            dirpath.rmdir()


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync ecosystem docs into cks-website.")
    parser.add_argument(
        "--config",
        default="docs-sync.config.json",
        help="Path to the sync config (default: docs-sync.config.json in the repo root).",
    )
    parser.add_argument(
        "--website-root",
        default=".",
        help="Path to the cks-website repo root (default: current directory).",
    )
    parser.add_argument(
        "--repo-base",
        default="..",
        help=(
            "Directory containing the sibling source repo checkouts "
            "(default: parent of the website root, matching the workflow's checkout layout)."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing or deleting anything.",
    )
    args = parser.parse_args()

    website_root = Path(args.website_root).resolve()
    repo_base = (website_root / args.repo_base).resolve()
    config_path = Path(args.config)
    if not config_path.is_absolute():
        config_path = website_root / config_path

    try:
        config = load_config(config_path)
    except SystemExit:
        raise
    except Exception as exc:  # unexpected -- still a clean non-zero exit
        log(f"ERROR: failed to load config: {exc}")
        return 1

    protected_patterns = config.get("protected", [])
    remove_orphaned = bool(config.get("remove_orphaned", True))
    sources = config["sources"]

    total_updated = total_unchanged = total_skipped = total_removed = 0
    touched_dest_roots: list[Path] = []

    try:
        for name, spec in sources.items():
            log(f"\n== {name} ==")
            u, uc, s, r = sync_source(
                name=name,
                spec=spec,
                repo_base=repo_base,
                website_root=website_root,
                protected_patterns=protected_patterns,
                remove_orphaned=remove_orphaned,
                dry_run=args.dry_run,
            )
            total_updated += u
            total_unchanged += uc
            total_skipped += s
            total_removed += r
            touched_dest_roots.append((website_root / spec["dest"]).resolve())
    except SystemExit as exc:
        log(str(exc))
        return 1
    except Exception as exc:  # unexpected error -> non-zero exit per spec
        log(f"ERROR: unexpected failure during sync: {exc}")
        return 1

    if remove_orphaned and not args.dry_run:
        for root in touched_dest_roots:
            prune_empty_dirs(root)

    log(
        f"\n=== sync-docs summary: "
        f"{total_updated} updated, {total_unchanged} unchanged, "
        f"{total_skipped} skipped, {total_removed} removed ==="
    )

    return 0


if __name__ == "__main__":
    sys.exit(main())