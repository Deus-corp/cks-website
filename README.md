# CKS Website

> Documentation site and interactive demo for the Canonical Knowledge Structure ecosystem.

![Astro](https://img.shields.io/badge/astro-7.2-8b5cf6)
![Starlight](https://img.shields.io/badge/starlight-0.41-8b5cf6)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)

The **CKS Website** is the public face of the CKS project. It hosts the
complete documentation for all four CKS repositories and an interactive,
in‑browser demo of `cks-studio` loaded with the full CKS ecosystem graph.

The site is built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build), and is automatically deployed
to GitHub Pages on every push to `main`.

---

# Ecosystem

CKS Website completes the CKS toolchain:

| Project | Description | Repository |
|---------|-------------|------------|
| **cks-core** | Canonical semantic engine – the single source of canonical truth. | [Deus-corp/cks-core](https://github.com/Deus-corp/cks-core) |
| **cks-runtime** | Operational environment – sessions, transactions, persistence. | [Deus-corp/cks-runtime](https://github.com/Deus-corp/cks-runtime) |
| **cks-mcp** | MCP server – exposes CKS to LLMs and autonomous agents. | [Deus-corp/cks-mcp](https://github.com/Deus-corp/cks-mcp) |
| **cks-studio** | Visual workspace – explore, monitor, and manage knowledge graphs. | [Deus-corp/cks-studio](https://github.com/Deus-corp/cks-studio) |
| **cks-website** | Documentation & demo site (this repository). | [Deus-corp/cks-website](https://github.com/Deus-corp/cks-website) |

---

# Quick Start

```bash
git clone https://github.com/Deus-corp/cks-website.git
cd cks-website
npm install
npm run dev
```

Open `http://localhost:4321` to browse the documentation locally.

To build the production site:

```bash
npm run build
```

The output is written to `dist/`.

---

# Interactive Demo

The website includes a fully functional demo of
[`cks-studio`](https://github.com/Deus-corp/cks-studio) running entirely
in the browser — no server required. The demo is pre‑loaded with the CKS
ecosystem graph and supports graph exploration, gallery browsing, and the
pipeline monitor.

[Open the interactive demo &rarr;](https://deus-corp.github.io/cks-website/demo/)

---

# Contributing

Contributions are welcome! Please open an issue or pull request in the
[GitHub repository](https://github.com/Deus-corp/cks-website). See the
[CKS Core repository](https://github.com/Deus-corp/cks-core) for overall
project conventions.

---

# License

MIT