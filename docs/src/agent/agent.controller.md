# `src/agent/agent.controller.ts`

## How to read this file

1. `@Controller('agent')` — prefix `/agent`.
2. One route: `GET inbox`.
3. Same `max` query parsing as Gmail’s messages route.

## What it does

HTTP door: `GET /agent/inbox?max=5`.

## Why it exists

Thin controller. No prompts, no Gmail API.

## Lifecycle

One request → `inboxBrief` → JSON. Can be slow: Gmail list + one local LLM call.

## Dependencies and connections

```
Client → AgentController → AgentService
```

## TypeScript walkthrough

**`@Get('inbox')`.** Full path `/agent/inbox`.

**`@Query('max') max?: string`.** Query strings are strings. `Number(...)` + `Number.isFinite` copies the Gmail controller so we do not invent a new parser.
