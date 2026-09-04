# `src/config/env.ts`

## How to read this file

1. `import 'dotenv/config'` — loads `.env` into `process.env`.
2. `AppEnv` — the shape we allow.
3. `readString` — helper, skip until you see it used.
4. `validateEnv` — the function ConfigModule and bootstrap call.
5. `isObserveEnabled` — tiny flag for `AppModule`.

## What it does

Reads env, fills defaults, checks `PORT`, returns a typed object.

## Why it exists

So controllers never call `process.env` directly, and a bad `PORT` fails at startup instead of at runtime.

## Lifecycle

- First import (from `app.module.ts`) loads dotenv.
- `validateEnv` runs at startup (AppModule + `main.ts`) and again inside `ConfigModule`.
- Not per request.

## Dependencies and connections

- **Reads:** `.env` via dotenv, then `process.env`.
- **Used by:** `AppModule`, `main.ts`, `ConfigModule.forRoot({ validate: validateEnv })`.
- **Consumed later as:** `ConfigService.get('OLLAMA_BASE_URL')`, `GOOGLE_CLIENT_ID`, etc. Keys must match this file.
- **Does not talk to Ollama, Gmail, or the web.** It only stores names of settings.

## TypeScript walkthrough

**`export type AppEnv`.** A type, not a class. `{ PORT: number; OLLAMA_MODEL: string; GOOGLE_CLIENT_ID: string; ... }` is the contract.

**`Record<string, unknown>`.** “Object with string keys, we do not trust values yet.” That is what `process.env` looks like to us.

**`readString(config, key, fallback)`.** If missing or `''`, use fallback. Always returns `string`.

**`validateEnv`.** `Number(config.PORT ?? 3000)` — `??` means “if nullish, use 3000.” Then integer + range check. Returns one `AppEnv` object.

**`Pick<AppEnv, 'NEST_OBSERVE_APP_KEY' | 'NEST_OBSERVE_APP_SECRET'>`.** “Only these two fields needed.” `isObserveEnabled` is true only when both are non-empty.
