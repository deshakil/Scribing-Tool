# AI Medical Scribe – MVP Plan

Prepared: 9 November 2026
Status: proposal for discussion

---

## 1. One-page summary

**What we are building.** An ambient AI scribe for doctors. The doctor records the visit (in person or telehealth), the system transcribes it with a medical-grade speech model, and a language model turns the transcript into a draft clinical note in the doctor's own format (SOAP, H&P, specialty templates). The doctor reviews, edits, signs, and pastes or pushes the note into the EHR.

**Why doctors want it.** Documentation is the single biggest driver of after-hours "pajama time" and burnout. Peer-reviewed data from 2025–2026 shows ambient scribes save roughly 16 minutes of documentation per day on average and up to 27 minutes for heavy users, and self-reported burnout dropped from ~52% to ~39% in a 263-clinician study. Doctors are actively buying these tools: self-serve products (Freed, Heidi, Nabla) charge $39–150 per provider per month; enterprise products (Abridge, Microsoft Dragon Copilot) charge $250–900+.

**How we build it.** Buy the two hard AI pieces (medical speech-to-text and a frontier LLM), build everything around them that creates trust and fits the clinical workflow: capture, diarization, templates, evidence-linked notes, review/sign-off, consent, audit, export.

**Custom model?** Training a speech model from scratch is not viable for an MVP (data and compute are prohibitive and the result would be worse than off-the-shelf). Fine-tuning Whisper on medical audio is cheap and feasible, but it only becomes worthwhile once we have hundreds of hours of consented, de-identified recordings from our own users. Recommendation: use a vendor medical model now, collect an evaluation set from day one, revisit fine-tuning in phase 3 when the motive is cost reduction at scale.

**Cost.** MVP build 10–14 weeks. One-time build cost $35–70k with an offshore/hybrid team, $120–200k with a US/EU agency. Running cost roughly $0.15–0.60 per 15-minute visit at list prices, i.e. $65–265 per provider per month at 440 visits, falling to under $40 with negotiated or self-hosted speech-to-text. Compliance (HIPAA risk assessment, policies, pen test) adds $5–20k before the first live patient.

---

## 2. What the reference products teach us

### EchoScribe (general transcription app)
- Privacy-first, on-device transcription on iPhone; 100 free minutes per month; one-time purchase for unlimited.
- Record, import audio/video, speaker labels, editable transcript, summaries and action items.
- **What to take:** the clean record → transcribe → summarize loop, on-device privacy as a selling point, and simple pricing.
- **What is missing for medicine:** no clinical note formats, no medical vocabulary, no consent capture, no BAA, no audit trail, no EHR hand-off, no safeguards against invented findings. A generic summary is not a clinical note.

### Whisper (OpenAI open-source speech model)
- Strong general-purpose ASR, free to self-host, runs on a 6 GB GPU with faster-whisper at 10–90× real time.
- Weaknesses for clinical audio: whisper-small scores ~15% word error rate on the PriMock57 doctor–patient consultation dataset; it hallucinates during silence; it has no built-in speaker diarization (you bolt on WhisperX/pyannote); drug names and dosages are a known failure mode.
- Prompting it with a list of ~200 medical terms cuts error rate by ~19%; LoRA fine-tuning on PriMock57 took whisper-small from 15.2% to 9.5% WER.
- **What to take:** Whisper is a credible cost-reduction path later and a good fallback. It is not the best starting point when vendor medical models report 3–7% WER with diarization and BAAs included.

### The market leaders (what "good" looks like today)
| Product | Segment | Notable feature to match |
|---|---|---|
| Abridge | Enterprise, Epic-integrated, Best in KLAS 2025/26 | "Linked Evidence": every line of the note links to the audio/transcript it came from |
| Microsoft Dragon Copilot (ex-Nuance DAX) | Enterprise | Deep EHR write-back, orders and referrals drafted from the visit |
| Freed | Solo / small practice, ~$99/mo | Learns the doctor's note style; 2-minute onboarding; copy-paste into any EHR |
| Heidi | Solo / small practice, free tier | Templates marketplace, dictation + ambient in one, multilingual |
| Nabla | Mid-market | Structured data extraction (ICD-10), shown to reduce time-in-note in an RCT |

---

## 3. What doctors actually need (prioritised)

The job to be done is "give me a signed note in my format with zero after-hours work, and never put words in my mouth." Everything below is ordered by how much it moves that needle.

