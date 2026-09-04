# Why you have to do those steps

This file is **explanation only**. Do not treat it as the checklist.

**Pair file (what to do / what you should get):** [you_to_do.md](you_to_do.md)

How to use both: keep `you_to_do.md` open and work the table. Open this file when a row is confusing, or when you want to know why the AI cannot finish it.

---

## How the two files divide

| File | Job |
|---|---|
| `you_to_do.md` | Human output: do this → expect this. Parts A–D. |
| `you_to_do_explained.md` (this) | Why it exists, what the code is waiting for, what “configured vs connected” means. |

They are linked at the top and bottom of each file. Code walkthroughs stay in `docs/src/` and `docs/gmail.md`. Those are for reading the TypeScript, not for clicking Google Console.

---

## Why the AI cannot finish this

The repo can **call** Ollama and Gmail once you have real local state. It cannot:

- Sit in Google Cloud Console as you  
- Create an OAuth client in your project  
- Add you as a Test user  
- Complete Google’s consent screen in your browser  
- Receive a **refresh token** Google will only give **you**  
- Know which model you actually pulled (`llama3.2` in the example vs `qwen3:14b` on your machine)  
- Safely hold your client secret in chat or in git  

So: the agent wires routes and env **names**. You fill **values** and complete **identity**. That is the split.

---

## Part A — Why Ollama is on you

Ollama is a process on **your** PC. The app only reads `OLLAMA_BASE_URL` and `OLLAMA_MODEL` from `.env` and HTTP-calls that process (`src/ollama`).

If the model string does not match `ollama list`, Nest is fine and Ollama returns an error. That looks like **503** on `/ollama/chat`. Fixing the name is a human check (A2–A3), not a code change.

`/ollama/health` proves the process is up. `/ollama/chat` proves the **named** model answers.

---

## Part B — Why Google Cloud is on you

Gmail is not “a URL like Ollama.” Google will only let an app read **your** mailbox if:

1. A Cloud **project** has **Gmail API** on  
2. An **OAuth client** (id + secret) identifies **this** app  
3. The **redirect URI** is exactly where Nest listens (`GET /gmail/callback`)  
4. Consent is **Testing** and **you** are a **test user** (otherwise Google blocks “unverified app” for anyone else — including you)

The secret is a password for the OAuth client. It belongs in `.env` on your disk. If it is empty, `GET /gmail/status` stays `"configured": false`. The service then refuses `/gmail/connect` with **503**.

**Testing vs verification:** for *your* inbox, Testing + test user is enough. Google’s restricted-scope review is for shipping an app to **other people’s** Gmail. You are not doing that yet.

---

## Part C — Why the browser login is on you

`GET /gmail/connect` only **redirects** to Google. Google then asks *you* to allow **gmail.readonly**.

If you allow it, Google sends a one-time `code` to `/gmail/callback`. Nest trades that code for tokens and writes **`.gmail-tokens.json`** (gitignored). The important piece is `refresh_token`: without it the app cannot keep reading mail after the short-lived access token dies.

`"configured": true` = you pasted client id/secret.  
`"connected": true` = that token file exists and has a refresh token.

`GET /gmail/messages` uses the token file. It does not use Ollama. Seeing real From/Subject/snippet means **your** account, not a mock.

If Google skips the refresh token, you revoke the app in your Google account and connect again. That is an account action, not something to “fix” by committing code.

---

## Part D — What “ready” means for the next build

When A6–A7, B8, C4–C5 all pass, we can add product behaviour (classify with Ollama, drafts, etc.) **on top of** working pipes.

Drafts or send need **new Google scopes** and **another** Part C login. Do not expect today’s connect screen to include send.

---

## If a check fails (no secrets in the report)

| Symptom | Usually which part |
|---|---|
| `/ollama/health` 503 | A1, A4, A5 |
| `/ollama/chat` 503 but health works | A3 model name |
| `/gmail/status` `configured: false` | B7, restart server |
| Google “access blocked” / not a test user | B3, B4 |
| Redirect mismatch / `redirect_uri_mismatch` | B6 vs `PORT` vs `.env` |
| `configured: true`, `connected: false` after login | C2–C3, or revoke and C1 again |
| `/gmail/messages` 503 | C not done, or token file missing |

---

Checklist again: [you_to_do.md](you_to_do.md)
