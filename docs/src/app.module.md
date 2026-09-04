# `src/app.module.ts`

## How to read this file

1. Imports — which pieces exist.
2. `createObserveModule` — ignore until you turn Observe on.
3. `validateEnv(process.env)` — needed *before* the `@Module` decorator so Observe can be skipped.
4. `imports` array — Config, Ollama, maybe Observe.
5. `controllers` / `providers` — still the hello-world starter.

## What it does

Root Nest module. It says what is in the application.

## Why it exists

Nest requires one root module. Feature modules (Ollama today, Gmail later) get **imported** here instead of dumping everything into `AppService`.

## Lifecycle

Evaluated when `main.ts` imports it. Nest then instantiates imported modules, then controllers/providers. One process, one `AppModule`.

## Dependencies and connections

```
main.ts → AppModule → ConfigModule (global env)
                    → OllamaModule → OllamaService, OllamaController
                    → ObserveModule (only if keys are set)
                    → AppController → AppService
```

`OllamaModule` is listed next to Config so `/ollama/*` exists as soon as the server starts.

## TypeScript walkthrough

**`export const { ObserveModule, ObserveInstrument }`.** `createObserveModule()` returns two things. Destructuring pulls both out. `ObserveInstrument` is for `main.ts`; `ObserveModule` is for `imports`.

**`const env = validateEnv(process.env)`.** Runs at *module load*, not inside a request. Needed because `ObserveModule.forRoot(...)` cannot wait for `ConfigService` inside a request.

**`@Module({ ... })`.** Decorator: Nest metadata. `imports` are other modules. `controllers` handle HTTP. `providers` are injectable classes.

**`...(isObserveEnabled(env) ? [ObserveModule.forRoot({...})] : [])`.** Spread either one module or nothing. Empty Observe keys → empty array → Observe stays off.

**`export class AppModule {}`.** Empty class. The decorator is the real config.