### Must-have for the MVP
1. **Ambient capture that just works.** One tap to start, pause/resume, keeps recording when the phone locks, survives a dropped connection, handles exam-room noise and telehealth audio. Also a **dictation mode** (doctor narrates the note) because many clinicians prefer it for procedures and follow-ups.
2. **Medical-grade transcription with speaker labels.** Drug names, doses, units, anatomy, abbreviations, accents. Doctor vs patient vs family member must be separated or the note gets the history wrong.
3. **Structured note in the doctor's format.** SOAP, H&P, progress note, plus 5–10 specialty templates at launch (primary care, cardiology, orthopedics, psychiatry, pediatrics, dermatology). Per-doctor customisation: section order, verbosity, phrasing, standard macros.
4. **Evidence linking and "no invention" guarantee.** Each statement in the note links back to the transcript segment it came from. Anything not discussed is marked "not addressed" rather than filled in. This is the number-one trust and adoption factor and the main liability control.
5. **Fast turnaround.** Draft note within 60 seconds of ending the visit. Doctors review between patients; a 5-minute wait kills the habit.
6. **Review, edit, sign.** Rich-text editor, regenerate a single section, accept/reject suggestions, one-click copy of the whole note or any section. Notes are always drafts until the clinician signs.
7. **Consent capture.** On-screen prompt and scripted verbal disclosure at the start of each visit, logged with timestamp. Patients can decline and the doctor charts manually. (All-party-consent states such as Florida, Maryland and Washington require explicit agreement.)
8. **Security and compliance baseline.** Encryption in transit and at rest, MFA, role-based access, immutable audit log, automatic deletion of raw audio after the note is signed (configurable, default 24–72 h), BAA signed with every vendor that touches PHI, contractual ban on using PHI to train models.
9. **Export.** Copy to clipboard, PDF, secure email/share link. Direct EHR integration is phase 2; Freed proved copy-paste is enough to get paying users.

### High-value additions (phase 2)
- Patient-facing after-visit summary in plain language (doctors love this; patients love this).
- ICD-10 / CPT code suggestions and a billing-ready problem list.
- Follow-up tasks, orders and referrals extracted from the plan.
- Pre-charting: pull last note and problem list before the visit.
- EHR write-back via FHIR (Epic, athenahealth, Cerner/Oracle marketplaces), or browser extension that fills the note field.
- Multilingual visits (Spanish first), code-switching.
- Practice admin: team accounts, usage dashboard, template sharing.

### Later (phase 3)
- Custom speech vocabulary per specialty and per clinic, then domain fine-tuning (see section 5).
- Clinical decision support flags (drug interactions, missed screenings). Note: this moves toward regulated software; keep it out of MVP.

---

## 4. How we build it

### Pipeline
```
Doctor's phone / browser
   │  consent logged, audio chunks encrypted and uploaded (or streamed)
   ▼
Speech-to-text (medical model) + speaker diarization + custom keyterms
   │  timestamped, speaker-labelled transcript
   ▼
Note generation (LLM, structured output)
   │  JSON: sections → statements → source segment IDs
   ▼
Grounding check (second LLM pass flags any statement without transcript support)
   │
   ▼
Review & sign UI  →  export (copy / PDF / EHR)   →  audio auto-deleted
```

### Recommended stack
| Layer | Choice | Why |
|---|---|---|
| Mobile + web app | React Native (Expo) for iOS/Android, Next.js web | One codebase for capture + review; background recording support |
| Backend | TypeScript (NestJS/Fastify) or Python (FastAPI) | Team familiarity; both have good SDKs for every vendor below |
| Database / auth | Postgres (Supabase Team plan with HIPAA add-on, or RDS) | Row-level security, audit triggers, BAA available |
| Storage | S3 with KMS encryption, lifecycle rule to delete audio | HIPAA-eligible, cheap, deletion is automatic |
| Speech-to-text | **Deepgram Nova-3 Medical** (primary) | Vendor-reported 3.4–6.6% WER on medical audio, streaming, diarization, keyterm prompting, BAA, 10 languages. Alternatives: AssemblyAI Medical Mode (~$0.36–0.60/hr), AWS Transcribe Medical (HIPAA-eligible, ~$4.50/hr). Fallback: self-hosted Whisper large-v3 + WhisperX. |
| Note generation | **Claude Opus 5.5** (`claude-opus-5-5`) via Anthropic API or AWS Bedrock | Strong clinical summarisation, structured outputs enforce the note schema, citations map statements to transcript segments, BAA/zero-retention available on enterprise terms and through Bedrock. Cheaper model (Sonnet 5.5 / Haiku 5.5) for the grounding check and after-visit summary. |
| Infra | AWS (HIPAA-eligible services only), Terraform, CloudTrail | Standard for healthcare procurement questionnaires |
| Observability | Structured logs with PHI redaction, OpenTelemetry | Required for audit and incident response |

