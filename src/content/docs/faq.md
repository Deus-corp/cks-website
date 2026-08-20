---
title: "FAQ / Troubleshooting"
description: "Common questions and fixes for installing and running cks-mcp, cks-studio, and the rest of the CKS ecosystem."
---

import ToolCount from '../../components/ToolCount.astro';

Short, practical answers to the questions that come up most when installing
and running CKS. If something isn't covered here, check the
[Quick Start guide](/cks-website/quickstart/) or open an issue on
[GitHub](https://github.com/PunctumActus/cks-core/issues).

## Installation

<details>
<summary>How do I install cks-mcp?</summary>

One command installs the entire backend, including `cks-runtime` and
`cks-core` as dependencies:

```bash
pip install cks-mcp
```

Verify it installed correctly:

```bash
cks-mcp --version
```

See the [Quick Start guide](/cks-website/quickstart/) for connecting it to Claude
Desktop or `cks-studio` afterwards.

</details>

<details>
<summary>The `cks-mcp` command is not found — what do I do?</summary>

This is almost always a `PATH` issue with how `pip` installed the console
script. Try, in order:

1. **Confirm the package is actually installed:**
   ```bash
   pip show cks-mcp
   ```
2. **Use the module form instead of the script**, which doesn't depend on
   `PATH` at all:
   ```bash
   python -m cks_mcp
   ```
3. **If you installed with `--user`**, make sure your user script
   directory is on `PATH` (e.g. `~/.local/bin` on Linux/macOS,
   `%APPDATA%\Python\PythonXY\Scripts` on Windows).
4. **If you're using a virtual environment**, activate it first, or point
   Claude Desktop's config at the venv's absolute path (see next question).

</details>

<details>
<summary>Claude Desktop can't find cks-mcp even though it works in my terminal</summary>

Claude Desktop launches the command directly — it does **not** inherit your
shell's activated virtual environment. If `cks-mcp` was installed into a
venv, use the absolute path to that venv's executable in
`claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cks-mcp": {
      "command": "/path/to/venv/bin/cks-mcp"
    }
  }
}
```

On Windows, that path typically ends in
`...\venv\Scripts\cks-mcp.exe`.

</details>

## Model providers

<details>
<summary>Ollama isn't available — what are my options on macOS?</summary>

Ollama does not support macOS 12.7 (Monterey) and earlier. If you're on an
unsupported macOS version, use a hosted OpenAI-compatible provider instead
— OpenRouter, Anthropic, or OpenAI all work with the same `ai_chat` /
`construct_knowledge` tools. Set the provider and API key via environment
variables or `cks-mcp`'s config, then confirm with:

```bash
cks-mcp
# then, from an MCP client:
get_llm_status
```

</details>

<details>
<summary>I'm hitting rate limits or tool-calling failures with OpenRouter's free models</summary>

Free-tier OpenRouter models are shared and rate-limited, and not all of
them support tool/function calling reliably. If you see truncated
responses, silent tool-call failures, or 429s:

- Switch to a model on OpenRouter that explicitly supports tool calling
  (check the model's capability tags on openrouter.ai).
- Add a paid OpenRouter key, or fall back to Anthropic/OpenAI directly for
  anything that drives `construct_knowledge` or `ai_chat` in a loop.
- Retry with backoff — transient 429s are common on free models under
  load and usually clear within seconds.

</details>

## Networking & transport

<details>
<summary>How do I run cks-mcp over HTTP, and what about CORS for cks-studio?</summary>

By default `cks-mcp` speaks stdio (used by Claude Desktop). To let
`cks-studio` or another browser client connect, run it in HTTP mode:

```bash
cks-mcp serve
```

`cks-studio` talks to this HTTP endpoint from the browser, so the server
needs permissive CORS for your studio's origin (default
`http://localhost:5173` in dev). If requests are being blocked, check the
CORS/allowed-origins setting documented in the
[cks-mcp security model](/cks-website/ecosystem/cks-mcp/docs/security/) and make sure it includes
your studio's actual origin (including port).

</details>

<details>
<summary>How do I set CKS_MCP_HTTP_PORT?</summary>

Set it as an environment variable before starting the server:

```bash
export CKS_MCP_HTTP_PORT=8765
cks-mcp serve
```

On Windows (PowerShell):

```powershell
$env:CKS_MCP_HTTP_PORT = "8765"
cks-mcp serve
```

Then point `cks-studio`'s `.env.local` at that same port.

</details>

## Search & storage

<details>
<summary>Can I use semantic search without any API keys?</summary>

Yes. `cks-mcp` supports [fastembed](https://github.com/qdrant/fastembed)
for fully local embeddings — no HuggingFace or provider API key required
and no data leaves your machine. It's the default fallback when no
embedding provider key is configured; see
[Local Embeddings](/cks-website/case-studies/local-embeddings/) for the case study and
setup details.

</details>

<details>
<summary>Do I need PostgreSQL, or is SQLite enough?</summary>

SQLite is the default and is enough for local use, single-user setups, and
trying things out — no setup required. Use PostgreSQL if you need
concurrent multi-writer access, a shared/networked deployment, or larger
graphs. Point `cks-runtime` at a Postgres instance via its storage
connection string/environment variable; see the
[storage specification](/cks-website/ecosystem/cks-runtime/docs/standards/runtime/spec-006_storage/)
for the exact configuration keys.

</details>

<details>
<summary>How do I reset the SQLite database or change the storage path?</summary>

`cks-runtime`'s default SQLite storage lives at a path you can override
directly. To reset everything, stop `cks-mcp`, then delete or move the
database file:

```bash
cks-mcp stop   # or Ctrl+C if running in foreground
rm ~/.cks/storage.db   # default path — confirm yours via config/env
cks-mcp serve
```

A fresh, empty database is created automatically on next start. To use a
different path instead of resetting, set the storage path environment
variable/config value before starting `cks-mcp` — see the
[storage specification](/cks-website/ecosystem/cks-runtime/docs/standards/runtime/spec-006_storage/).

</details>

## Demo & concepts

<details>
<summary>How do I run the static demo?</summary>

No install needed — open the [Demo page](/cks-website/demo/) and click **Open Demo**,
or embed it locally. It runs `cks-studio` entirely client-side against a
bundled snapshot of the ecosystem graph, so Graph, Gallery, and Pipeline
Monitor all work out of the box. AI Chat, Agents, and Evolve are disabled
in the static demo since they need a live `cks-mcp` server — for those,
follow the [Quick Start](/cks-website/quickstart/) to run the real backend.

</details>

<details>
<summary>What's the difference between cks-core, cks-runtime, and cks-mcp?</summary>

They're three layers of the same stack:

- **cks-core** — the immutable semantic engine. Defines canonical
  knowledge objects, validates them against formal constraints, and
  applies structural evolution. No sessions, no server, just the data
  model and its rules.
- **cks-runtime** — the operational layer on top of cks-core. Adds
  sessions, transactions, branching/merging, and version history — the
  stateful parts.
- **cks-mcp** — the MCP server that exposes cks-runtime (and therefore
  cks-core) to LLMs like Claude, via <ToolCount /> tools plus MCP Resources and
  Prompts.

`cks-studio` is a fourth, separate piece — a browser UI that talks to
`cks-mcp` the same way an LLM does.

</details>