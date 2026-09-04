# Agent notes

NestJS 12 API for a local personal assistant.

## Setup

```bash
npm install
copy .env.example .env
npm run start:dev
```

- `GET /` returns `Hello World!`
- `GET /ollama/health` lists local Ollama models
- `GET /gmail/status` — OAuth env + whether you have connected
- `GET /gmail/connect` — browser login (see [docs/gmail.md](docs/gmail.md))
- `GET /gmail/messages` — recent mail after connect

Server port comes from `PORT` (default 3000).

## Layout

Ollama HTTP lives only in `src/ollama/`. Gmail OAuth/API lives only in `src/gmail/`. Folder why: [docs/ollama.md](docs/ollama.md), [docs/gmail.md](docs/gmail.md). Per-file TypeScript walkthroughs: [docs/README.md](docs/README.md).

## Env

See `.env.example`. `src/config/env.ts` validates values. Use `ConfigService` in app code.

## Tests and lint

```bash
npm test
npm run test:e2e
npm run lint
```
