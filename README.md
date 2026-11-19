# FornoRosso — Pizza Delivery App (MERN)

React (Vite) frontend + Express/MongoDB backend.

## Run it locally

Two terminals:

```bash
# terminal 1 — API on http://localhost:5000
cd server
npm install
npm run dev        # or: npm start

# terminal 2 — frontend on http://localhost:5173
cd client
npm install
npm run dev
```

Then open <http://localhost:5173> and use **Register → Login**.

## Where the frontend points at the API

`client/src/api/axios.js` uses `import.meta.env.VITE_API_URL`:

| File | Loaded when | Value |
| --- | --- | --- |
| `client/.env` | `npm run dev` | `http://localhost:5000/api` |
| `client/.env.production` | `npm run build` (deploy) | `https://fornorosso-backend.onrender.com/api` |

> **Gotcha:** Vite only loads files literally named `.env`. This file was once
> committed as `,env` (comma instead of a dot), so the API URL was silently
> ignored, every request went to `http://localhost:5000/api`, and with no local
> server running **login and signup failed with "Login failed" / "Registration failed"**.

To use the deployed API during local dev, change `client/.env` to the Render URL
and restart Vite (env files are read at startup).

## Auth flow

1. `POST /api/auth/register` → user created, verification email sent.
2. `GET /verify-email/:token` (email link) → marks the account verified.
3. `POST /api/auth/login` → checks password, stores a 6-digit OTP, emails it.
4. `POST /api/auth/verify-otp` → returns the JWT; the client stores it and
   attaches `Authorization: Bearer …` to every request.

## Environment (`server/.env`)

Required: `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS` (Gmail **app
password**), `GOOGLE_CLIENT_ID`, `CLIENT_URL` (base URL used in email links —
`http://localhost:5173` in dev). See `server/.env.example`.

## Tests

```bash
cd server
npm run test:e2e     # full flow: register → verify email → login → OTP → JWT → protected route
```

The script registers a throwaway `e2e.test.*@example.com` user, runs the whole
flow against `http://localhost:5000/api` (override with `E2E_BASE_URL`), then
deletes the user.

## Known issue: email on the deployed backend

Outbound SMTP from Render hangs (60–120s) and the connection is killed, which
used to turn register/login into dead requests. Two mitigations are in place:

- `server/config/mailer.js` now has 10–20s SMTP timeouts and never throws.
- `authController` / `subscriberController` send mail fire-and-forget, so
  responses return in milliseconds even if SMTP is slow or down.

If OTP/verification emails never arrive **on Render**, check the service logs for
`Email send failed`, then verify `EMAIL_USER` / `EMAIL_PASS` there (Gmail app
password) — or switch `mailer.js` to another provider (Resend/SendGrid/SMTP on
port 587). Local SMTP has been verified working.
