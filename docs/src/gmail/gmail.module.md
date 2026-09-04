# `src/gmail/gmail.module.ts`

## How to read this file

1. Imports of controller and service.
2. `@Module` lists: controllers, providers, exports.
3. Empty class.

## What it does

Registers Gmail routes and the Gmail client. Exports the service so a later agent module can inject it without importing `googleapis`.

## Why it exists

Same corner pattern as `OllamaModule`. Google OAuth and Gmail HTTP stay here, not in `AppService`.

## Lifecycle

Created when `AppModule` imports `GmailModule`. One `GmailService` for the process.

## Dependencies and connections

- **Imported by:** `AppModule`.
- **Owns:** `GmailController`, `GmailService`.
- **Does not import ConfigModule** — Config is already global.

## TypeScript walkthrough

**`@Module({ controllers, providers, exports })`.** Same three lists as Ollama. `exports: [GmailService]` means another module can `imports: [GmailModule]` and inject `GmailService`.

**`export class GmailModule {}`.** Marker class. No methods.
