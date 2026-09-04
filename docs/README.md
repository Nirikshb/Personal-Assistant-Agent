# Docs

Each source file the agent adds gets a matching page under `docs/src/`, same folders as `src/`.

That is how you should learn the TypeScript: one file at a time, same sections every time.

Template (do not skip sections):

1. How to read this file
2. What it does
3. Why it exists
4. Lifecycle
5. Dependencies and connections
6. TypeScript walkthrough

## Human setup (two files)

The AI cannot finish Google login or real secrets. Use this pair only:

| File | Read it as |
|---|---|
| [you_to_do.md](you_to_do.md) | **For you to do** — do this, expect that |
| [you_to_do_explained.md](you_to_do_explained.md) | Why those steps exist and how they connect to the app |

## Index

| Source | Doc |
|---|---|
| `src/main.ts` | [main](src/main.md) |
| `src/app.module.ts` | [app.module](src/app.module.md) |
| `src/config/env.ts` | [env](src/config/env.md) |
| `src/ollama/ollama.module.ts` | [ollama.module](src/ollama/ollama.module.md) |
| `src/ollama/ollama.service.ts` | [ollama.service](src/ollama/ollama.service.md) |
| `src/ollama/ollama.controller.ts` | [ollama.controller](src/ollama/ollama.controller.md) |
| `src/gmail/gmail.module.ts` | [gmail.module](src/gmail/gmail.module.md) |
| `src/gmail/gmail.service.ts` | [gmail.service](src/gmail/gmail.service.md) |
| `src/gmail/gmail.controller.ts` | [gmail.controller](src/gmail/gmail.controller.md) |

Folder overviews: [Ollama](ollama.md) · [Gmail](gmail.md)