### Note-generation design (the part that differentiates)
- Input: speaker-labelled transcript with segment IDs, the doctor's template, their style preferences, and the specialty vocabulary.
- Output schema: `{ sections: [{ name, items: [{ text, evidence: [segment_ids], confidence }] }], not_addressed: [...] }`. Structured outputs make the schema guaranteed, not best-effort.
- A second, cheaper pass checks every item has supporting segments and flags the rest for the doctor. This is the mechanism behind "no invention" and matches what Abridge markets as Linked Evidence.
- Style learning: store the doctor's edits as diffs; feed the last N accepted notes as examples. This is how Freed gets "it writes like me" without training anything.
- Evaluation harness from week 1: PriMock57 (57 public mock consultations with transcripts and notes) plus 20–50 consented recordings from pilot doctors. Track WER, missed medical entities, note edit distance, and time-to-sign.

### Timeline (10–14 weeks to pilot)
| Weeks | Milestone |
|---|---|
| 0–2 | Discovery with 3–5 target doctors, template library, compliance design, vendor BAAs signed, eval set assembled |
| 3–6 | Capture app, upload pipeline, ASR + diarization, transcript viewer |
| 5–9 | Note generation with templates, evidence linking, grounding check, editor, export |
| 8–11 | Consent flow, audit log, audio deletion, MFA, admin basics, security review and pen test |
| 11–14 | Closed pilot with 5–10 doctors, weekly iteration on edit rate and turnaround, pricing test |

### Team
1 technical lead / backend + AI (full-time), 1 mobile/front-end (full-time), 0.5 designer, 0.3 project manager, 1 clinical advisor (practising physician, a few hours a week). QA shared.

### Pilot success metrics
- Median time from end of visit to draft note < 60 s
- Note edit rate (characters changed / characters generated) < 15% by week 4 of the pilot
- Zero unsupported statements reaching a signed note (grounding check catches them)
- Doctors use it on > 50% of visits by week 4 (the usage level where studies show real time savings)
- Willingness to pay confirmed at $79–129 per provider per month

---

## 5. Should we build our own model?

There are three different things the client might mean. Each has a different answer.

### A. Train a speech-recognition model from scratch
**No.** Competitive ASR models are trained on tens of thousands of hours of labelled audio with millions of dollars of compute, and the medical ones are trained on top of that with thousands of hours of clinical audio. Labelled clinical audio is also PHI: it cannot be bought on the open market, and using patient audio to train a model requires explicit patient authorisation, not just a BAA. The result would cost more than the whole product and be less accurate than what we can rent today for under a cent a minute.

### B. Fine-tune an open model (Whisper) on medical audio
**Feasible, cheap, and worth doing later, not now.**
- Public evidence: LoRA fine-tuning whisper-small on PriMock57 (about 8 hours of audio) cut WER from 15.2% to 9.5%. A separate paper fine-tuned on 8.5 hours of in-domain audio and went from 63% to 32% on hard audio. Prompting alone with 200 medical terms gives ~19% relative improvement with no training at all.
- Compute is not the constraint: a whisper-large-v3 LoRA run on 100–500 hours of audio is a few hundred to a few thousand dollars of GPU time.
- **Data is the constraint.** Getting to the vendor models' 3–7% WER needs hundreds to thousands of hours of real, consented, de-identified recordings across accents, specialties and room conditions, each transcribed by a medical transcriptionist (roughly $50–150 per audio hour). 200 hours of ground truth is $10–30k before any engineering.
- What fine-tuning does buy at scale is **cost**: self-hosted Whisper runs at $0.01–0.15 per audio hour versus $0.25–0.50+ for a vendor medical model. At 500 providers doing 100 hours of visits a month that is the difference between ~$2k and ~$20k a month in ASR spend. That is the business case, and it only exists after product–market fit.

