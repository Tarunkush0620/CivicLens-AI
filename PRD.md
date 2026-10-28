# CivicLens AI — Product Requirements Document (PRD)

**Product:** CivicLens AI — Civic Evidence Intelligence
**Tagline:** *See it. Report it. Fix it.* / *From evidence to action.*
**Document version:** 1.0
**Owner:** Tarun
**Status:** Ready for implementation

---

## 1. Overview

### 1.1 Problem
Citizens see civic problems every day (potholes, garbage, broken streetlights, open manholes), but reporting them is slow and confusing:
- They don't know which department is responsible.
- Writing a clear, formal complaint takes effort, so most people don't bother.
- Ten people photograph the same pothole and authorities receive ten redundant complaints, or none at all.
- Citizens can't see what happened after reporting, and nobody verifies whether the fix was done.

### 1.2 Solution
CivicLens AI converts a single photograph into a structured, trackable civic case:

```
Photo → Gemini Vision → Issue → Severity → Risk → Department → Complaint → Duplicate Check → Case ID → Tracking → Resolution Verification
```

The user uploads evidence. Gemini Vision identifies the problem, rates severity with an explanation, names the responsible department, and drafts a formal complaint. The system checks for nearby duplicates, assigns a Case ID, shows the case on a dashboard and map, and later verifies resolution using a before/after comparison.

### 1.3 Vision statement
> "Citizens see civic problems every day, but reporting them is complicated. CivicLens turns a single photograph into a structured, actionable civic complaint using Gemini's multimodal intelligence."

### 1.4 Product goals
| # | Goal | Measure |
|---|------|---------|
| G1 | Reduce effort to file a civic complaint | Photo → submitted case in under 60 seconds |
| G2 | Produce accurate, useful AI analysis | Category accuracy ≥ 85% on test set |
| G3 | Reduce redundant complaints | Duplicate detection precision ≥ 80%, recall ≥ 70% |
| G4 | Make AI reasoning transparent | Every severity rating shows human-readable reasons |
| G5 | Close the loop on resolution | Before/after verification available on every case |
| G6 | Be demo-ready and award-ready | Deployed, evaluated, documented (see Section 17) |

### 1.5 Non-goals (explicitly out of scope for v1)
- User authentication / accounts (use anonymous reporting plus a simple admin passcode)
- Real government/municipal API integrations (departments are simulated)
- Payments, notifications via SMS/WhatsApp, multi-tenant admin systems
- Training custom ML models (Gemini handles image understanding)
- Native mobile apps (responsive web app only)

---

## 2. Target Users

| Persona | Description | Needs |
|---------|-------------|-------|
| **Citizen Reporter** (primary) | Resident or student who notices a civic problem | Fast reporting, no paperwork, ability to track the case |
| **Civic Administrator** (secondary) | Municipal staff or demo admin | Prioritized, structured cases; map view; ability to update status and verify resolution |
| **Judge / Evaluator** (demo audience) | Hackathon or award reviewers | Visible, meaningful AI usage; clear impact story; measurable results |

---

## 3. Scope and Feature Summary

### 3.1 Feature list with priority

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| F1 | Evidence upload (image + location) | Must | 1 |
| F2 | Gemini Vision structured analysis | Must | 1 |
| F3 | AI explanation ("Why this severity?") | Must | 1 |
| F4 | Automatic complaint generation + edit | Must | 1 |
| F5 | Civic Case ID + case creation | Must | 1 |
| F6 | Case tracking page with timeline | Must | 1 |
| F7 | Civic dashboard (stats + recent cases) | Must | 2 |
| F8 | Severity heatmap / map view | Must | 2 |
| F9 | Duplicate detection | Must | 2 |
| F10 | Before/after resolution verification | Must | 3 |
| F11 | Admin status updates | Should | 2 |
| F12 | Privacy protection (EXIF stripping, face/plate warning) | Should | 3 |
| F13 | Evaluation harness and metrics page | Should | 3 |

All 13 features are in scope for this PRD. Build order is defined in Section 15. The MVP cut line (what must work end-to-end if time runs out) is F1–F6.

---

## 4. Detailed Functional Requirements

### F1 — Evidence Upload

**Description:** User uploads or captures a photo of a civic problem and provides a location.

**Supported issue categories:**
Pothole, Garbage, Broken Streetlight, Open Manhole, Damaged Footpath, Exposed Electrical Wire, Water Leakage, Illegal Dumping, Damaged Traffic Sign, Fallen Tree, Road Damage, Other.

**Requirements:**
- FR1.1: Drag-and-drop zone and click-to-browse; on mobile, open camera directly (`<input type="file" accept="image/*" capture="environment">`).
- FR1.2: Accept JPG, PNG, WEBP up to 8 MB. Reject others with a clear message.
- FR1.3: Client-side image preview before analysis ("Give the user control": do not auto-send).
- FR1.4: Location capture, three options:
  1. "Use my current location" (browser Geolocation API)
  2. Pick on a Leaflet map (click to drop pin)
  3. Type an address/area (stored as free text; geocode via Nominatim if possible)
- FR1.5: Default location label shown as "Greater Noida, Uttar Pradesh" if geolocation is unavailable, and the user must confirm or change it.
- FR1.6: Compress large images client-side to max 1600px on the longest side before upload.
- FR1.7: "Analyze with Gemini" button disabled until an image is present and a location is set.

