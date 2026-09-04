# `src/web/web.controller.ts`

## How to read this file

1. `@Controller('web')`.
2. `status`, then `search`, then `read`.
3. Query params `q` and `url`.

## What it does

Smoke-test HTTP for the web tool. The job-hunt **agent loop** is not here yet.

| Method | Path | Need |
|---|---|---|
| GET | `/web/status` | nothing |
| GET | `/web/search?q=...` | Tavily or Brave key |
| GET | `/web/read?url=...` | network; Jina then Playwright |

## Why it exists

Same idea as `/ollama/health` and `/gmail/status`: prove the tool before the agent uses it.

## Lifecycle

One HTTP request per call. `read` can be slow if Playwright starts.

## Dependencies and connections

```
Client → WebController → WebService
```

## TypeScript walkthrough

**`@Query('q')` / `@Query('url')`.** Strings. Empty → 400, same as Ollama’s missing prompt.
