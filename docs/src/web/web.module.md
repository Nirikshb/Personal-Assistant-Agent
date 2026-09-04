# `src/web/web.module.ts`

## How to read this file

1. Controller + service imports.
2. `@Module` — controllers, providers, exports.
3. Empty class.

## What it does

Registers `/web/*` and exports `WebService` so `AgentModule` can inject it later.

## Why it exists

Same corner as Gmail: the rest of the app must not call Tavily, Jina, or Playwright directly.

## Lifecycle

Created when `AppModule` imports `WebModule`. One `WebService` for the process.

## Dependencies and connections

Imported by `AppModule` and `AgentModule`. Does not import Ollama or Gmail.

## TypeScript walkthrough

**`exports: [WebService]`.** Required so the agent can inject search/read without copying HTTP.