**Acceptance criteria:**
- A user can go from opening the page to a previewed image with a location in under 15 seconds.
- Invalid file types and oversize files show an inline error and do not crash the page.

---

### F2 — Gemini Vision Structured Analysis

**Description:** The backend sends the image to Gemini with a civic-intelligence prompt and receives structured JSON.

**Requirements:**
- FR2.1: Endpoint `POST /api/analyze` accepts `multipart/form-data` (image, latitude, longitude, address).
- FR2.2: Gemini is called from the backend only. The API key never reaches the client.
- FR2.3: Request JSON output via Gemini's structured-output / `responseMimeType: "application/json"` with a response schema.
- FR2.4: Backend validates the JSON against a schema (Zod). On invalid output, retry once, then return a friendly error.
- FR2.5: If no civic issue is visible, return `category: "None detected"` and prompt the user to upload a clearer photo; do not generate a complaint.
- FR2.6: If `confidence < 0.5`, show a "Low confidence — please verify" banner and let the user change the category manually.
- FR2.7: Severity is generated by Gemini, never invented by the frontend.

**Output schema:**
```json
{
  "category": "Pothole",
  "severity": "HIGH",
  "confidence": 0.94,
  "description": "Large pothole occupying a significant portion of the road lane.",
  "hazard": "High risk to two-wheelers and pedestrians.",
  "department": "Municipal Roads Department",
  "urgency": "IMMEDIATE",
  "recommended_action": "Repair and resurface the damaged road section.",
  "severity_reasons": [
    "Large road obstruction",
    "Located in the vehicle path",
    "Potential two-wheeler hazard",
    "Significant road surface damage"
  ]
}
```

**Enumerations:**
- `severity`: `LOW | MEDIUM | HIGH | CRITICAL`
- `urgency`: `ROUTINE | SOON | URGENT | IMMEDIATE`
- `department` (suggested mapping, see Section 9.4)

**Severity rubric (given to Gemini):**
| Level | Definition |
|-------|------------|
| LOW | Minor issue, limited immediate impact |
| MEDIUM | Affects usability or needs attention soon |
| HIGH | Potential safety hazard or major infrastructure problem |
| CRITICAL | Immediate, significant public-safety concern (e.g., exposed live wire, open manhole in a busy road) |

**Acceptance criteria:**
- Analysis completes in under 10 seconds for a typical photo (p90).
- Output always conforms to the schema or the user sees a handled error.

---

### F3 — AI Explanation ("Why this severity?")

**Description:** Make Gemini's reasoning visible instead of showing only a label.

**Requirements:**
- FR3.1: Display `severity_reasons` (3–5 bullets) beneath the severity badge under the heading **"Why was this classified as HIGH?"**
- FR3.2: Reasons must be grounded in visible image evidence. The prompt instructs Gemini not to speculate.
- FR3.3: Show confidence as a percentage with a progress bar.
- FR3.4: Show "✨ Powered by Gemini" label, plus a visible analysis-steps animation (see F3 UI below).

**Analysis progress UI:**
```
Analyzing civic evidence...
✓ Image received
✓ Identifying infrastructure
✓ Assessing severity
● Generating complaint
```
Steps advance on real backend events where possible (analysis done, complaint done). Otherwise use timed fallback.

---

### F4 — Automatic Complaint Generation (and Edit)

**Description:** A second Gemini call turns the structured analysis into a formal complaint.

**Requirements:**
- FR4.1: Endpoint `POST /api/generate-complaint` accepts the analysis JSON plus location; returns `{ title, complaint, recommended_action }`.
- FR4.2: The prompt instructs Gemini to use only provided facts (no invented street names, dates, or names).
- FR4.3: Complaint is concise (80–150 words), formal, and includes: what, where, hazard, requested action.
- FR4.4: User can edit title and body in-place before submitting. Show a character counter.
- FR4.5: "Regenerate" button calls the endpoint again (limit: 3 regenerations per session).
- FR4.6: The original AI text and the final edited text are both stored (`complaint_text_ai`, `complaint_text_final`) so edit rate can be measured in evaluation.

**Example output:**
> **Large Road Pothole Creating Safety Hazard**
> A large pothole has been identified on the road at the reported location. The damaged section may pose a significant safety risk, particularly to two-wheelers and pedestrians. Immediate inspection and road repair are recommended.

**Acceptance criteria:**
- Complaint text only references facts present in the analysis and location.
- User can edit and submit without losing changes on re-render.

---

### F5 — Civic Case ID and Case Creation

**Requirements:**
- FR5.1: Case ID format: `CV-<YEAR>-<5 uppercase alphanumeric>`, e.g. `CV-2026-8F42A`.
- FR5.2: Generate with a collision-safe method: random 5 chars from `[A-Z0-9]` excluding ambiguous characters (`O`, `0`, `I`, `1`); retry on unique-constraint violation.
- FR5.3: `POST /api/cases` stores analysis, final complaint, location, image, and creates the first timeline events.
- FR5.4: After submission show a success page:

```
            ✓
      REPORT SUBMITTED

      Civic Case ID
      CV-2026-A82F4

 Issue       Pothole
 Severity    HIGH
 Department  Municipal Roads Department
 Status      OPEN
 Location    Greater Noida

 [ Track Case ]  [ Report Another Issue ]
```
- FR5.5: "Copy Case ID" and "Share link" buttons.
- FR5.6: Because there are no accounts, the case page is accessible by Case ID (link possession = access for viewing). Admin-only actions are protected (see F11).

