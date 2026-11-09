# ClinicScribe (Scribing Tool)

Ambient AI medical scribe: a doctor records the consultation, the system transcribes it with a medical speech model and drafts an evidence-linked clinical note for review and signing.

## This repository

Static review build of the website. No backend yet; recording, transcription and note generation are simulated with fictional sample data so the workflow can be reviewed before the real build.

| Page | Purpose |
|---|---|
| `index.html` | Landing page |
| `login.html` | Doctor sign-in (demo account: `dr.sharma@demo.clinic` / `demo1234`) |
| `app.html` | Visits, new visit, recording, note workspace, vocabulary |
| `assets/` | Shared styles, demo auth, app logic |
| `docs/` | Prototype plan (one-month scope and costs) and full-product reference plan |

Open `index.html` directly in a browser, or deploy the repository root as a static site (Vercel: import the repo, no build step, no settings).

## Next step after approval

Replace `assets/auth.js` with Supabase Auth, wire recording upload to storage, and connect the transcription and note-generation APIs described in `docs/PROTOTYPE-PLAN-1-LAKH.md`.
