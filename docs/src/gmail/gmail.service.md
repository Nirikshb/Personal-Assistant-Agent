# `src/gmail/gmail.service.ts`

## How to read this file

1. Constants at the top — readonly scope and token filename.
2. Public methods in order: `status`, `authUrl`, `handleCallback`, `listRecent`.
3. Private helpers: OAuth client, token file, `header` at the bottom.

## What it does

- Builds the Google login URL
- Exchanges the `code` for a **refresh token** and writes `.gmail-tokens.json`
- Lists recent messages (From, Subject, snippet) with Gmail API

No send. No drafts.

## Why it exists

Ollama is a URL. Gmail is **you proving identity**. All of that belongs in one service so routes stay dumb and we never scatter `googleapis` calls.

Tokens live in a gitignored file, not in git and not in a database (one user, this machine).

## Lifecycle

- Nest constructs one instance at startup.
- `authUrl` / `handleCallback` run during the one-time browser login.
- `listRecent` runs per request: load tokens → Gmail `messages.list` → `messages.get` per id.
- Refresh token stays on disk until you delete the file or revoke the app.

## Dependencies and connections

```
.env (client id/secret/redirect)
        → GmailService (googleapis OAuth2)
        → browser Google login
        → .gmail-tokens.json
        → Gmail API users.messages.*
```

- **Scope:** `gmail.readonly` only.
- **Errors:** missing creds or not connected → `ServiceUnavailableException` (503).

## TypeScript walkthrough

**`const GMAIL_READONLY = '...'`.** Google’s scope string. Not an enum — one value.

**`constructor(private readonly config: ConfigService)`.** Same injection as Ollama.

**`status()`.** Async because it reads the token file. Returns `{ configured, connected }` so you can see “env is set” vs “you have logged in.”

**`authUrl()`.** `generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope })`. Offline = we want a refresh token. Consent = Google shows the screen again so the token is actually issued.

**`handleCallback(code: string)`.** `code` is a query param from Google, not a password. `getToken(code)` trades it for tokens. If `refresh_token` is missing we throw — access tokens expire; we cannot stay connected without refresh.

**`listRecent(max = 10)`.** Default argument `= 10`. Clamped 1–20. Gmail `list` returns ids only, so a `for` loop `get`s each message. `format: 'metadata'` is enough for From/Subject. `snippet` still comes back on that payload.

**`oauthClient()`.** `new google.auth.OAuth2(id, secret, redirectUri)` — the official client. Throws 503 if id/secret empty.

**`authedClient()`.** Loads JSON, `setCredentials`, returns the client Gmail SDK uses as `auth`.

**`loadTokens` / `saveTokens`.** `readFile` / `writeFile` from `node:fs/promises`. `catch { return null }` means “no file yet,” not a crash.

**`function header(...)`.** File-local helper, not a shared utils module. `name?: string | null` matches Google’s loose types. `?.` and `?? ''` so missing headers become `''`.