---

### F6 — Case Tracking Page

**Route:** `/case/:caseId`

**Requirements:**
- FR6.1: Show case header (ID, category, severity badge, status, department, location, created time).
- FR6.2: Show evidence gallery (original photo plus any added duplicate evidence).
- FR6.3: Show full AI analysis and the final complaint.
- FR6.4: Show a vertical timeline:

```
✓ Evidence Submitted            11:42 AM
✓ AI Analysis Completed         11:42 AM
● Submitted to Department       11:43 AM
○ Inspection
○ Resolution
```
- FR6.5: Timeline events come from the `case_events` table. Later stages are advanced by admin actions (F11) in the hackathon version.
- FR6.6: Show "Additional reports on this case: N" if duplicates were merged (F9).
- FR6.7: If a resolution check exists (F10), show the before/after panel.
- FR6.8: Invalid Case ID shows a friendly 404 with a search box.

---

### F7 — Civic Dashboard ("Civic Command Center")

**Route:** `/dashboard`

**Requirements:**
- FR7.1: Stat cards: Total Reports, Open Cases, High Priority (HIGH + CRITICAL), Resolved.
- FR7.2: Severity breakdown: 🔴 High/Critical, 🟠 Medium, 🟢 Low counts.
- FR7.3: Recent reports list as cards:
  ```
  CV-2026-A82F4
  Pothole   🔴 HIGH
  Greater Noida   Open
  ```
- FR7.4: Filters: category, severity, status, date range. Search by Case ID.
- FR7.5: Sort by newest, highest severity, most duplicate reports.
- FR7.6: Category distribution chart (bar or donut) using Recharts.
- FR7.7: Data refreshes on load and every 30 seconds (polling) or via Supabase Realtime.
- FR7.8: Home page stats ("1,284 Reports | 842 Resolved | 67 High Priority") use the same real data endpoint (`GET /api/stats`). For demos, a seed script populates realistic sample data (clearly labelled as demo data in the README).

---

### F8 — Map View / Severity Heatmap

**Requirements:**
- FR8.1: Leaflet + OpenStreetMap tiles; initial view centered on the user's area (default Greater Noida).
- FR8.2: Markers colored by severity: 🔴 HIGH/CRITICAL, 🟠 MEDIUM, 🟢 LOW. Resolved cases shown as grey/checked markers.
- FR8.3: Marker popup: category, severity, Case ID, status, link to case page.
- FR8.4: Toggle between **Markers** and **Heatmap** layer (`leaflet.heat`, weight by severity).
- FR8.5: Marker clustering at low zoom (`leaflet.markercluster`).
- FR8.6: Map respects dashboard filters.
- FR8.7: Map also embedded (smaller) on the Home page.

---

### F9 — Duplicate Detection

**Description:** Before creating a new case, check for existing nearby cases of the same issue and offer to add evidence to the existing case.

**Algorithm (v1):**
1. Candidate set: existing cases where `status != RESOLVED` (or resolved within last 7 days), `category` equals the new category, and distance ≤ **100 m** (Haversine; or PostGIS `ST_DWithin`).
2. Score each candidate:
   ```
   score = 0.5 * proximity + 0.2 * category_match + 0.3 * description_similarity
   proximity = 1 - (distance_m / 100)
   category_match = 1 (always 1 after step 1 filter, kept for extensibility)
   description_similarity = cosine similarity of text embeddings (Gemini embedding model) of the descriptions
   ```
3. If best `score ≥ 0.65` → flag **Possible Duplicate**.
4. Optional v1.1: Ask Gemini to compare the two images ("Do these photos show the same physical defect?") for candidates with score between 0.5 and 0.8, and use its yes/no/uncertain answer to finalize.

**Requirements:**
- FR9.1: Duplicate check runs after analysis and before submission, via `POST /api/duplicates/check`.
- FR9.2: If a possible duplicate is found, show:

```
⚠ POSSIBLE DUPLICATE
We found an existing report nearby.

CV-2026-A82F4
Pothole · High Severity · Reported 2 hours ago
Similar reports: 3

[ Add my evidence to this case ]   [ View Existing Case ]   [ This is a Different Issue ]
```
- FR9.3: "Add my evidence" attaches the photo (and optional note) to the existing case, increments `report_count`, adds a timeline event "Additional evidence added", and does **not** create a new case.
- FR9.4: "This is a Different Issue" proceeds to normal case creation, and the decision is logged (`duplicate_overrides`) for evaluation.
- FR9.5: Cases with higher `report_count` get a priority boost on the dashboard ("Reported by 7 citizens").
- FR9.6: Distance threshold and score threshold are config values (env), not hard-coded.

---

### F10 — Before / After Resolution Verification

**Description:** An admin uploads an "after" photo; Gemini compares it with the original and estimates whether the issue is resolved.

