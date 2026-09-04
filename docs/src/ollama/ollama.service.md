# `src/ollama/ollama.service.ts`

## How to read this file

1. Class + constructor — Nest injects `ConfigService`.
2. `health` then `chat` — the two public operations.
3. `baseUrl` — where Ollama lives.
4. `request` — the only `fetch`. Read this last; both public methods use it.

## What it does

Talks to local Ollama over HTTP. `health` lists models (`GET /api/tags`). `chat` sends one user prompt (`POST /api/chat`, no stream) and returns `{ model, reply }`.

## Why it exists

No other file should know Ollama’s URL or JSON shape. This is the anti-corruption layer. Not an agent: one prompt in, one string out.

## Lifecycle

- Nest constructs **one** instance at startup (`constructor`).
- Idle until a controller (or later, another service) calls `health` or `chat`.
- Each call: `fetch` → wait → JSON → return or throw `503`.
- No connection object to close. Each request is a new HTTP call.

## Dependencies and connections

```
.env  →  ConfigService  →  OllamaService.fetch  →  Ollama :11434
                ↑
     OllamaController (today)
     future modules that import OllamaModule (later)
```

- **In:** `ConfigService` (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`).
- **Out:** `http://127.0.0.1:11434` (or whatever you set).
- **Errors:** `ServiceUnavailableException` → HTTP 503.

## TypeScript walkthrough

**`@Injectable()`.** Lets Nest inject this class.

**`constructor(private readonly config: ConfigService)`.** Shortcut: declare + assign. `private` = only this class. `readonly` = do not replace `config`. Frontend analog: `const { $config } = useNuxtApp()` but it is constructor injection, not a composable.

**`async health(): Promise<{ ok: true; models: string[] }>`.** Returns a Promise. The object always has `ok: true` if it returns; failure throws instead.

**`data.models.map(...).filter(Boolean)`.** Ollama’s list is `{ models: [{ name: "qwen3:14b", ... }] }`. We keep names only. `filter(Boolean)` drops empty names. Inline `{ name?: string }` is a small shape, not a project-wide type.

**`async chat(prompt: string)`.** `prompt` is a string. `?? ''` if model env is missing, then we throw 503 — better than calling Ollama with no model.

**`stream: false`.** One JSON body, not a chunked stream.

**`data.message?.content`.** Optional chaining: if `message` is missing, `content` is `undefined`, then we throw.

**`private baseUrl()` / `private request(...)`.** `private` = not callable from the controller. `body?: Record<string, unknown>` — optional object. No `body` → GET. With `body` → POST JSON.

**`Promise<any>` on `request`.** Ollama’s JSON is loose. We do not model their whole API. Public methods narrow what we need (`models`, `message.content`).
