# `src/main.ts`

## How to read this file

1. Imports at the top — what this process needs to boot.
2. `bootstrap` — the only function. Read it as “start the HTTP server.”
3. The last line `await bootstrap()` — Node actually runs that.

## What it does

Starts the Nest app and listens on `PORT` from env.

## Why it exists

Every Nest app needs one entry file. This is it. Routes and Ollama are not defined here so boot stays short.

## Lifecycle

1. Node loads this file.
2. Importing `AppModule` loads env validation and the rest of the graph.
3. `NestFactory.create` builds the app (controllers, services).
4. `app.listen` opens the port.
5. The process stays alive until you stop it.

## Dependencies and connections

- **Imports:** `AppModule`, `ObserveInstrument` (optional Nest Observe hook), `validateEnv`.
- **Does not import:** `OllamaService`. HTTP to Ollama starts only if a request hits `/ollama/*`.
- **Env:** `PORT` after `validateEnv`.

## TypeScript walkthrough

**Imports.** `NestFactory` builds the app. `.js` on local imports is ESM (TypeScript compiles to files that Node expects with `.js`).

**`async function bootstrap`.** Async because `listen` is a Promise. `const env = validateEnv(process.env)` — `process.env` is stringly-typed; `validateEnv` returns a typed object so `env.PORT` is a number.

**`NestFactory.create(AppModule, { instrument: ObserveInstrument })`.** Second argument is Nest Observe wiring. It is safe even when Observe is turned off in `AppModule`.

**`await app.listen(env.PORT)`.** Binds HTTP.

**`await bootstrap()` at the bottom.** Not wrapped in a `main()`. The file *is* the program.
