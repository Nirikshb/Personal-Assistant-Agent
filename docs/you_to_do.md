# For you to do

This file is **actions only**. You do the row. You confirm the “Done when” column. The AI cannot log into Google, paste real secrets, or finish OAuth in your browser.

**Pair file (why / how it connects):** [you_to_do_explained.md](you_to_do_explained.md)

Work top to bottom. Do not skip “Done when.”

---

## Part A — Machine and Ollama

| # | You do this | You get / Done when |
|---|---|---|
| A1 | Leave **Ollama running** on this PC. | Browser or terminal can hit `http://127.0.0.1:11434`. |
| A2 | Run `ollama list` (or `GET http://127.0.0.1:11434/api/tags`). | You see the **exact model names** you have (example: `qwen2.5-coder:7b`, `qwen3:14b`). |
| A3 | Open **`.env`** (copy from `.env.example` if `.env` is missing). Set `OLLAMA_MODEL` to **one name from A2**, not a name you do not have. | `OLLAMA_MODEL=...` matches `ollama list`. |
| A4 | Keep `OLLAMA_BASE_URL=http://127.0.0.1:11434` unless you changed Ollama’s port. | Same URL Ollama actually uses. |
| A5 | From the project folder: `npm install` then `npm run start:dev`. | Terminal shows the Nest server listening (default port **3000**). |
| A6 | `GET http://localhost:3000/ollama/health` | JSON with `"ok": true` and your models listed. **503** = Ollama not running or wrong URL. |
| A7 | `POST http://localhost:3000/ollama/chat` body `{"prompt":"Say hi in one sentence."}` | JSON with `"reply"` text. **503** = model name wrong or Ollama down. |

---

## Part B — Google Cloud (Gmail) — AI cannot do this

Use the **same Google account** as the inbox you want to read.

| # | You do this | You get / Done when |
|---|---|---|
| B1 | Open [Google Cloud Console](https://console.cloud.google.com/). Create a project or select one. | You have a project selected in the top bar. |
| B2 | Enable **Gmail API** for that project. | Gmail API shows **Enabled**. |
| B3 | **APIs & Services → OAuth consent screen.** User type **External**. Publishing **Testing**. | Consent screen exists; status is Testing (not “In production”). |
| B4 | Under **Test users**, add **your Gmail address**. | That address is in the test-user list. |
| B5 | **Credentials → Create credentials → OAuth client ID.** Type **Web application**. | You have a client id and client secret on screen (copy them now). |
| B6 | Authorized **redirect URI** (must match the app): `http://localhost:3000/gmail/callback` | If `PORT` in `.env` is not 3000, use that port in the URI **and** in `GOOGLE_REDIRECT_URI`. |
| B7 | Put values in **`.env` only** (never git): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`. Restart `npm run start:dev` after saving. | File has real strings, not empty. |
| B8 | `GET http://localhost:3000/gmail/status` | `"configured": true`. `"connected": false` is OK until Part C. **`configured: false`** = B7 incomplete or server not restarted. |

You do **not** need: Google app verification, a security audit, Workspace admin, billing for this local test, or Pub/Sub.

---

## Part C — Your login (real tokens) — AI cannot do this

| # | You do this | You get / Done when |
|---|---|---|
| C1 | In a **browser**, open `http://localhost:3000/gmail/connect` | Google sign-in / permission screen. |
| C2 | Sign in as the **test user from B4**. Allow **read-only** Gmail. | Redirect to `/gmail/callback`. Page JSON like `{"ok":true}`. |
| C3 | Check the project folder for **`.gmail-tokens.json`**. Do not commit it. | File exists. You should see a `refresh_token` field if you open it (do not paste it into chat). |
| C4 | `GET http://localhost:3000/gmail/status` | `"configured": true` and `"connected": true`. |
| C5 | `GET http://localhost:3000/gmail/messages` (optional `?max=5`) | JSON `messages` with `from`, `subject`, `snippet` from **your** inbox. |

**If C2 fails or C4 stays `connected: false`:** [Google account → Third-party access](https://myaccount.google.com/permissions) → remove this app → do C1 again.

---

## Part D — Human verification (gate before more features)

Tick only after you personally saw it.

| Check | Passes when |
|---|---|
| Ollama | A6 and A7 both returned success |
| Gmail configured | B8 `configured: true` |
| Gmail connected | C4 `connected: true` |
| Real mail | C5 shows mail you recognise |
| Secrets | `.env` and `.gmail-tokens.json` are **not** committed |

When this table is all pass, your side of “model works + inbox readable” is done. Drafts/send are **not** in this list (new Google permission later).

---

## What you never hand to the AI

- Google client secret  
- `.gmail-tokens.json`  
- Full `.env`  
- Passwords / app passwords  

If something fails, say **which row** (e.g. B8, C2) and the **HTTP status**, not the secret values.

---

Back to explanation: [you_to_do_explained.md](you_to_do_explained.md)
