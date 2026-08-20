---
title: Demo
description: Explore the CKS ecosystem graph directly in your browser.
---

Explore the CKS ecosystem graph directly in your browser — no server, no
installation.

The static demo below runs [cks-studio](ecosystem/cks-studio/README.md) entirely
client-side, loaded with a bundled snapshot of the ecosystem graph
(`scripts/cks-ecosystem.json` from the cks-studio repo). It's the same
graph explorer, gallery, and pipeline monitor UI as the full studio, just
without a live [cks-mcp](ecosystem/cks-mcp/docs/index.md) server behind it.

<a href="/cks-website/demo/demo.html" target="_blank" rel="noopener" class="cks-cta">
	Open Demo &rarr;
</a>

<div class="cks-demo-frame">
	<iframe
		src="/cks-website/demo/demo.html"
		title="CKS Studio interactive demo"
	></iframe>
</div>

---

## What you can do

- **Graph** — pan, zoom, and inspect every object and relation in the
  ecosystem graph (2D and 3D views).
- **Gallery** — browse the bundled `cks-ecosystem` graph entry.
- **Pipeline Monitor** — see the pipeline monitor UI rendered against the
  same static data.

## What's disabled

AI Chat, Agents, and Evolve all require a running `cks-mcp` server to talk
to, so they're turned off in the static demo. For the full experience:

```bash
pip install cks-mcp
cks-mcp serve
```

Then point [cks-studio](https://github.com/PunctumActus/cks-studio) at your
local server and connect with a real session.

:::note[Source]
The demo page itself lives in the cks-studio repository at
`demo.html` / `src/demo.tsx` (at the repo root, next to `index.html` —
not under `public/`, so Vite bundles it as a second build entry point
rather than copying it verbatim), built alongside the main studio
bundle and published here as a static file.
:::