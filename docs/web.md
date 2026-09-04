# Web

Internet lives only here. Ollama and Gmail are unchanged.

- **Search:** Tavily if `TAVILY_API_KEY` is set, else Brave if `BRAVE_API_KEY` is set.
- **Read a URL:** Jina Reader first (`r.jina.ai`). If the text is tiny, **Playwright** (local Chromium). If `BROWSERLESS_WS` is set, Playwright connects there instead of launching Chrome on your PC.

Smoke routes (no agent loop yet):

- `GET /web/status`
- `GET /web/search?q=frontend+jobs`
- `GET /web/read?url=https://example.com`

Human keys: [you_to_do.md](you_to_do.md) Part F.

| File | Doc |
|---|---|
| `web.module.ts` | [docs/src/web/web.module.md](src/web/web.module.md) |
| `web.service.ts` | [docs/src/web/web.service.md](src/web/web.service.md) |
| `web.controller.ts` | [docs/src/web/web.controller.md](src/web/web.controller.md) |
