# Changelog

All notable changes to CKS Website will be documented in this file.

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