# `src/web/web.service.ts`

## How to read this file

1. `status` — which keys exist (booleans only, no secrets).
2. `search` — Tavily first, else Brave.
3. `readPage` — Jina, then Playwright if needed.
4. Private methods — one provider each.

## What it does

Search the public web and turn a URL into text for the model.

## Why it exists

Ollama cannot go online. This is the internet tool. Jina is fast and often enough. Playwright (or Browserless) is for JS-heavy career pages.

## Lifecycle

Each `search` / `readPage` is one request. Playwright launches (or connects) a browser, reads `body` text, then **closes** the browser in `finally`.

## Dependencies and connections

```
.env keys → WebService
  Tavily or Brave → search results
  Jina r.jina.ai → page text
  Playwright / BROWSERLESS_WS → fallback page text
```

Does not call Ollama or Gmail.

## TypeScript walkthrough

**`search`.** If neither key is set, 503 with a clear message.

**`readPage`.** If Jina returns fewer than 200 characters, try Playwright. Truncate to 15000 chars so one page cannot blow the model context.

**`readJina`.** `GET https://r.jina.ai/` + your URL. Optional `JINA_API_KEY` as Bearer. Failed Jina → empty string, not a throw (so Playwright can run).

**`readPlaywright`.** `BROWSERLESS_WS` set → `chromium.connectOverCDP(ws)` (hosted Chrome). Empty → `chromium.launch({ headless: true })` (the browser `npx playwright install chromium` downloaded). `page.goto` 20s timeout. `innerText` of `body`.
