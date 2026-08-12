---
title: "Quick Start"
description: "Quick Start"
---

Get CKS up and running with your LLM in under 5 minutes.

Two ways in: drive it through **Claude Desktop** (chat, tool calls, no UI to install),
or through **`cks-studio`** (a graph canvas and AI chat panel in the browser). Both
talk to the same `cks-mcp` server, so you can use either — or both at once,
pointed at the same session.

---

## 1. Install

One command installs the entire backend:

```bash
pip install cks-mcp
```

This automatically brings in `cks-runtime`, `cks-core`, and all dependencies.

---

## 2. Connect to Claude Desktop

Add `cks-mcp` to your MCP servers.

1. Open Claude Desktop → **Settings** → **Developer** → **Edit Config**.
2. Add this block to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cks-mcp": {
      "command": "cks-mcp"
    }
  }
}
```

   If `cks-mcp` was installed into a virtual environment rather than your
   global Python, use the absolute path to its executable instead (e.g.
   `/path/to/venv/bin/cks-mcp`) — Claude Desktop launches the command
   directly and won't have your shell's activated environment.

3. Save and restart Claude Desktop (Cmd+Q, then reopen).

After restart, a connector icon will appear — **cks-mcp** with 63 tools is
ready to use.

---

## 2b. Or: Launch cks-studio

Prefer clicking around a graph to typing prompts? `cks-studio` is a
single-page app that connects to `cks-mcp` over HTTP and gives you a graph
canvas, a session gallery, agent-pipeline monitoring, and its own AI chat
panel that can call the same tools:

```bash
git clone https://github.com/Deus-corp/cks-studio.git
cd cks-studio
npm install
cp .env.example .env.local   # point it at your cks-mcp server
npm run dev
```

Open `http://localhost:5173`. See the
[cks-studio repository](https://github.com/Deus-corp/cks-studio) for the
full setup, including the one-command ecosystem demo graph and free-tier
AI chat via OpenRouter.

---

## 3. Your First Experiment

Ask Claude (or type into cks-studio's chat panel):

> Create a knowledge structure about "Quantum Mechanics" with two concepts (Wave-Particle Duality and Superposition). Link them with a relation. Then validate the structure.

Claude will call `validate_knowledge` and report back whether the structure is valid.
If you're in `cks-studio`, watch the graph canvas update live as each tool call lands.

---

## What's Next

- Browse the [Tools Reference](cks-mcp/tools/index.md) — all 63 tools,
  grouped by what they're for, with request/response examples.
- Explore the [cks-core](cks-core/index.md) semantic engine.
- Learn about [cks-runtime](cks-runtime/index.md) sessions and version history.
- Read the [Architecture](cks-mcp/architecture/ARCHITECTURE.md) and
  [Security Model](cks-mcp/security.md) of the MCP server.
- Set up [cks-studio](https://github.com/Deus-corp/cks-studio) for a visual,
  browser-based workspace on top of the same backend.

---

## Need Help?

- [GitHub Issues](https://github.com/Deus-corp/cks-core/issues)
- [Discussions](https://github.com/Deus-corp/cks-core/discussions)
