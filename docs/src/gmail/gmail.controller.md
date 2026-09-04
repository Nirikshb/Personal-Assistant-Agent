# `src/gmail/gmail.controller.ts`

## How to read this file

1. `@Controller('gmail')` — prefix `/gmail`.
2. `status` — JSON, no Google call besides reading the token file.
3. `connect` — HTTP redirect to Google.
4. `callback` — Google comes back here with `?code=`.
5. `messages` — lists mail; `max` is optional.

## What it does

HTTP door for OAuth and a smoke-test inbox list.

| Method | Path | Purpose |
|---|---|---|
| GET | `/gmail/status` | env + token file |
| GET | `/gmail/connect` | 302 to Google |
| GET | `/gmail/callback` | save tokens |
| GET | `/gmail/messages` | recent mail |

## Why it exists

Thin controller like `OllamaController`. It does not import `googleapis`.

## Lifecycle

`connect` and `callback` are the login dance (browser). `messages` is a normal JSON API after that. Each request constructs nothing new; it uses the singleton `GmailService`.

## Dependencies and connections

```
Browser → /gmail/connect → Google → /gmail/callback → .gmail-tokens.json
Client  → /gmail/messages → GmailService → Gmail API
```

## TypeScript walkthrough

**`@Redirect()` on `connect`.** Nest sends `302` to `{ url, statusCode }`. You do not call `res.redirect` yourself.

**`@Query('code') code?: string`.** Query string. `?` means it might be missing (user hit callback without finishing login) → 400.

**`@Query('max') max?: string`.** Query params are **strings**. `Number(max ?? 10)` turns them into a number. `Number.isFinite` guards `?max=abc`.

**No `@Body()`.** This slice is all GET. Drafts/send would be POST later, with a new scope.