**Requirements:**
- FR10.1: Admin-only endpoint `POST /api/cases/:caseId/verify-resolution` accepting the after-image.
- FR10.2: Send both the "before" and "after" images plus the original analysis to Gemini.
- FR10.3: Gemini returns:
```json
{
  "resolution_status": "LIKELY_RESOLVED",
  "confidence": 0.91,
  "before_summary": "Large pothole in the road lane.",
  "after_summary": "Road surface appears repaired and level.",
  "same_location_likelihood": "HIGH",
  "remaining_issues": []
}
```
- FR10.4: `resolution_status` values: `LIKELY_RESOLVED | PARTIALLY_RESOLVED | NOT_RESOLVED | CANNOT_DETERMINE`.
- FR10.5: UI shows a side-by-side panel:
```
BEFORE                  AFTER
[ pothole photo ]  →  [ repaired road photo ]

        AI Resolution
        ✓ LIKELY RESOLVED   (91%)
```
- FR10.6: If `LIKELY_RESOLVED` and the admin confirms, case status becomes `RESOLVED` and a timeline event is added. If `NOT_RESOLVED`, the case stays open with a note.
- FR10.7: `same_location_likelihood` guards against a mismatched after-photo; if LOW, show a warning and require explicit admin confirmation.
- FR10.8: Verification is advisory. The admin makes the final decision. Make this explicit in the UI.

---

### F11 — Admin Status Updates

**Requirements:**
- FR11.1: Admin mode unlocked by a passcode (`ADMIN_PASSCODE` env var) entered at `/admin`; stored in session memory and sent as an `x-admin-key` header. (Not a production auth system; documented as a known limitation.)
- FR11.2: Admin can move a case through: `SUBMITTED → UNDER_INSPECTION → IN_PROGRESS → RESOLVED`, and can `REOPEN`.
- FR11.3: Each status change creates a `case_events` row with timestamp and optional note.
- FR11.4: Admin can upload the after-image (F10) from the case page.

---

### F12 — Privacy and Safety Protections

**Requirements:**
- FR12.1: Strip EXIF metadata (including GPS and device info) from stored images server-side (`sharp`). Location comes only from what the user confirms.
- FR12.2: Before upload, show a notice: "Avoid including faces or vehicle number plates."
- FR12.3: Gemini analysis includes a boolean `contains_people_or_plates`. If true, show a warning, and (v1.1) apply blur using a detected-region step or ask the user to retake.
- FR12.4: Rate limit `POST /api/analyze` (e.g., 10/min per IP) to protect API quota and reduce abuse.
- FR12.5: Report-abuse safeguards: flag reports where the model returns `None detected` or very low confidence; these cannot be submitted without manual category selection.
- FR12.6: Display a short "AI can make mistakes. Please verify before submitting." note on the analysis screen.
- FR12.7: Never commit secrets; `.env` in `.gitignore`.

---

### F13 — Evaluation Harness and Metrics Page

**Purpose:** Produce the *measurable impact* evidence needed for the award application (see Section 17).

**Requirements:**
- FR13.1: A script `server/scripts/evaluate.ts` runs the analysis pipeline over a labelled image set (`/eval/images` + `labels.csv`) and outputs: per-category precision/recall/F1, overall accuracy, severity agreement, average latency.
- FR13.2: A second script evaluates duplicate detection against labelled pairs (same / different) and outputs precision, recall, F1.
- FR13.3: Log complaint-edit distance between `complaint_text_ai` and `complaint_text_final`.
- FR13.4: Log time-to-submit per session (upload start → case submitted) client-side and store it in `sessions_metrics`.
- FR13.5: Optional `/metrics` page (admin) showing these numbers as charts for use in the award write-up and demo.

---

## 5. User Flows

### 5.1 Main reporting flow
```
Home → [Report an Issue]
  → Upload photo + set location
  → [Analyze with Gemini]
  → Analysis screen (category, severity, reasons, department, urgency, confidence)
  → Generated complaint (edit / regenerate)
  → Duplicate check
       ├─ duplicate found → Add evidence to existing case → Case page
       └─ no duplicate / different issue → [Submit Case]
  → Success page with Case ID
  → Case tracking page
```

### 5.2 Admin resolution flow
```
/admin (passcode) → Dashboard/Case page → Update status → Upload "after" photo
  → Gemini verification → Admin confirms → Case RESOLVED → Before/After shown on case page
```

### 5.3 Error flows
- Gemini unavailable/timeouts → "Analysis is taking longer than usual" with retry; user can still submit with manual category selection.
- No civic issue detected → prompt for a clearer photo.
- Database unavailable → don't lose the user's edited complaint (keep in local component state/sessionStorage) and show retry.

---

## 6. Screens and UI Requirements

Four primary screens plus supporting pages.

### Screen 1 — Home (`/`)
- Hero: **"See It. Report It. Fix It."** with sub-copy "Turn a photo of a civic problem into an actionable complaint in seconds."
- Primary CTA: **📸 Report an Issue**. Secondary CTA: **Explore Civic Dashboard**.
- Live stats strip (Reports | Resolved | High Priority).
- "AI-Powered Civic Intelligence" feature tiles: Visual Evidence, Gemini Analysis, Location Intelligence, Automated Complaints.
- Small embedded map of recent reports.
- "How it works" 4-step strip: Upload → Analyze → Complain → Track.

### Screen 2 — Report (`/report`)
- Large upload zone, image preview, location selector (current location / map pin / text), privacy notice, **Analyze with Gemini** button.

### Screen 3 — AI Analysis (`/report/analysis`)
- Animated progress states during analysis.
- Result card: category icon + name, severity badge, urgency, confidence bar, department, hazard.
- "Why was this classified as HIGH?" reasons list.
- Generated complaint card with **Edit** and **Regenerate**.
- Duplicate warning panel (when applicable).
- **Submit Case** button.

