---
title: "cks-studio"
description: "cks-studio"
---

> Interactive visual workspace for the Canonical Knowledge Structure ecosystem.

**CKS Studio** is the graphical interface of the CKS ecosystem — a
single-page application where you can explore knowledge graphs, inspect
inference chains, review CRDT forks, monitor agent pipelines, browse the
public graph gallery, and chat with an LLM that can call tools and
modify the graph, all connected to one or more `cks-mcp` servers over
the Model Context Protocol. Currently at **v0.6.6**.

It complements the backend repositories by providing a visual layer
that makes the canonical knowledge immediately accessible to humans,
while remaining fully driven by the same MCP tools available to LLMs.

## Try It Now

No install required — the [interactive demo](/cks-website/demo/) runs
entirely in your browser, pre-loaded with the CKS ecosystem's own
knowledge graph (277 objects, 158 relations).

## Key Features

| Feature | Description |
|---------|-------------|
| Graph Exploration | Interactive canvas (React Flow + Dagre), Cmd/Ctrl+K search, type filtering, drill-down via `query_subgraph`. |
| 2D / 3D View | Toggle to a force-directed 3D canvas (Three.js) for wide graphs with many same-rank nodes. |
| Inference Chain Inspector | Trace `depends_on` edges from a conclusion back to its axioms. |
| CRDT Fork Diff | LCA-based side-by-side comparison of conflicting object versions. |
| Pipeline Monitor | Live status of objects moving through Researcher → Reviewer → Synthesizer → Arbiter. |
| Agent Observability & Control | Real-time status of every background sweeper, plus start/stop/request-stop for sweepers and standalone agents. |
| Graph Gallery | Browse, search, and check the health of public graphs registered via `register_graph`. |
| AI Chat | Built-in assistant, scoped to the current session, that can call the same MCP tools to read and mutate the graph. |
| PWA | Installable as a standalone desktop app from Chrome/Edge/Safari. |

## Architecture

CKS Studio is a thin, stateless frontend — all knowledge and logic live
in the backend; the studio only reads and sends commands through MCP.

```
┌──────────────────┐       MCP (JSON-RPC)        ┌──────────────┐
│   CKS Studio     │ ◄─────────────────────────► │   cks-mcp    │
│  (React SPA)     │            HTTP              │  (Python)    │
└──────────────────┘                              └──────────────┘
```

See [Architecture](architecture.md) for the full breakdown of routing,
state management, the MCP client layer, and how the standalone demo is
built.

## Learn More

- [Architecture](architecture.md)
- [Architecture Decision Records](adr/ADR-001%20AI%20Assistant%20Chat%20Panel.md) — AI chat panel, 3D graph view, graph gallery, agent control, standalone demo
- [GitHub repository](https://github.com/PunctumActus/cks-studio)
