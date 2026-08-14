# CKS Website Roadmap

This roadmap tracks the public documentation site and interactive demo for the CKS ecosystem.

Built on Astro + Starlight. The site itself does not own any CKS business logic; it documents the other repositories and embeds a static build of `cks-studio` as an interactive demo.

---

## Current Status (August 2026)

- Starlight documentation site with pages for all five CKS repositories.
- Embedded static demo of `cks-studio` (`/demo/`) loaded with the full `cks-ecosystem` graph.
- Light/dark theme with custom CKS brand tokens.
- Custom 404, OG card, `llms.txt`, copy button, and collapsed sidebar groups.
- Relative asset paths for GitHub Pages compatibility.

## Completed

- Initial Starlight site (v0.1.0).
- Theme switching, favicon, logo, custom 404, OG meta (v0.1.1).
- Light-theme fixes, content width, brand colours, and tool count updates (v0.1.2).
- Sidebar/TOC balance fix for wide layouts.

## Next Up

### Short term
- Add a **roadmap page** to the docs that links to this file.
- Add a **demo landing page** with a proper call-to-action and feature highlights.
- Add a **search page** or improve Starlight’s built-in search visibility.

### Medium term
- **Version documentation** for each repo release (e.g., `/release-notes/`).
- **Automated demo update workflow** — already handled in `cks-studio`; ensure the website side documents the trigger and includes a manual fallback.
- **Internationalization (i18n)** skeleton.

### Long term
- **Federated search** across docs, demo metadata, and public graph gallery.
- **Analytics** for demo usage and docs pages.