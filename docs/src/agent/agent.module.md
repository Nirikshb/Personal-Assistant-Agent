# `src/agent/agent.module.ts`

## How to read this file

1. `imports` — Gmail and Ollama modules (that is how we get their services).
2. `controllers` / `providers` — this feature’s HTTP and logic.
3. Empty class.

## What it does

Registers the agent routes and `AgentService`.

## Why it exists

The assistant should orchestrate. It should not contain `fetch` to Ollama or `googleapis`. Importing `GmailModule` and `OllamaModule` is how Nest shares those singletons.

## Lifecycle

Created when `AppModule` imports `AgentModule`. One `AgentService` for the process.

## Dependencies and connections

```
AppModule → AgentModule → GmailModule (GmailService)
                       → OllamaModule (OllamaService)
                       → AgentController
```

No `exports` yet — nothing else injects the agent.

## TypeScript walkthrough

**`imports: [GmailModule, OllamaModule]`.** Required. Without these, Nest cannot inject `GmailService` / `OllamaService` into `AgentService`.

**No `exports`.** Other modules do not need `AgentService` today.
