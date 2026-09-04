# `src/ollama/ollama.controller.ts`

## How to read this file

1. `@Controller('ollama')` — URL prefix `/ollama`.
2. Constructor — gets `OllamaService` (does not `fetch` itself).
3. `GET health` then `POST chat`.
4. In `chat`, the `prompt` check — that is the only logic here.

## What it does

HTTP door to the Ollama service. Smoke test so you can hit the API without writing an agent UI.

- `GET /ollama/health`
- `POST /ollama/chat` body `{ "prompt": "..." }`

## Why it exists

Controllers stay thin: validate the request, call the service. Ollama JSON stays in the service. Same idea as a Vue page calling `useOllama().chat()` — here the “page” is HTTP.

## Lifecycle

Nest creates the controller at startup. A method runs only when that route is hit, then ends when the Promise from the service settles. Nest turns thrown `BadRequestException` into **400** and `ServiceUnavailableException` into **503**.

## Dependencies and connections

```
Client  →  OllamaController  →  OllamaService  →  Ollama
```

Does not import `ConfigService` or `fetch`. Prefix comes from `@Controller('ollama')`, not from env.

## TypeScript walkthrough

**`@Controller('ollama')`.** Class decorator. All routes start with `/ollama`.

**`constructor(private readonly ollama: OllamaService)`.** Nest passes the singleton from `OllamaModule`.

**`@Get('health')`.** `GET /ollama/health`. Return value is JSON. No extra type on the method; Nest serializes the service result.

**`@Post('chat')` + `@Body() body: { prompt?: string }`.** `?` means `prompt` may be missing. That is why we check `body?.prompt?.trim()`.

**`trim()`.** Whitespace-only counts as empty → 400.

**`throw new BadRequestException('prompt is required')`.** Nest exception filter maps this to HTTP 400. We do not `res.status(400)` like Express.

**`return this.ollama.chat(prompt)`.** Returning a Promise is enough; Nest waits. No extra `async` needed (you could add it; it would not change behavior).
