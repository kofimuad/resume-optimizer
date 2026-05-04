# AI Resume Optimizer

Job-ready resumes in minutes — built for military veterans and beginners. Tailors resumes to a specific job description using OpenAI, gates the full output behind a $2.99 Stripe payment.

**Stack:** Vite + React, Tailwind CSS, React Router, Axios, Netlify Functions, OpenAI (gpt-4o), Stripe Checkout.

## Project structure

```
.
├── index.html                  # Vite entry
├── netlify.toml                # Netlify build + redirects + functions config
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── netlify/
│   └── functions/              # Serverless functions (deferred to Day 3+)
│       ├── generate.js         # OpenAI call (Day 3–4)
│       ├── create-checkout.js  # Stripe Checkout session (Day 5)
│       └── verify-payment.js   # Stripe session verification (Day 5)
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── lib/
    │   └── api.js              # Shared axios client
    └── pages/
        ├── Home.jsx
        └── Success.jsx         # Stripe redirect target
```

## Local setup

```bash
npm install
cp .env.example .env            # fill in keys when you reach Day 3 / Day 5
npm run dev                     # frontend only (port 5173)
```

To run frontend + functions together (recommended once functions are wired up):

```bash
npm install -g netlify-cli
netlify dev                     # serves on port 8888, proxies Vite
```

## Deploy to Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git → select repo**.
3. Netlify auto-detects `netlify.toml`. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Add environment variables in **Site settings → Environment variables**:
   - `OPENAI_API_KEY` (Day 3)
   - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` (Day 5)
5. Trigger deploy. Each push to `main` auto-deploys.

## Routing

- `/api/*` rewrites to `/.netlify/functions/*` (cleaner alias from frontend).
- `/*` falls back to `index.html` for React Router.

## Roadmap

Day 1–2 — UI complete (layout, 3 input modes, mocked preview).
Day 3–4 — OpenAI integration via `generate` function.
Day 5 — Stripe Checkout + verification.
Day 6 — Full unlock, polish, error handling.
Day 7 — QA, switch Stripe to live mode, launch.

See `resume_optimizer_plan.pdf` for full task breakdown.
