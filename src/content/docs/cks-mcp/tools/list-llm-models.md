---
title: "List LLM Models (`list_llm_models`)"
---

:::note[Синхронизировано автоматически]
Эта страница подтягивается раз в сутки из [`docs/tools/list-llm-models.md`](https://github.com/PunctumActus/cks-mcp/blob/main/docs/tools/list-llm-models.md) репозитория `cks-mcp`. Вносите правки в исходном репозитории — изменения прямо здесь будут перезаписаны при следующей синхронизации.
:::

# List LLM Models (`list_llm_models`)

Return the list of available models for the current LLM provider
(Ollama, Anthropic, Google Gemini, or OpenAI‑compatible), so a client
UI can offer a model picker before calling `ai_chat` with its optional
`model` argument.

## Usage

```json
{
  "method": "tools/call",
  "params": {
    "name": "list_llm_models",
    "arguments": {}
  }
}
```

## Parameters

None. The tool reads the same environment variables as `get_llm_status`.

## Response

```json
{
  "provider": "ollama",
  "models": [
    { "name": "llama3.2:latest" },
    { "name": "mistral:latest" }
  ]
}
```

- For `"ollama"`, the list comes from `GET {host}/api/tags` and reflects
  the models actually installed on that server (empty if unreachable).
- For `"anthropic"`, `"google"`, and `"openai_compatible"`, a short
  hardcoded list of popular models is returned.
- For `"none"`, `models` is empty.

## Notes

- Takes no `session_id` — provider configuration is server‑wide, not
  per‑session.
- Read‑only; no chat or completion calls are made.