**Recommendation:** ship on a vendor model, store de-identified transcripts and (with explicit opt-in) audio for an evaluation set, re-run the fine-tune decision when we have 300+ hours or when ASR cost exceeds 15% of revenue. Budget a $5–10k fine-tuning experiment in phase 3.

### C. "Our own" note-writing model
**Not for MVP.** A frontier LLM with a good schema, evidence linking and a grounding check gets most of the way there; the differentiation is in templates, style learning, workflow and the evaluation loop, all of which we own regardless of the underlying model. Fine-tuning a small open LLM on our own doctor-edited notes is a reasonable phase-3 cost play, same logic as B.

### What we do own from day one (the actual moat)
- Specialty vocabularies and keyterm lists fed to the ASR per clinic.
- Template library and per-doctor style profiles.
- The grounded-note schema and verification pipeline.
- A growing, consented evaluation dataset that lets us measure every vendor and model objectively and switch when something better or cheaper appears.

---

## 6. Costs

### One-time build (MVP, phases 0–1)
| Item | Offshore / hybrid team | US / EU agency |
|---|---|---|
| Discovery, design, template library (2 wks) | $4–8k | $12–20k |
| Capture app (mobile + web) | $10–18k | $35–55k |
| ASR + note pipeline, evidence linking, eval harness | $12–22k | $40–65k |
| Review/edit UI, consent, audit, export, admin | $8–15k | $25–40k |
| Security review, pen test, HIPAA risk assessment and policies | $5–12k | $10–20k |
| Project management, QA, contingency (15%) | $5–10k | $15–25k |
| **Total** | **$45–85k** | **$140–225k** |

A lean two-engineer build using Supabase, Expo and vendor APIs lands at the bottom of the offshore range (roughly $35–50k). Phase 2 (EHR integration, coding, patient summary, admin) typically adds $40–100k depending on how many EHR marketplaces are targeted; Epic App Market alone involves fees and a months-long review.

### Running cost per provider (list prices, 15-minute visit, 20 visits/day, 22 days)
| Component | Per visit | Per provider / month |
|---|---|---|
| Speech-to-text, vendor medical model ($0.0045–0.03 per min depending on tier/BAA) | $0.07–0.45 | $30–200 |
| Note generation, Claude Opus 5.5 (~6k input, ~1.5k output tokens) | $0.06 | $26 |
| Grounding check + after-visit summary on a cheaper model | $0.01–0.05 | $5–20 |
| Storage, compute, logging, backups | $0.01–0.02 | $5–10 |
| **Total** | **$0.15–0.60** | **$65–255** |

Against a $99–129/month price this is a thin or negative margin at the top of the range, which is why the ASR line matters: a negotiated Deepgram volume rate, AssemblyAI Medical Mode (~$0.09–0.15 per visit), or self-hosted Whisper (~$0.01 per visit) brings the total to roughly $0.10–0.20 per visit and $45–90 per provider per month. Using Sonnet 5.5 for note generation halves the LLM line with a quality trade-off that the eval set will quantify.

### Fixed monthly costs during pilot
| Item | Monthly |
|---|---|
| HIPAA-eligible cloud (AWS or equivalent), small footprint | $300–800 |
| Supabase Team plan + HIPAA add-on (or managed Postgres) | ~$600+ |
| Vendor minimum commitments (Deepgram enterprise/BAA tier, Anthropic enterprise terms) | $0–2,000, negotiable at pilot volume |
| Compliance tooling (Vanta/Drata) once SOC 2 is pursued | $800–1,500 |
| Monitoring, error tracking, email/SMS | $100–300 |

### Compliance budget
- HIPAA security risk assessment, policies and training: $5–15k one-time.
- Penetration test: $5–15k one-time, annually thereafter.
- SOC 2 Type 1 (needed for health-system sales, not for solo doctors): $20–50k including tooling, usually in year 1–2.
- Legal review of consent scripts, terms, and BAAs: $3–10k.

---

## 7. Risks and how the plan handles them

