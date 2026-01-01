# OsteoScope

OsteoScope is a demo web app that generates an **AI-assisted clinical-style report** from an uploaded X-ray image.
It includes:

- Patient + study intake
- "Fracture" / abnormality detection (LLM-assisted demo)
- An executive summary + differential diagnoses + recommended actions
- A printable report view

## Running locally

```bash
npm install
npm run dev
```

## Deploying

This is a standard Vite + React app.

- **Vercel:** import the repo and use the default Vite settings (`npm run build`, output `dist`).
- **StackBlitz:** open the repo and run `npm install` then `npm run dev`.

## AI configuration

The app runs in **demo mode by default** (mocked AI responses) so it works without keys.

To enable real LLM output, set:

```bash
VITE_OPENAI_API_KEY=YOUR_KEY
```

Then restart the dev server.

## Data storage

All data is stored locally in the browser via `localStorage`.
