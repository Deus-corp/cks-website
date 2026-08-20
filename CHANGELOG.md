# Changelog

All notable changes to CKS Website will be documented in this file.

---

## [0.3.0] - 2026-08-20

### Added
- **Build-time ecosystem metadata generation** – new `scripts/generate-meta.mjs` reads live tool count and package versions from sibling repo checkouts and writes `src/data/ecosystem-meta.json`.
- **Astro data helpers and components** – `ecosystem-meta.ts` exports `getToolCount()` / `getPackageVersion()`, while `ToolCount.astro` and `PackageVersion.astro` provide drop-in MDX components.
- **docs-sync workflow** now regenerates `ecosystem-meta.json` during CI before committing docs.

### Changed
- Replaced hardcoded “64 tools” references with `<ToolCount />` in cks-mcp documentation and cks-studio architecture page.
- Converted several Markdown pages to MDX to support the new components.
- Fixed internal links after file renames.

### Notes
- Build never fails if sibling repos are absent; committed metadata is used as fallback.

---

## [0.2.0] - 2026-08-20

### Added
- **Automated documentation sync** – new `Sync Ecosystem Docs` GitHub Actions workflow and `scripts/sync-docs.py` that synchronize documentation from `cks-core`, `cks-runtime`, `cks-mcp`, and `cks-studio` into `src/content/docs/ecosystem/`.
- Manual sync triggers via `workflow_dispatch`, plus an optional nightly schedule.
- `docs-sync.config.json` for source/destination mappings, protected paths, exclude rules, and orphan handling.

### Changed
- Initial synchronized ecosystem documentation is now available under `src/content/docs/ecosystem/`.
- Website-specific curated pages remain unchanged.

### Notes
- The sync is idempotent and only creates a commit when upstream content changes.

---

## [0.1.6] - 2026-08-14

### Fixed
- **Absolute link paths** – corrected internal links to include the `/cks-website/` base path across 404, FAQ, and home page, fixing navigation when hosted under GitHub Pages.
- **Hero demo link** – interactive demo button now points to the actual demo URL.

### Changed
- **Card styling** – Starlight `Card`/`CardGrid` components on the home page now use the amber brand fill with white text and adjusted link colors for better readability.
- Updated tool count references from 63 to 64.

---

## [0.1.5] - 2026-08-14

### Added
- **Landing/hero home page** – home page rebuilt as a splash-style landing with hero, call-to-action buttons, package/status badges, one-line install command, and a card grid of the five ecosystem projects.
- **FAQ / Troubleshooting page** – new native `details`-accordion FAQ covering installation, model providers, HTTP transport, search/storage, demo, and core concepts.

### Changed
- Updated navigation order: Home → FAQ / Troubleshooting → Quick Start → Demo.
- Added custom styles for landing pills, install block, and FAQ accordion.
- Corrected tool count references from 63 to 64.

---

## [0.1.4] - 2026-08-14

### Changed
- **Design token sync with cks-studio** – aligned dark/light text colors, border hairlines, and font stacks. The site now matches studio’s exact light-theme `--color-text-primary` / `--color-text-secondary` and border values.
- **Self-hosted fonts** – Manrope and JetBrains Mono are now loaded from local `@fontsource` packages instead of a CDN, matching cks-studio’s self-hosted font setup.

---

## [0.1.3] - 2026-08-12

### Fixed
- **Sidebar balance** – right sidebar/TOC no longer widens disproportionately on large screens; content column now centers in available space.

---

## [0.1.2] - 2026-08-12

### Changed
- **Favicon** – removed dark background, leaving only the amber nodes for better visibility at small sizes.
- **Logo** – recoloured from violet to amber (`#e8a33d`) to match the brand palette.

### Fixed
- **Code blocks on light theme** – no longer forced to a dark background; `--cks-surface-raised` now respects the active theme.
- **Surface tone differentiation** – nav, sidebar, and content areas now have subtly distinct backgrounds in both dark and light themes.
- **Outdated tool count** – Home and Quickstart pages now show the correct number of tools (63), matching `cks-mcp/docs/tools/index.md`.

### Added
- **cks-studio** mentioned in the Home page, Quickstart guide, and Projects table, including quick-start instructions (`npm install && npm run dev`).

---

## [0.1.1] - 2026-08-12

### Fixed
- **Theme switcher** – restored upstream Starlight API in `ThemeProvider.astro` so the light/dark/auto toggle works again (defaults to dark).
- **Duplicate headings** – removed redundant `# Title` from 98 Markdown files; Starlight already renders the title from frontmatter.
- **Favicon** – replaced generic compass with a graphite‑amber CKS node icon.
- **Content width** – increased `--sl-content-width` from 45rem to 60rem and reduced `--sl-sidebar-width` from 18.75rem to 16rem for a more spacious reading area.

---

## [0.1.0] - 2026-08-12

### Added
- Custom 404 page with project‑themed humour (“CITATION_HALLUCINATION”).
- OG / Twitter meta tags (`og:type`, `og:site_name`, `og:image`, `twitter:card`, `theme-color`) injected globally via Starlight’s `head` config.
- Proper 1200×630 OG card image (`public/og-card.png`) to replace the temporary favicon fallback.
- `starlight-llms-txt` plugin — auto‑generates `llms.txt`, `llms-full.txt`, and `llms-small.txt` on build.
- `starlight-copy-button` plugin — adds a “Copy page” button to every documentation page.
- `favicon.svg` replaced with a CKS‑branded icon.

### Changed
- All Starlight boilerplate removed: `guides/example.md`, `reference/example.md`, and `houston.webp` are deleted.
- Sidebar fully collapsed by default (`collapsed: true` on every group and auto‑generated directory).
- Demo asset paths fixed to use relative URLs; conflicting `index.html` and `manifest.webmanifest` excluded from the demo bundle.
- README rewritten for the CKS ecosystem.

---

## Notes

This is the first public reference implementation of the CKS Website Standard.