### Screen 4 — Civic Dashboard (`/dashboard`)
- Stat cards, severity breakdown, filters, recent-case cards, map/heatmap toggle, category chart.

### Supporting pages
- **Success** (`/case/:id?submitted=1`) — Case ID confirmation.
- **Case** (`/case/:caseId`) — Tracking page (F6).
- **Admin** (`/admin`) — Passcode gate and admin controls.
- **Metrics** (`/metrics`) — Evaluation numbers (F13).
- **404**.

### 6.1 Design requirements
- Responsive, mobile-first (most users will report from phones).
- Visual language: clean, civic/government-tech feel; dark navy + white with severity colors (red/orange/green) and an accent color. Use shadcn/ui components and Lucide icons.
- Accessibility: WCAG AA contrast, keyboard navigation, alt text on evidence images, severity shown by text/icon *and* color (not color alone).
- Loading skeletons for dashboard cards; optimistic UI where safe.
- "✨ Powered by Gemini" label visible on analysis and complaint sections.

---

## 7. System Architecture

```
┌──────────────────────────────┐
│ React + Vite + TS + Tailwind │  (Vercel)
│ shadcn/ui · React Router     │
│ Leaflet · Recharts           │
└──────────────┬───────────────┘
               │ HTTPS / JSON + multipart
               ▼
┌──────────────────────────────┐
│   Node.js + Express (TS)     │  (Render / Railway)
│ routes · services · zod      │
│ sharp (EXIF strip)           │
└───────┬──────────────┬───────┘
        │              │
        ▼              ▼
┌──────────────┐  ┌──────────────────────┐
│ Gemini API   │  │ Supabase             │
│ Vision +     │  │ Postgres (+PostGIS)  │
│ Text +       │  │ Storage (images)     │
│ Embeddings   │  │ Realtime (optional)  │
└──────────────┘  └──────────────────────┘
```

### 7.1 Gemini usage map (make it visible to judges)
| Step | Gemini capability | Purpose |
|------|-------------------|---------|
| Analysis | Multimodal vision + structured JSON | Category, severity, hazard, department, reasons |
| Complaint | Text generation | Formal complaint from facts |
| Duplicate detection | Text embeddings (+ optional image comparison) | Semantic similarity |
| Resolution check | Multimodal multi-image comparison | Before/after verification |

Model names are configured via env (`GEMINI_MODEL`, `GEMINI_EMBEDDING_MODEL`) so they can be changed without code edits. Check Google's current documentation for the latest available model identifiers when implementing.

---

## 8. Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, React Router, TanStack Query |
| Maps | Leaflet, OpenStreetMap, `leaflet.heat`, `leaflet.markercluster` |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript, Zod, Multer, Sharp, `express-rate-limit`, Helmet, CORS |
| AI | Google Gemini API (`@google/genai` SDK) |
| Database | Supabase (Postgres, optional PostGIS), Supabase Storage |
| Deployment | Vercel (frontend), Render or Railway (backend), Supabase (DB/storage) |

---

## 9. Data Design

### 9.1 Tables

```sql
-- Enable if using PostGIS-based distance search (optional)
-- create extension if not exists postgis;

create table complaints (
  id uuid primary key default gen_random_uuid(),
  case_id text unique not null,
  image_url text not null,

  category text not null,
  severity text not null check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
  confidence float not null,
  description text,
  hazard text,
  department text,
  urgency text,
  recommended_action text,
  severity_reasons jsonb default '[]'::jsonb,
  contains_people_or_plates boolean default false,

  complaint_title text,
  complaint_text_ai text,
  complaint_text_final text,

  latitude float not null,
  longitude float not null,
  address text,

  description_embedding vector(768),   -- requires pgvector; or store as float8[]
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED','UNDER_INSPECTION','IN_PROGRESS','RESOLVED','REOPENED')),
  report_count int not null default 1,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  image_url text not null,
  kind text not null check (kind in ('ORIGINAL','ADDITIONAL','AFTER')),
  note text,
  created_at timestamptz default now()
);

create table case_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  event_type text not null,       -- EVIDENCE_SUBMITTED, AI_ANALYSIS_COMPLETED, SUBMITTED_TO_DEPARTMENT, EVIDENCE_ADDED, STATUS_CHANGED, RESOLUTION_VERIFIED
  title text not null,
  note text,
  created_at timestamptz default now()
);

create table resolution_checks (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  after_image_url text not null,
  resolution_status text not null,
  confidence float,
  before_summary text,
  after_summary text,
  same_location_likelihood text,
  remaining_issues jsonb default '[]'::jsonb,
  admin_confirmed boolean default false,
  created_at timestamptz default now()
);

create table duplicate_decisions (
  id uuid primary key default gen_random_uuid(),
  candidate_case_id text,
  score float,
  user_decision text check (user_decision in ('ADDED_TO_EXISTING','DIFFERENT_ISSUE')),
  created_at timestamptz default now()
);

create table sessions_metrics (
  id uuid primary key default gen_random_uuid(),
  time_to_submit_seconds float,
  complaint_edit_ratio float,
  created_at timestamptz default now()
);

create index on complaints (status);
create index on complaints (category);
create index on complaints (severity);
create index on complaints (created_at desc);
create index on complaints (latitude, longitude);
```

### 9.2 Case ID rules
`CV-` + year + `-` + 5 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. Unique constraint with retry on conflict.

