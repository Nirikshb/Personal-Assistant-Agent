# Agent

This module does **not** talk to Ollama or Gmail itself. It **injects** `GmailService` and `OllamaService`, then combines them.

First real assistant action: **inbox brief**.

- `GET /agent/inbox` (optional `?max=5`)
- Needs Parts A–C in [you_to_do.md](you_to_do.md) to already pass
- Still **does not send mail**

| File | Doc |
|---|---|
| `agent.module.ts` | [docs/src/agent/agent.module.md](src/agent/agent.module.md) |
| `agent.service.ts` | [docs/src/agent/agent.service.md](src/agent/agent.service.md) |
| `agent.controller.ts` | [docs/src/agent/agent.controller.md](src/agent/agent.controller.md) |
