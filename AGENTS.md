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
- `POST /ollama/chat` with `{ "prompt": "..." }` returns a model reply

Server port comes from `PORT` (default 3000).

## Layout

Ollama HTTP lives only in `src/ollama/`. Folder why: [docs/ollama.md](docs/ollama.md). Per-file TypeScript walkthroughs: [docs/README.md](docs/README.md).

## Env

See `.env.example`. `src/config/env.ts` validates values. Use `ConfigService` in app code.

## Tests and lint

```bash
npm test
npm run test:e2e
npm run lint
```