### 9.3 Storage
- Supabase Storage bucket `evidence` (public read for case images; write only via backend service key).
- File naming: `<caseId>/<kind>-<timestamp>.jpg`.

### 9.4 Department mapping (simulated routing)
| Category | Department |
|----------|-----------|
| Pothole, Road Damage, Damaged Footpath | Municipal Roads Department |
| Garbage, Illegal Dumping | Sanitation / Solid Waste Management |
| Broken Streetlight, Exposed Electrical Wire | Electricity / Street Lighting Department |
| Open Manhole, Water Leakage | Water Supply & Sewerage Department |
| Damaged Traffic Sign | Traffic Police / Traffic Engineering |
| Fallen Tree | Horticulture / Parks Department |
| Other | General Civic Grievance Cell |

Gemini suggests the department; the backend normalizes it to this list so the UI is consistent.

---

## 10. API Specification

Base URL: `/api`. All responses JSON. Errors: `{ "error": { "code": "...", "message": "..." } }`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Multipart: `image`, `latitude`, `longitude`, `address`. Returns analysis JSON (F2, F3). |
| POST | `/generate-complaint` | Body: analysis + location. Returns `{ title, complaint, recommended_action }` (F4). |
| POST | `/duplicates/check` | Body: category, lat, lng, description. Returns `{ is_duplicate, candidates: [{case_id, score, distance_m, severity, created_at, report_count}] }` (F9). |
| POST | `/cases` | Creates a case (image, analysis, complaint text AI + final, location). Returns `{ case_id }` (F5). |
| POST | `/cases/:caseId/evidence` | Adds additional evidence to existing case (F9). |
| GET | `/cases` | List with filters: `status, category, severity, from, to, q, sort, page`. |
| GET | `/cases/:caseId` | Single case with evidence, events, resolution checks. |
| GET | `/stats` | Totals, severity breakdown, category distribution (F7). |
| POST | `/cases/:caseId/status` | **Admin.** Body: `{ status, note }` (F11). |
| POST | `/cases/:caseId/verify-resolution` | **Admin.** Multipart: `after_image`. Returns resolution check (F10). |
| POST | `/cases/:caseId/confirm-resolution` | **Admin.** Confirms resolution. |
| GET | `/metrics` | **Admin.** Evaluation and usage metrics (F13). |
| GET | `/health` | Health check. |

**Admin header:** `x-admin-key: <ADMIN_PASSCODE>`.

---

## 11. Gemini Prompt Specifications

### 11.1 Analysis prompt (F2/F3)
```
You are CivicLens AI, a civic infrastructure analysis system.

Analyze the uploaded image and identify any visible civic infrastructure problem.

Possible categories: Pothole, Garbage, Broken Streetlight, Open Manhole,
Damaged Footpath, Exposed Electrical Wire, Water Leakage, Illegal Dumping,
Damaged Traffic Sign, Fallen Tree, Road Damage, Other, None detected.

Evaluate:
1. category
2. severity (LOW | MEDIUM | HIGH | CRITICAL) using this rubric:
   LOW: minor issue, limited immediate impact
   MEDIUM: affects usability or needs attention
   HIGH: potential safety hazard or major infrastructure problem
   CRITICAL: immediate and significant public safety concern
3. confidence (0 to 1)
4. description (what is visible, 1-2 sentences)
5. hazard (public safety risk, if any)
6. department (the most suitable government department)
7. urgency (ROUTINE | SOON | URGENT | IMMEDIATE)
8. recommended_action
9. severity_reasons: 3-5 short bullets, each grounded in something visible in the image
10. contains_people_or_plates: true/false

Rules:
- Base every statement only on what is visible. Do not invent details.
- If no civic problem is visible, return category "None detected".
- Return ONLY valid JSON matching the provided schema.
```

### 11.2 Complaint prompt (F4)
```
Generate a concise, formal civic complaint (80-150 words) based ONLY on the
provided analysis and location. Do not invent street names, dates, or names.
Include: what the problem is, where it is, the hazard it creates, and the
requested action. Return JSON: { "title": "", "complaint": "", "recommended_action": "" }
```

### 11.3 Resolution-check prompt (F10)
```
You are given a BEFORE image and an AFTER image of a reported civic issue,
along with the original analysis. Decide whether the issue appears resolved.
Also judge whether both images plausibly show the same location.
Do not assume resolution; if unsure, say CANNOT_DETERMINE.
Return ONLY JSON: { resolution_status, confidence, before_summary,
after_summary, same_location_likelihood, remaining_issues[] }
```

### 11.4 Duplicate image comparison (optional, F9 v1.1)
```
Do these two photos show the same physical civic defect at the same spot?
Answer JSON: { "same_issue": "YES|NO|UNCERTAIN", "reason": "" }
```

### 11.5 Prompt engineering rules
- Use structured output / response schemas, and validate with Zod.
- Temperature low (≈0.2) for analysis and verification; moderate (≈0.5) for complaint wording.
- Keep prompts in `server/src/prompts/` as versioned constants so they can be cited in the evaluation write-up.

---

## 12. Duplicate Detection — Implementation Notes

