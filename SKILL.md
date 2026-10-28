---
name: civiclens-builder
description: Build, extend, debug, or review the CivicLens AI web app (photo of a civic problem to Gemini Vision analysis, generated complaint, duplicate check, Case ID, dashboard/map, before/after resolution check). Use this skill whenever the user mentions CivicLens, civic complaints, pothole or garbage reporting, Case IDs like CV-2026-XXXXX, the civic dashboard, Gemini image analysis for civic issues, or asks to implement anything from PRD.md or DESIGN.md in this project, even if they don't name the skill. Also use it when writing the evaluation scripts, seed data, README, or award/demo material for CivicLens.
---

# CivicLens Builder

CivicLens turns one photo of a civic problem into a structured, trackable case:

```
Photo → Gemini Vision → Issue, severity, risk, department → Complaint → Duplicate check → Case ID → Tracking → Resolution check
```

This skill tells you how to work on the project. It does not repeat the specs. The specs live in the repo and are the source of truth.

## Step 0: Read the specs first

Before writing any code, read these files from the repo (usually the root or `/docs`):

| File | What it decides | Read when |
|------|-----------------|-----------|
| `PRD.md` | Features F1-F13, API endpoints, data schema, Gemini prompts, thresholds, build phases, evaluation plan | Always |
| `DESIGN.md` | Colors, type, spacing, components, screens, motion, accessibility, mockup-vs-PRD decisions | Any UI work |

If a file is missing, say so and ask the user to add it. Do not rebuild the spec from memory.

If `PRD.md` and `DESIGN.md` disagree, `DESIGN.md` section 15 lists the known conflicts and their resolutions (for example Mapbox vs Leaflet). Follow it. Flag any new conflict to the user instead of silently picking one.

## Step 1: Find out where the project is

1. List the repo (`client/`, `server/`, `eval/`, `scripts/`).
2. Check which features from PRD section 3.1 already exist.
3. Work out the next phase from PRD section 15 and tell the user in one or two sentences what you will build and why.

Build in phase order. Do not start Phase 2 or 3 features until the Phase 1 flow works end to end (photo → analysis → complaint → Case ID → case page).

## Stack

- **Client:** React, Vite, TypeScript, Tailwind, shadcn/ui, Lucide, React Router, TanStack Query, Recharts, Mapbox GL JS (MapLibre as fallback)
- **Server:** Node, Express, TypeScript, Zod, Multer, Sharp, express-rate-limit, Helmet
- **AI:** Google Gemini via the `@google/genai` SDK
- **Data:** Supabase (Postgres, Storage)
- **Deploy:** Vercel (client), Render or Railway (server)

Model names always come from env (`GEMINI_MODEL`, `GEMINI_EMBEDDING_MODEL`). Never hard-code them. Check Google's current docs before choosing defaults, because model identifiers change.

## Non-negotiable rules

These protect the project's credibility. Do not trade them for speed.

