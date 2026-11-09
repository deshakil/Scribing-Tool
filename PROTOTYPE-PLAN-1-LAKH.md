# AI Medical Scribe – 1-Month Prototype Plan (₹1,00,000)

Prepared: 9 November 2026
Engagement: single freelance developer, 4 weeks, fixed price ₹1 lakh
Exchange rate used: ₹87 per USD

---

## 1. What ₹1 lakh and one month buys

**A working prototype a doctor can use in a demo and on test consultations.** Not a product, not a HIPAA-certified system, not an app-store app, not EHR-integrated. The goal is to prove three things to the client and to real doctors:

1. A doctor records a consultation and gets an accurate transcript with speakers separated.
2. Within a minute they get a draft note in SOAP format, in their style, with every line traceable to the transcript.
3. Doctors say "I would pay for this" after using it on 5–10 visits.

If that lands, the client has what they need to raise a proper budget for the full build (see the reference plan in `FULL-PRODUCT-PLAN-REFERENCE.md`, which costs ₹40–75 lakh).

**The budget math.** ₹1,00,000 for ~160 hours is about ₹625 per hour. Every feature below is sized in hours. Anything not listed is out of scope and should be written into the contract as such.

---

## 2. Scope: what is in, what is out

### In scope (deliverables)
| # | Deliverable | What the doctor sees |
|---|---|---|
| 1 | Web app (works on phone browser, installable as a PWA) | Login, "New visit" button, list of past visits |
| 2 | Consent step | Checkbox + scripted line the doctor reads aloud, timestamp logged |
| 3 | Recording | Start / pause / stop, timer, works with phone locked in browser (best effort), audio uploaded in chunks |
| 4 | Medical transcription with speaker labels | Transcript showing Doctor / Patient turns, timestamps, medical terms spelled correctly |
| 5 | Dictation mode | Same flow without speaker separation, for doctors who narrate the note |
| 6 | Draft note generation | SOAP note, plus a Follow-up template and a General consult template (3 templates total) |
| 7 | Evidence linking | Click any line in the note and the transcript scrolls to the sentence it came from; lines with no source are flagged "unsupported" |
| 8 | Editor | Edit each section, "regenerate this section", mark note as signed |
| 9 | Export | Copy whole note or one section, download PDF |
| 10 | Auto-delete audio | Audio deleted 24 hours after note is signed (configurable); transcript and note kept |
| 11 | Specialty vocabulary | One editable list of terms (drugs, procedures) per doctor, fed to the speech model |
| 12 | Handover | Source code in the client's GitHub, deployment on the client's accounts, a 2-page setup/ops doc, a 5-minute demo video |

### Explicitly out of scope (say this to the client in writing)
- Native iOS/Android app (PWA instead)
- EHR / HMIS integration of any kind
- HIPAA certification, BAAs, SOC 2, penetration test
- Any custom or fine-tuned model
- ICD-10/CPT coding, patient summaries, billing, multi-clinic admin, team accounts, payment/subscription
- Style learning from edits (templates are hand-tuned with the pilot doctors instead)
- Hindi / regional-language or code-switched consultations unless the speech vendor handles them in the week-1 test (see risks)
- Production support after handover (offer a separate monthly retainer)

---

## 3. Build plan: 4 weeks, ~160 hours

