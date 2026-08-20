import meta from "./ecosystem-meta.json";

export type RepoName =
  | "cks-core"
  | "cks-runtime"
  | "cks-mcp"
  | "cks-studio"
  | "cks-website";

export interface SourceRef {
  commit: string;
  branch: string | null;
}

export interface EcosystemMeta {
  toolCount: number;
  versions: Record<RepoName, string>;
  generatedAt: string | null;
  sourceRefs: Partial<Record<RepoName, SourceRef>>;
}

const ecosystemMeta = meta as EcosystemMeta;

/** Number of tools exposed by cks-mcp over MCP (from the live TOOLS registry). */
export function getToolCount(): number {
  return ecosystemMeta.toolCount;
}

/** Package version for a given ecosystem repo, e.g. getPackageVersion("cks-core"). */
export function getPackageVersion(repo: RepoName): string {
  return ecosystemMeta.versions[repo] ?? "unknown";
}

/** ISO timestamp of when this metadata was last generated. */
export function getGeneratedAt(): string | null {
  return ecosystemMeta.generatedAt;
}

/** Commit/branch the metadata was generated from, if known. */
export function getSourceRef(repo: RepoName): SourceRef | undefined {
  return ecosystemMeta.sourceRefs[repo];
}

export default ecosystemMeta;
