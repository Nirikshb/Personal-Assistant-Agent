# Ollama

This folder is the only place that talks to local Ollama. Everything else should inject `OllamaService` and call `health()` or `chat()`.

## Why this shape

The app is NestJS, not Nuxt. A Vue `useOllama()` composable does not belong here. Nest’s equivalent is an injectable service inside its own module.

We keep that module in one corner (`src/ollama/`) so Gmail, calendar, and HTTP routes never learn the Ollama URL or `/api/chat` payload. URL and model stay in `.env` and are read through `ConfigService`. Nest already gives us one shared instance of the service (a singleton). That is “global” without a real global variable.

`stream: false` is intentional for this smoke test: one JSON reply is easier to read and test than a stream.

This is **not** the agent yet. No tools, no email, no memory. The goal is: if Ollama is running, we can prove Nest can reach it.

## Try it

1. Start Ollama and pull the model in `.env` (`OLLAMA_MODEL`, default `llama3.2`).
2. `npm run start:dev`
3. Health: `GET http://localhost:3000/ollama/health`
4. Chat: `POST http://localhost:3000/ollama/chat` with `{ "prompt": "Say hello in one sentence." }`

If Ollama is down, those routes return **503**. A missing `prompt` returns **400**.

## Files

| File | Role |
|---|---|
| `ollama.service.ts` | HTTP to Ollama |
| `ollama.controller.ts` | Thin smoke-test routes |
| `ollama.module.ts` | Registers and **exports** the service for later modules |
| `ollama.service.spec.ts` | Mocks `fetch` so tests do not need Ollama running |
