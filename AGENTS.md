# Agent notes

NestJS 12 API for a local personal assistant. Ollama will be wired later.

## Setup

```bash
npm install
copy .env.example .env
npm run start:dev
```

`GET /` returns `Hello World!`. Server port comes from `PORT` (default 3000).

## Env

See `.env.example`. `src/config/env.ts` validates values. Use `ConfigService` in app code.

## Tests and lint

```bash
npm test
npm run test:e2e
npm run lint
```
