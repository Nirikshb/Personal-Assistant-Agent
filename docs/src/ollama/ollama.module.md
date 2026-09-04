# `src/ollama/ollama.module.ts`

## How to read this file

1. Imports of the controller and service.
2. `@Module` — three lists: controllers, providers, exports.
3. Empty class body.

## What it does

Registers Ollama HTTP routes and the Ollama client. Exports the service so other modules can inject it later without talking to Ollama themselves.

## Why it exists

Keeps Ollama in one corner. `AppModule` only imports this module. That is the Nest version of a frontend composable: one registration, reuse by injection.

## Lifecycle

Created when `AppModule` imports `OllamaModule`. Nest constructs `OllamaService` once (singleton) and attaches `OllamaController`. Lives for the whole process.

## Dependencies and connections

- **Imported by:** `AppModule`.
- **Owns:** `OllamaController`, `OllamaService`.
- **Does not import ConfigModule** — Config is already `isGlobal: true`.
- **Outbound:** none. No Gmail, no agent loop.

## TypeScript walkthrough

**`@Module({ controllers, providers, exports })`.**

- `controllers` — classes with `@Get` / `@Post`.
- `providers` — injectable classes. Nest can `new OllamaService(...)` for you.
- `exports` — without this, only *this* module could inject `OllamaService`. With it, a future `AgentModule` can import `OllamaModule` and inject the same singleton.

**`export class OllamaModule {}`.** Marker class. No methods on purpose.