| Week | Work | Hours |
|---|---|---|
| **1 – Capture & transcribe** | Next.js + Supabase project, auth, visit model, browser recorder with chunked upload to Supabase Storage, Deepgram Nova-3 Medical integration with diarization and keyterms, transcript viewer. **Day 3 checkpoint:** run 3 real-feeling consultations (role-played by the client's doctors) and check accuracy before building anything else. | 40 |
| **2 – Note generation** | Claude integration with structured output (note JSON with section → items → source segment IDs), 3 templates, grounding check on a cheap model that flags unsupported items, "not addressed" handling, dictation mode. | 40 |
| **3 – Review workflow** | Section editor, regenerate-section, sign, evidence click-through, copy/PDF export, consent step, per-doctor vocabulary list, audio auto-delete job, visit history. | 40 |
| **4 – Test, polish, hand over** | 2 feedback sessions with doctors, fix the top issues, mobile layout polish, error handling, deploy to client's Vercel/Supabase, README + ops doc, demo video, acceptance walkthrough. | 40 |

Buffer: none in the table, so protect week 4. If week 1 or 2 slips, cut dictation mode and PDF export first; they are the lowest-value items.

### Stack (chosen for one person, one month)
| Layer | Choice | Why |
|---|---|---|
| App | Next.js (App Router) + TypeScript, Tailwind, shadcn/ui | One codebase for UI and API routes; PWA for phone use |
| Auth, DB, storage | Supabase (free tier, then Pro at ~₹2,200/month) | Auth, Postgres, file storage and row-level security out of the box; no backend to maintain |
| Hosting | Vercel (free Hobby tier for the prototype) | Zero-ops deploys from GitHub |
| Speech-to-text | Deepgram Nova-3 Medical, pre-recorded API, pay-as-you-go | Medical vocabulary, diarization and keyterm prompting in one call; new accounts get ~$200 free credit, which covers the whole prototype month. Alternative if Deepgram struggles with Indian-accent or Hindi-mixed audio: AssemblyAI (Medical Mode) or OpenAI `gpt-4o-transcribe-diarize` at $0.006/min. |
| Note generation | Claude Opus 5.5 (`claude-opus-5-5`) with structured outputs; Claude Haiku 5.5 for the grounding check | Best note quality per rupee; the structured output guarantees the note schema, which is what makes evidence linking reliable. Roughly ₹5–7 per visit. |
| PDF | `@react-pdf/renderer` or browser print-to-PDF | Avoid a PDF service |
| Background jobs | Supabase cron (pg_cron) for audio deletion; transcription and note generation run synchronously in an API route | No queue infrastructure |

### Note-generation design in one paragraph
Send Claude the speaker-labelled transcript with numbered segments, the chosen template, and the doctor's vocabulary. Ask for JSON: sections, each with items, each item carrying the segment numbers it was derived from, and a separate `not_addressed` list. A second call on Haiku checks every item against its cited segments and marks anything unsupported. The UI renders items as the note, highlights unsupported ones in amber, and scrolls the transcript to the cited segments on click. This is the single feature that makes doctors trust the output, and it costs about 6 hours to build on top of the plain generation.

---

## 4. Costs

### What the client pays you
₹1,00,000 fixed. Suggested terms: 40% on signing, 30% at the end of week 2 demo (transcript + first draft note working), 30% on acceptance. Acceptance = the 12 deliverables above demonstrated on the client's own deployment.

### What the client pays vendors during the build month
| Item | Cost |
|---|---|
| Deepgram (≈100 test visits × 15 min = 25 hours of audio at $0.0077/min) | ≈ ₹1,000, covered by free credit |
| Claude API (≈100 visits × ₹7) | ≈ ₹700 |
| Supabase, Vercel | ₹0 on free tiers |
| Domain | ≈ ₹1,000 |
| **Total** | **under ₹3,000** |

All vendor accounts should be created by the client in their name, with you added as a collaborator. The client owns the keys, the data and the bills from day one; you never carry API spend on your own card.

### What it costs the client to run after handover (per doctor)
| Component | Per 15-min visit | Per doctor / month (300 visits) |
|---|---|---|
| Deepgram Nova-3 Medical | ₹10 | ₹3,000 |
| Claude (Opus 5.5 note + Haiku check) | ₹6 | ₹1,800 |
| Supabase Pro + Vercel (shared across doctors) | – | ₹2,500–4,500 flat |
| **Per doctor, 5-doctor pilot** | **≈ ₹16** | **≈ ₹5,500** |

This leaves room under the ₹4,000–8,000 per doctor per month that Indian clinics realistically pay, and well under the $99+ Western products charge. Switching note generation to Sonnet 5.5 roughly halves the Claude line if quality holds.

### What is not in any of these numbers
HIPAA/DPDP legal review, BAAs (Deepgram's BAA requires an enterprise contract), pen testing, native apps, EHR integration. Those are phase-2 costs in the reference plan.

---

## 5. Compliance at this budget: be honest about it

- **Label it a prototype.** The contract and the app's login screen should say it is for evaluation. Use role-played or explicitly consented test consultations. If the client puts real patients through it in month one, that is their decision and they need their own consent process; do not let that responsibility land on you silently.
- **Build the compliance-shaped habits anyway**, because they are cheap now and expensive to retrofit: consent logged per visit, audio deleted after 24 h, transcripts and notes encrypted at rest (Supabase does this by default), row-level security so a doctor sees only their own visits, no PHI in logs, API keys in environment variables.
- **India (DPDP Act 2023):** consent, purpose limitation, and the right to erasure apply. Health data is sensitive. A delete-visit button satisfies the erasure part; the consent step satisfies the first.
- **If the doctors are in the US**, HIPAA applies and nothing in this budget covers it. The prototype can still run on de-identified or test audio; real patient use would need the phase-2 budget.
- **Say in writing:** "No PHI is to be used in production without the client completing their own compliance review."

---

## 6. The custom-model question, in two sentences

Not in this engagement and not in the next one either. Fine-tuning Whisper is technically easy (a few thousand rupees of GPU) but needs hundreds of hours of consented, transcribed clinical audio that nobody has yet; the pilot is how that data starts to exist, and the decision should be revisited once ASR spend is a meaningful share of revenue.

---

## 7. Risks specific to a one-month solo build

| Risk | What to do |
|---|---|
| Speech model struggles with Indian accents or Hindi-English mixing | Test on day 3 with real doctors' voices before building week 2. Nova-3 Medical is English-first; if it fails, switch to Nova-3 general multilingual or AssemblyAI and accept slightly weaker medical vocabulary, or restrict the pilot to English-speaking consultations. |
| Browser recording stops when the phone screen locks | Keep screen awake with the Wake Lock API; tell doctors to keep the phone face-up. Native app is phase 2. |
| Scope creep from the client mid-build | The 12-deliverable list is the contract. New asks go on a phase-2 list. |
| Doctors do not show up for testing | Get 2–3 named doctors and two calendar slots booked before you start week 1. |
| Note quality looks wrong for a specialty | Hand-tune the 3 templates with the pilot doctors in week 3; do not try to support every specialty. |
| You lose a week to infra | Supabase + Vercel + two vendor APIs is the entire infrastructure. Resist adding queues, containers or a separate backend. |

---

## 8. What to tell the client this prototype can do for doctors

- Cuts the typing after each consultation to a 1–2 minute review and edit.
- Produces a consistent, complete SOAP note every time, including what was not discussed.
- Shows exactly where each line came from, so the doctor stays in control and nothing is invented.
- Keeps a searchable record of past visits with the audio gone and the note kept.
- Runs on the phone they already carry, with no installation.
- Gives them a concrete basis to decide on a full product: real notes, real edit rates, real willingness to pay.

## 9. What comes after (so the client sees the path)
- **Phase 2 (₹3–5 lakh, 2–3 months):** native app, style learning from edits, patient summary, Hindi/regional support, admin for a clinic, retention policies, security review, DPDP/HIPAA readiness.
- **Phase 3 (budget depends on scale):** EHR/HMIS integration, coding suggestions, cost reduction via negotiated or self-hosted speech-to-text, and only then a fine-tuned model if the numbers justify it.

---

## Sources
- Deepgram Nova-3 Medical: [announcement](https://deepgram.com/blog/introducing-nova-3-medical-speech-to-text-api), [medical solutions page](https://deepgram.com/solutions/medical)
- Alternatives: [AssemblyAI medical API guide](https://www.assemblyai.com/blog/medical-transcription-api), [OpenAI transcription pricing roundup](https://diyai.io/ai-tools/speech-to-text/openai-whisper-api-pricing-2026/)
- Whisper fine-tuning evidence: [medscribe LoRA on PriMock57](https://github.com/vik-bit/medscribe), [The Sound of Healthcare paper](https://arxiv.org/pdf/2402.07658)
- Clinical value: [JAMA 2026 study coverage](https://www.news-medical.net/news/20260401/AI-scribes-modestly-reduce-clinician-documentation-time-and-EHR-use.aspx), [UChicago burnout summary](https://www.uchicagomedicine.org/forefront/research-and-discoveries-articles/ambient-ai-saves-time-reduces-burnout-fosters-patient-connection)
- Consent and compliance: [HIPAA requirements for ambient scribes](https://www.accountablehq.com/post/hipaa-compliance-requirements-for-ambient-ai-medical-scribes), [AI scribe patient consent](https://scribeberry.com/guides/ai-scribe-patient-consent)
