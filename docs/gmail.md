# Gmail

Code layout for Gmail. **Your** Cloud Console / `.env` / browser login is not here.

Human pair: [you_to_do.md](you_to_do.md) (do this) · [you_to_do_explained.md](you_to_do_explained.md) (why)

Same idea as Ollama: **only `src/gmail/` talks to Google.** Everyone else injects `GmailService`.

This slice is **read-only**. It does not send mail, create drafts, or call Ollama. The goal is: you log in as you, then `GET /gmail/messages` shows your real inbox.

## Google Cloud (you do this once)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a project (or pick one).
2. Enable **Gmail API**.
3. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - Publishing status: **Testing**
   - Add **your Gmail** under Test users
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI: `http://localhost:3000/gmail/callback`  
     (must match `GOOGLE_REDIRECT_URI` and your `PORT`)
5. Copy client id and secret into `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). Never commit them.

Testing mode is enough for **your** account. Google’s expensive “restricted scope verification” is only if other people will connect their Gmail.

## Try it

1. `npm run start:dev`
2. `GET http://localhost:3000/gmail/status` — `configured` should be true after `.env` is filled
3. Browser: `http://localhost:3000/gmail/connect` — Google login, allow read-only Gmail
4. Callback saves tokens to **`.gmail-tokens.json`** (gitignored)
5. `GET http://localhost:3000/gmail/messages` — recent From / Subject / snippet  
   Optional: `?max=5` (capped at 20)

If Google does not give a refresh token, remove this app at [Google permissions](https://myaccount.google.com/permissions) and connect again (`prompt=consent` is already on).

Not in this slice: drafts, send, labels, Pub/Sub, Ollama classification.

## Files

| File | Doc |
|---|---|
| `gmail.module.ts` | [docs/src/gmail/gmail.module.md](src/gmail/gmail.module.md) |
| `gmail.service.ts` | [docs/src/gmail/gmail.service.md](src/gmail/gmail.service.md) |
| `gmail.controller.ts` | [docs/src/gmail/gmail.controller.md](src/gmail/gmail.controller.md) |