| Risk | Mitigation |
|---|---|
| Hallucinated findings in a note | Evidence-linked schema, grounding check, "not addressed" markers, mandatory clinician sign-off |
| Low adoption (only ~32% of clinicians became frequent users in the MGB/UCSF study) | Sub-60-second turnaround, style learning so edits fall fast, dictation mode for doctors who dislike ambient capture |
| Recording-consent lawsuits (two filed in 2025) | Scripted disclosure, logged consent, patient opt-out, state-by-state consent matrix reviewed by counsel |
| Vendor lock-in / price changes | Abstract the ASR and LLM behind adapters; eval set makes switching a measured decision |
| PHI breach | Minimum-necessary data, short audio retention, encryption, audit, pen test, incident plan |
| Regulatory drift toward medical-device rules | Keep MVP strictly documentation; no diagnosis or treatment recommendations |
| Geography | This plan assumes US/HIPAA. UK (NHS DTAC, UK GDPR), EU (GDPR, AI Act), India (DPDP Act) change the compliance section and hosting region, not the product |

---

## 8. Decisions needed from the client

1. Target geography and first specialty (primary care is the safest first market).
2. Solo/small practice (self-serve, copy-paste, $79–129/mo) or health-system (EHR integration, SOC 2, $250+/mo)? The MVP plan above targets the first and keeps the door open to the second.
3. Pilot doctors: can the client bring 5–10 clinicians willing to use it on real visits under a pilot agreement?
4. Budget tier and team model (in-house, agency, hybrid).
5. Appetite for the phase-3 custom-model investment, with the understanding that it is a cost lever after traction, not an MVP feature.

---

## Sources
- Clinical outcome studies: [JAMA 2026 MGB/UCSF multisite study coverage](https://www.news-medical.net/news/20260401/AI-scribes-modestly-reduce-clinician-documentation-time-and-EHR-use.aspx), [NEJM AI randomized trial](https://pubmed.ncbi.nlm.nih.gov/41497288/), [UChicago Medicine summary of burnout studies](https://www.uchicagomedicine.org/forefront/research-and-discoveries-articles/ambient-ai-saves-time-reduces-burnout-fosters-patient-connection), [JMIR Medical Informatics 2026 Abridge study](https://medinform.jmir.org/2026/1/e84104/PDF)
- Market and pricing: [Keragon 2026 scribe comparison](https://www.keragon.com/blog/best-ai-medical-scribe), [Glass Health comparison](https://glass.health/resources/best-ai-medical-scribe), [EHR Source vendor comparison](https://www.ehrsource.com/articles/ambient-ai-scribes-comparison/), [Freed comparison](https://www.getfreed.ai/resources/best-ai-scribes)
- EchoScribe: [App Store listing](https://apps.apple.com/us/app/echoscribe/id6753726449), [Product Hunt](https://www.producthunt.com/products/echoscribe-2/makers)
- Speech-to-text vendors: [Deepgram Nova-3 Medical announcement](https://deepgram.com/blog/introducing-nova-3-medical-speech-to-text-api), [Nova-3 Medical multilingual](https://deepgram.com/blog/introducing-nova-3-medical-multilingual), [Deepgram medical solutions page](https://deepgram.com/solutions/medical), [AssemblyAI medical API guide](https://www.assemblyai.com/blog/medical-transcription-api), [AssemblyAI vs Deepgram medical](https://www.assemblyai.com/blog/assemblyai-vs-deepgram-medical-transcription), [OpenAI transcription pricing roundup](https://diyai.io/ai-tools/speech-to-text/openai-whisper-api-pricing-2026/)
- Whisper fine-tuning and self-hosting: [medscribe Whisper LoRA on PriMock57](https://github.com/vik-bit/medscribe), [release notes 15.2% → 9.5% WER](https://github.com/vik-bit/medscribe/releases/tag/v0.1.0), [The Sound of Healthcare paper](https://arxiv.org/pdf/2402.07658), [Custom-built ambient scribe for telehealth](https://arxiv.org/pdf/2507.17754), [Self-hosting Whisper large-v3 guide](https://dev.to/jovan_chan_9500711396d4e6/self-host-whisper-large-v3-as-a-transcription-server-in-2026-faster-whisper-fastapi-3d9g), [Whisper GPU cost sizing](https://lyceum.technology/magazine/whisper-transcription-gpu-cost-batch-throughput-sizing/)
- Compliance: [HIPAA requirements for ambient scribes](https://www.accountablehq.com/post/hipaa-compliance-requirements-for-ambient-ai-medical-scribes), [Paubox on consent risk](https://www.paubox.com/blog/how-to-evaluate-ai-clinical-scribes-for-hipaa-and-consent-risks), [Scribeberry consent guide](https://scribeberry.com/guides/ai-scribe-patient-consent), [Gordon Feinblatt legal note](https://www.gfrlaw.com/what-we-do/insights/ambient-scribes)