```ts
// Haversine distance in meters
function distanceMeters(lat1, lon1, lat2, lon2): number { /* standard formula */ }

async function findDuplicates(newCase) {
  const candidates = await db.getOpenCasesInCategory(newCase.category);
  const nearby = candidates
    .map(c => ({ c, d: distanceMeters(newCase.lat, newCase.lng, c.latitude, c.longitude) }))
    .filter(x => x.d <= DUP_RADIUS_M);              // default 100
  const emb = await embed(newCase.description);
  return nearby
    .map(({ c, d }) => {
      const proximity = 1 - d / DUP_RADIUS_M;
      const sim = cosine(emb, c.description_embedding);
      const score = 0.5 * proximity + 0.2 * 1 + 0.3 * sim;
      return { case: c, distance_m: d, score };
    })
    .filter(x => x.score >= DUP_SCORE_THRESHOLD)    // default 0.65
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
```

Edge cases:
- GPS inaccuracy: if location accuracy > 50 m, widen the radius to 150 m and lower the confidence of the match.
- Resolved cases within 7 days can reappear as "REOPEN existing case?" instead of a duplicate.
- Same user submitting twice quickly: handled by the same logic.

---

## 13. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Performance | Analysis p90 ≤ 10 s; page load LCP ≤ 2.5 s on 4G; dashboard list ≤ 1 s |
| Reliability | Graceful handling of Gemini timeouts (30 s cap, one retry); no data loss on failure |
| Security | API key server-side only; Helmet, CORS allow-list, rate limiting, file-type validation (magic bytes, not just extension), 8 MB limit, parameterized queries, EXIF stripping |
| Privacy | No personal accounts or contact data collected in v1; images stripped of metadata; privacy notice shown; deletion on request (admin script) |
| Scalability | Stateless backend; storage and DB managed by Supabase; pagination on lists |
| Accessibility | WCAG AA, keyboard accessible, color not the only severity cue |
| Observability | Structured server logs (request id, Gemini latency, errors); error boundary on the client |
| Cost control | Compress images before Gemini, cache analysis result per image hash, rate limit |
| Browser support | Latest Chrome, Safari, Edge, Firefox; iOS Safari and Android Chrome |

---

## 14. Project Structure

```
civiclens-ai/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   ├── AnalysisPanel.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── WhySeverity.tsx
│   │   │   ├── ComplaintCard.tsx
│   │   │   ├── DuplicateAlert.tsx
│   │   │   ├── CaseTimeline.tsx
│   │   │   ├── BeforeAfter.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── CivicMap.tsx
│   │   │   └── AnalysisProgress.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Report.tsx
│   │   │   ├── Analysis.tsx
│   │   │   ├── Case.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Admin.tsx
│   │   │   └── Metrics.tsx
│   │   ├── lib/ (api.ts, utils.ts, geo.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── routes/ (analyze.ts, complaints.ts, cases.ts, duplicates.ts, admin.ts, stats.ts)
│   │   ├── services/ (gemini.ts, duplicate.ts, caseId.ts, image.ts, embeddings.ts)
│   │   ├── prompts/ (analysis.ts, complaint.ts, resolution.ts, duplicateImage.ts)
│   │   ├── middleware/ (adminAuth.ts, rateLimit.ts, errorHandler.ts)
│   │   ├── db/ (supabase.ts, schema.sql)
│   │   ├── schemas/ (zod schemas)
│   │   └── index.ts
│   ├── scripts/ (seed.ts, evaluate.ts, evaluateDuplicates.ts)
│   └── package.json
├── eval/
│   ├── images/
│   └── labels.csv
├── .env.example
├── .gitignore
├── README.md
└── PRD.md
```

### Environment variables (server `.env`)
```
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_EMBEDDING_MODEL=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
ADMIN_PASSCODE=
CLIENT_ORIGIN=
DUP_RADIUS_M=100
DUP_SCORE_THRESHOLD=0.65
PORT=8080
```
Client `.env`: `VITE_API_URL=`. Never expose the Gemini key or service key in the client.

---

## 15. Build Plan and Phases

### Phase 1 — Core MVP (F1–F6, ~Days 1–3)
1. Scaffold client (Vite/React/TS/Tailwind/shadcn) and server (Express/TS); env config.
2. Supabase project, tables, storage bucket.
3. Gemini connection; `/analyze` with schema validation.
4. Report page: upload, preview, location.
5. Analysis page: progress, result card, reasons.
6. `/generate-complaint`, edit and regenerate.
7. `/cases` creation, Case ID, success page, case tracking page with timeline.

**Exit criteria:** photo → analysis → complaint → Case ID → case page works end-to-end, deployed.

### Phase 2 — Intelligence and visibility (F7–F9, F11, ~Days 4–6)
8. Dashboard stats, filters, recent cases.
9. Leaflet map, markers, heatmap toggle, clustering.
10. Duplicate detection (embeddings + distance) and the UI flow.
11. Admin passcode and status updates.

### Phase 3 — Trust, verification, evaluation (F10, F12, F13, ~Days 7–9)
12. Before/after resolution verification.
13. Privacy: EXIF stripping, notices, rate limiting.
14. Evaluation scripts, labelled dataset, metrics page.
15. Seed data script, README, screenshots, demo video.

### Phase 4 — Pilot and polish (~Days 10+)
16. Run a user pilot (20–30 users), collect feedback and timing data.
17. Fix issues; finalize the evaluation report.

### Hackathon fast-path
If only ~8 hours are available, follow the sequence: setup → Gemini → Report UI → Analysis UI → complaint → Supabase and Case ID → tracking → dashboard → map → duplicate detection → (if time) before/after. **Hard rule:** if the core flow isn't working end-to-end by the 4-hour mark, stop adding features.

