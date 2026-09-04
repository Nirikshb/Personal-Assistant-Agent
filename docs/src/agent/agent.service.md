# `src/agent/agent.service.ts`

## How to read this file

1. Constructor — two injected services.
2. `inboxBrief` — the only public method.
3. Empty inbox early return.
4. Build a text list, one `ollama.chat` call, return JSON.

## What it does

Loads recent Gmail metadata, asks Ollama to classify (urgent / important / routine / FYI) and write an executive summary. Returns the raw `messages` plus `brief` (model text) and `model` name.

## Why it exists

This is the first “assistant” behaviour. Gmail alone only lists. Ollama alone only chats. The agent is the glue. One Gmail call, one Ollama call — no extra helpers.

## Lifecycle

Runs only when `/agent/inbox` is hit. If Gmail is not connected, `GmailService` throws 503. If Ollama is down or the model name is wrong, `OllamaService` throws 503.

## Dependencies and connections

```
AgentController → AgentService → GmailService.listRecent
                              → OllamaService.chat
```

Does not import `googleapis` or call `:11434` itself.

## TypeScript walkthrough

**`constructor(private readonly gmail, private readonly ollama)`.** Two constructor params = two injections. Same pattern as a composable that uses two other composables.

**`async inboxBrief(max = 10)`.** `max` is forwarded to Gmail (still capped at 20 there).

**`if (messages.length === 0)`.** No model call if there is nothing to classify.

**`.map(...).join('\n')`.** Turns objects into a numbered text block. The model only sees From / Subject / Snippet, not full bodies (we only fetched metadata).

**Array of strings + `.join('\n')` for the prompt.** Easier to read than one huge template string. Instructions stay in this file, not a prompt framework.

**`return { model, messages, brief: reply }`.** `brief` is whatever the model wrote (plain text, not parsed JSON). We do not add types for “Priority enum.”