1. **The Gemini API key and Supabase service key never reach the client.** Only the Express server calls Gemini. Client env contains only `VITE_API_URL` and the public map token.
2. **Severity, category, department, and reasons come from Gemini**, validated by Zod. The frontend never invents or overrides them (except the user's explicit manual category choice on low confidence).
3. **Never fake AI output.** If Gemini returns no `bounding_box`, draw no detection box. If it returns `None detected`, do not generate a complaint. If confidence is below 0.5, show the verification banner.
4. **Every AI answer is advisory.** The user can edit the complaint. The admin confirms resolution. Keep both steps in the UI.
5. **Demo data is labelled "Demo data"** in the UI footer and README. No invented statistic is ever presented as a real result, especially in the evaluation report or award material.
6. **Strip EXIF/GPS from every stored image** (Sharp). Location comes only from what the user confirms.
7. **Secrets stay out of git.** `.env` is in `.gitignore`; keep `.env.example` current.
8. **Estimates are labelled as estimates.** Do not present object size or similar values from a single photo as fact.

## Gemini integration conventions

- Use structured output (`responseMimeType: "application/json"` with a response schema), then validate with Zod. Retry once on invalid JSON, then return a handled error.
- Prompts live in `server/src/prompts/` as versioned constants (`analysis.ts`, `complaint.ts`, `resolution.ts`, `duplicateImage.ts`). Copy the wording from PRD section 11 and keep the version in a comment so the evaluation report can cite it.
- Temperature: about 0.2 for analysis, duplicate image comparison, and resolution checks; about 0.5 for complaint wording.
- Compress images to 1600px on the long side before sending. Cache analysis by image hash to save quota.
- Timeout 30 seconds, one retry with backoff. On failure the user can still submit with a manually chosen category.
- Normalize the returned department to the fixed list in PRD section 9.4 so the UI is consistent.
- Log Gemini latency and errors with a request id.

## Feature implementation notes

**Case ID:** `CV-<year>-<5 chars>` from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. Retry on unique-constraint conflict.

**Duplicate detection:** same category, unresolved (or resolved within 7 days), within `DUP_RADIUS_M` (default 100 m, Haversine). Score = 0.5 × proximity + 0.2 × category match + 0.3 × description-embedding similarity; flag at `DUP_SCORE_THRESHOLD` (default 0.65). Both values are env config. Always offer "This is a different issue" and log the choice in `duplicate_decisions`. Adding evidence to an existing case increments `report_count` and adds a timeline event, and creates no new case.

**Complaint storage:** keep both `complaint_text_ai` and `complaint_text_final`. The evaluation uses the difference.

**Resolution check:** send the before image, after image, and original analysis. If `same_location_likelihood` is LOW, warn and require explicit admin confirmation. Only an admin action sets status to `RESOLVED`.

**Admin:** passcode in `x-admin-key` (demo-grade, documented as a known limitation). Every status change writes a `case_events` row.

**Rate limiting:** `/api/analyze` limited per IP (about 10 per minute).

## Design implementation

Follow `DESIGN.md`. The points that most often go wrong:

- Dark theme is the default. Use the CSS variables from DESIGN section 14.1 instead of hard-coded hex values in components.
- Manrope is the only font, with tabular numerals for all data.
- Red, amber, and green are reserved for severity and status. The blue-to-violet gradient appears only on the single primary button in a view.
- The **evidence photo with the AI detection overlay** is the signature element. Give it the largest, cleanest surface and keep other decoration quiet around it.
- Severity and category always have an icon and a text label, never color alone.
- Sentence case everywhere. No all-caps tracked labels, no trailing arrows on buttons, no glow except the Critical badge.
- Every async region has a skeleton. Every empty state has one action. Every error says what happened and what to do.
- Respect `prefers-reduced-motion`.
- Check at 1440px, 1024px, and 390px before calling a screen done.

## Testing and verification

After each phase, verify rather than assume:

1. **Run the flow** with 3-5 real photos (pothole, garbage, streetlight, no-issue image, a blurry image). Confirm each ends in a sensible result or a handled error.
2. **Check the failure paths:** Gemini timeout, invalid JSON, oversize file, wrong file type, database unavailable. The user's edited complaint must survive a failed submit.
3. **Check the security rules:** search the client bundle for the Gemini key; confirm admin endpoints reject requests without `x-admin-key`; confirm stored images have no EXIF.
4. **Run the type check and lint** (`tsc --noEmit`, `eslint`) and fix errors before reporting done.
5. **For duplicate detection,** submit two photos of the same spot and one of a different spot 500 m away, and confirm the right outcomes.
6. **Keyboard and focus:** tab through the report flow and confirm visible focus on every control.

Report what you actually ran and what happened. Do not claim a check passed unless you ran it.

## Evaluation and award material

CivicLens is also being prepared for the IEEE Computer Society AI Rising Stars Award, which values originality, clear AI integration, and measurable societal or technological impact. When asked for evaluation work, follow PRD section 17:

- `server/scripts/evaluate.ts` runs the pipeline over `eval/images` with `eval/labels.csv` and outputs accuracy, per-category precision/recall/F1, severity agreement (within one level), and latency.
- `server/scripts/evaluateDuplicates.ts` evaluates labelled same/different pairs and reports precision, recall, and F1 at several thresholds.
- Never fabricate results. If there is no labelled dataset yet, say so and help the user create one (100-200 real photos, labelled by two reviewers).
- Report limitations honestly (lighting, ambiguous scenes, simulated department routing, demo-grade admin auth). A candid limitations section strengthens the application.

## Working style

- Make small, reviewable changes. After each meaningful step, tell the user what changed and how to run it.
- Prefer finishing the Phase 1 flow over adding polish to later features.
- When a request is ambiguous or conflicts with the specs, ask one clear question rather than guessing.
- If something in the specs looks wrong (a threshold, a schema field, an unrealistic requirement), say so and propose a change to `PRD.md` or `DESIGN.md` so the docs stay accurate.
- Keep `README.md`, `.env.example`, and the PRD's feature checklist in sync with the code.

## Definition of done (per feature)

- [ ] Meets the acceptance criteria in `PRD.md`
- [ ] Matches the component and screen specs in `DESIGN.md`
- [ ] Error, empty, and loading states exist
- [ ] Types and lint pass
- [ ] Verified by running it, not just reading it
- [ ] No secrets in the client or in git