---

## 16. Success Metrics and KPIs

| Metric | Target |
|--------|--------|
| Time from upload to submitted case | median ≤ 60 s (vs. manual baseline measured in pilot) |
| Category accuracy (test set ≥ 100 images) | ≥ 85% |
| Severity agreement with human labels (±1 level) | ≥ 80% |
| Duplicate detection precision / recall | ≥ 80% / ≥ 70% |
| Complaint acceptance without major edits | ≥ 70% of complaints edited < 30% |
| Resolution verification agreement with human check | ≥ 85% |
| Pilot user satisfaction (1–5) | ≥ 4.0 |
| Analysis latency p90 | ≤ 10 s |

---

## 17. Evaluation Plan (for the IEEE CS AI Rising Stars Award application)

The award emphasizes originality, clear AI integration, and measurable societal or technological impact. This section turns CivicLens into evidence for those criteria.

1. **Dataset:** Collect 100–200 real photos of civic issues (campus, local area; photograph them yourself or use open datasets with proper licensing). Label category, severity, and duplicate groups with the help of 2 reviewers.
2. **AI accuracy:** Run `evaluate.ts`; report accuracy, per-category precision/recall/F1, severity agreement, latency.
3. **Duplicate detection:** Build 50+ labelled pairs (same/different); report precision/recall/F1 and show the effect of threshold changes.
4. **Efficiency:** Time 10+ users filing a complaint manually (find department, write complaint) vs. using CivicLens; report median time saved.
5. **Complaint quality:** Have 3–5 reviewers rate AI complaints vs. manually written ones (clarity, completeness, formality, 1–5).
6. **Resolution verification:** Test with 20+ before/after pairs including negative cases (unrepaired, wrong location).
7. **Pilot:** 20–30 real users (students, residents); collect SUS or a short satisfaction survey and qualitative feedback.
8. **Responsible AI section:** Document hallucination handling, privacy (EXIF stripping, faces/plates), human-in-the-loop (user edits, admin confirms), limitations (lighting, ambiguous images), and bias considerations (performance across lighting, camera quality, and area types).
9. **Deliverables:** Public deployed link, GitHub repo, 2–3 minute demo video, 2–4 page technical report with the above results, and a recommendation letter from a faculty mentor.

---

## 18. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Gemini misclassifies or hallucinates | Wrong complaint | Schema validation, grounded prompts, low-confidence banner, user edit step, manual category override |
| API quota/latency | Poor demo | Image compression, caching by hash, rate limits, retry/backoff, pre-run demo cases |
| Duplicate false positives | Genuine issues merged | "This is a different issue" override, conservative thresholds, logging of overrides |
| Duplicate false negatives | Redundant cases | Tune thresholds using the labelled pairs; add image comparison step |
| Privacy (faces/plates/EXIF) | Trust and legal risk | EXIF stripping, notices, warning flag, retake prompt |
| Fake/abusive reports | Noise | Rate limiting, "None detected" gating, admin review |
| Admin passcode is weak security | Unauthorized changes | Document as demo-grade; plan Supabase Auth for production |
| No real municipal integration | Limited real-world impact | Position as a decision-support/reporting layer; show department mapping as extensible; mention integration path |
| Scope creep before deadline | Unfinished product | Strict phase gates and MVP cut line (F1–F6) |

---

## 19. Demo Script (about 90 seconds)

1. **Hook:** "Imagine I'm walking down the road and find this pothole." Open Report, upload the photo, confirm location.
2. **Problem framing:** "Normally I'd need to find the right department and write a complaint." Click **Analyze with Gemini**.
3. **Reveal:** Show POTHOLE · HIGH · 94% · Municipal Roads · IMMEDIATE and the "Why HIGH?" reasons.
4. **Complaint:** Show the generated complaint; make a small edit; click **Submit Case**.
5. **Case ID:** Show `CV-2026-A82F4` and the tracking page timeline.
6. **Dashboard and map:** Show stats, filters, severity heatmap.
7. **Duplicate:** Upload a second photo of the same pothole → "Possible duplicate" → add evidence to the existing case.
8. **Close the loop:** Admin uploads an after-photo → "LIKELY RESOLVED (91%)" before/after panel.
9. **Close:** "From evidence to action: image, issue, severity, risk, department, complaint, case, resolution."

---

## 20. Definition of Done

- [ ] All 13 features implemented to the acceptance criteria above
- [ ] Deployed publicly (frontend, backend, database) and working on mobile
- [ ] Gemini key only on the server; `.env` not in the repository
- [ ] Seed/demo data script and clearly labelled demo data
- [ ] README with setup, architecture diagram, env vars, and screenshots
- [ ] Evaluation scripts run, and results recorded in the report
- [ ] Demo video recorded
- [ ] Known limitations documented (admin auth, simulated department routing, AI errors)

---

## 21. Future Enhancements (post-v1)
- Real authentication (Supabase Auth), citizen accounts, and notifications (email/WhatsApp)
- Integration with municipal grievance portals (e.g., CPGRAMS/state portals) via API or automated form submission
- Multi-language complaints and voice input (Hindi and regional languages)
- Automatic face/plate blurring
- Community upvoting and neighborhood leaderboards
- Predictive hotspot analysis and trend reports for authorities
- Offline-capable PWA with queued uploads
