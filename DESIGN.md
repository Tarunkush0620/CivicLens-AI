# CivicLens AI — Design System (DESIGN.md)

**Companion to:** `PRD.md`
**Design direction:** Premium, professional civic-intelligence command center. Dark-first, map-centered, evidence-led.
**References:** (1) light "Ground Intelligence" list + detail + map layout, (2) dark CivicLens dashboard with AI analysis panel, (3) dark CivicLens dashboard with hero banner, KPI row, city map, and insights.

---

## 1. Design Intent

CivicLens should feel like software a city operations team would trust: dense but calm, data-rich but never noisy, with the AI's work always visible and always explainable.

**The one memorable element:** the **evidence photo with AI detection overlay**. A red detection box on a real photograph, a small "AI detected" tag, and a confidence bar. This is the signature image of the product, and it appears in the analysis panel, the case page, and the map popups. Everything else stays quiet so this moment lands.

**Principles**
1. **Evidence first.** Photos are the most important content. They get the largest, cleanest surfaces and are never decorated over.
2. **Severity is the only loud color.** Red, amber, and green carry meaning. Brand blue is used sparingly (primary actions, selection, links). Nothing else competes.
3. **Explain, don't just label.** Every AI output pairs a result with its reason ("High, because the pothole sits in the vehicle path").
4. **Calm density.** Many data points per screen, held together by consistent spacing, hairline borders, and restrained type, not by boxes and shadows.
5. **One gradient only.** The primary call-to-action gets the blue-to-violet gradient. No gradient washes behind cards or sections.
6. **Honest data.** Demo data is labelled as demo data. Estimates are labelled as estimates.

---

## 2. What We Take From Each Reference

| Reference | Take | Adapt / avoid |
|-----------|------|---------------|
| **Ground Intelligence (light)** | Three-column logic: filterable list on the left, detail drawer in the middle, map on the right. Compact list rows with title, coordinates, and a severity chip. Observation thumbnails in the drawer. "Impact trend" sparkline. | Light theme is offered as a secondary theme. Skip the heavy icon-only left rail; CivicLens uses a labelled sidebar. |
| **Dashboard with AI panel (dark)** | Six-KPI top strip; reported-issues list with thumbnails; dark satellite map with category filter chips and layer switcher (Map, Satellite, Terrain, Heatmap, Clusters); right-hand AI Analysis panel with detection box, confidence bar, and six info tiles; "Locate on Map" and "Generate Complaint" actions. | Keep the right panel as the template for the Case page. |
| **Dashboard with hero (dark)** | Sidebar with labelled navigation; hero banner with floating detection chips; category KPI row with mini sparklines; city map with clusters; recent-reports table; impact donut; duplicate-detection strip with distance and age. | Hero is for the Home/Dashboard landing only. In day-to-day use, collapse it. |

**Dropped from the references on purpose:** floating decorative chips that don't carry data, redundant stat repetition (the same totals shown in three places), and neon glows on every card.

---

## 3. Color

Dark is the default theme. Light theme values are in 3.4.

### 3.1 Dark theme (default)

| Token | Hex | Use |
|-------|-----|-----|
| `--bg-canvas` | `#070B14` | App background behind everything |
| `--bg-sidebar` | `#0A1020` | Sidebar and top bar |
| `--bg-surface` | `#0E1626` | Cards, panels, list rows |
| `--bg-surface-raised` | `#131D31` | Popups, dropdowns, selected rows, inner tiles |
| `--bg-hover` | `#182440` | Hover and pressed states |
| `--border-subtle` | `rgba(148,163,184,0.12)` | Default card and divider lines |
| `--border-strong` | `rgba(148,163,184,0.24)` | Inputs, focused containers |
| `--text-primary` | `#E8EEF9` | Headings, key values |
| `--text-secondary` | `#9AA8C2` | Body, labels |
| `--text-tertiary` | `#6B7A96` | Hints, timestamps, placeholders |
| `--accent` | `#2F7BFF` | Links, selection, focus rings, active nav |
| `--accent-violet` | `#7B5CFF` | Gradient end only |
| `--accent-gradient` | `linear-gradient(90deg,#1F8BFF 0%,#6B6BFF 60%,#7B5CFF 100%)` | Primary CTA only |
| `--ai-detect` | `#22C58B` | "AI detected" tag, positive AI states |

### 3.2 Semantic colors

| Meaning | Foreground | Tinted background (chip/tile) |
|---------|-----------|-------------------------------|
| **Critical** | `#FF4D6D` | `rgba(255,77,109,0.18)` |
| **High** | `#F0484E` | `rgba(240,72,78,0.16)` |
| **Medium** | `#F5A524` | `rgba(245,165,36,0.16)` |
| **Low** | `#34C77B` | `rgba(52,199,123,0.16)` |
| **Status: Open** | `#3B82F6` | `rgba(59,130,246,0.16)` |
| **Status: In progress** | `#F5A524` | `rgba(245,165,36,0.16)` |
| **Status: Resolved** | `#34C77B` | `rgba(52,199,123,0.16)` |
| **Status: Reopened** | `#B28BFF` | `rgba(178,139,255,0.16)` |

Severity chips use the tinted background, a 1px border at 35% of the foreground color, and foreground-colored text.

### 3.3 Category colors (map markers, donut, filters)

| Category | Color | Icon (Lucide) |
|----------|-------|---------------|
| Pothole / Road damage (surface) | `#F0484E` | `triangle-alert` |
| Streetlight / Electrical | `#F5C542` | `lightbulb` |
| Garbage / Illegal dumping | `#3BA3FF` | `trash-2` |
| Drainage / Water leakage / Manhole | `#29C7E8` | `droplets` |
| Road damage (structural) / Footpath | `#9B6BFF` | `construction` |
| Traffic sign / Tree / Others | `#7C8AA5` | `circle-help` |

Color is never the only cue. Every category and severity also has an icon and a text label.

### 3.4 Light theme

| Token | Hex |
|-------|-----|
| `--bg-canvas` | `#F3F5F9` |
| `--bg-sidebar` | `#FFFFFF` |
| `--bg-surface` | `#FFFFFF` |
| `--bg-surface-raised` | `#F7F9FC` |
| `--border-subtle` | `#E5E9F0` |
| `--text-primary` | `#0F172A` |
| `--text-secondary` | `#475569` |
| `--text-tertiary` | `#8492A6` |
| `--accent` | `#1F6BF2` |

Semantic colors keep the same hues, with text darkened one step for contrast (High `#C8323A`, Medium `#B7790A`, Low `#1F8F55`).

### 3.5 Contrast rules
- Body text on surfaces: at least 4.5:1. Large text and icons: at least 3:1.
- Severity text on its tinted chip must pass 4.5:1; adjust the foreground, not the chip, if it fails.
- Map overlays (popups, controls) always sit on a solid raised surface, never directly on imagery.

---

## 4. Typography

**One family: Manrope** (Google Fonts), weights 400, 500, 600, 700, 800. Fallback: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

Manrope's geometric but slightly humanist forms feel technical without the generic look of the default UI sans. Numerals use `font-variant-numeric: tabular-nums` everywhere data is shown, so KPIs, tables, and timestamps align.

| Role | Size / line height | Weight | Notes |
|------|--------------------|--------|-------|
| Hero headline | 40 / 48 | 800 | Letter-spacing -0.02em. Hero only. |
| Page title | 28 / 36 | 700 | -0.01em |
| Section title | 18 / 26 | 700 | Card headers ("City Map", "Recent Reports") |
| KPI value | 30 / 36 | 700 | Tabular numerals |
| Card title / list title | 15 / 22 | 600 | |
| Body | 14 / 22 | 500 | `--text-secondary` |
| Small / meta | 12.5 / 18 | 500 | Timestamps, IDs, coordinates |
| Chip / badge | 12 / 16 | 600 | Sentence case |
| Button | 14 / 20 | 600 | Sentence case |

**Rules**
- Sentence case everywhere. No tracked-out all-caps labels.
- Maximum line length 70 characters for paragraphs (complaint text, AI description).
- Case IDs (`CV-2026-8F42A`) use weight 600 with `letter-spacing: 0.02em` so they read as identifiers.
- Do not accent single words in headlines with color or italics.

---

## 5. Spacing, Radius, Elevation

**Spacing:** 4px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 56.
- Page padding: 24px (desktop), 16px (mobile).
- Gap between cards: 16px. Inside cards: 16-20px padding.
- List row padding: 12px 16px.

**Radius (varies with hierarchy, not one value everywhere)**
| Element | Radius |
|---------|--------|
| App-level panels, map container, modals | 18px |
| Cards, KPI cards, list rows | 14px |
| Inner tiles (AI info tiles), inputs, buttons | 10px |
| Chips, filter pills, avatars | 999px |
| Evidence images | 12px |

**Elevation** is created by surface lightness and borders, not heavy shadows.
- Cards: `--bg-surface` + 1px `--border-subtle`. No shadow.
- Raised (popups, dropdowns, map popup): `--bg-surface-raised` + `--border-strong` + `0 12px 32px rgba(0,0,0,0.45)`.
- Selected list row: `--bg-surface-raised`, 1px `--accent` border, and a 3px accent bar on the left.
- Focus ring: 2px `--accent` with 2px offset, on every interactive element.

---

## 6. Layout

### 6.1 App shell
```
┌──────────┬──────────────────────────────────────────────────────────────┐
│          │  Search (⌘K)               Location ▾    🔔    Profile       │  64px top bar
│ Sidebar  ├──────────────────────────────────────────────────────────────┤
│ 232px    │                                                              │
│          │                    Page content                              │
│ (72px    │                    max-width 1680px, centered                │
│ collapsed│                                                              │
│  on <1280)                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```
- Sidebar: logo + tagline, nav items with icon and label, active item has `--bg-surface-raised`, accent icon, and a 3px accent bar. Bottom: a compact "Report an issue" button (outlined, accent border).
- Top bar: global search (Case ID, location, issue type), location selector, notifications, profile.
- Below 1024px the sidebar becomes a bottom tab bar (Home, Map, Report, Cases, More).

### 6.2 Dashboard layout (desktop ≥ 1280px)
```
┌─ KPI strip: Total · Resolved · In progress · Open · Resolution rate · Avg. resolution time ─┐
├───────────────────┬───────────────────────────────────┬──────────────────────────────┤
│ Reported issues   │            City map               │  Case detail / AI analysis   │
│ (list + filters)  │  category chips · layer switcher  │  evidence + detection box    │
│ 360px             │  markers · clusters · heatmap     │  confidence · info tiles     │
│                   │  flexible                         │  actions     380px           │
├───────────────────┴──────────────┬────────────────────┴──────────────────────────────┤
│ Recent reports (table)           │ Impact insights (donut) · Similar reports strip   │
└──────────────────────────────────┴───────────────────────────────────────────────────┘
```
- At 1024-1279px: the right panel becomes a slide-over drawer opened by selecting a case.
- At < 768px: stacked. KPI strip scrolls horizontally; map first, then list; case detail opens full-screen.

### 6.3 Alignment
Left-aligned text and numbers in cards; numeric columns in tables right-aligned; the hero text left-aligned over imagery; confirmation screens (case submitted) center-aligned.

---

## 7. Components

### 7.1 KPI card
- 14px radius, `--bg-surface`, 1px subtle border, 16px padding.
- Left: 40px rounded-10 icon tile tinted with the metric's color. Right: label (small, secondary), value (30px), delta chip.
- Delta chip: ▲/▼ glyph + percent, green for good movement, red for bad. "Open issues" going down is good, so color follows meaning, not direction.
- Optional 56x20 sparkline in the card's color (category KPIs only).
- Skeleton state: grey bars at the same heights.

### 7.2 Severity badge
Pill, 22px tall, icon (triangle-alert) + text ("High"). Tinted background, 1px border at 35% opacity. Critical gets a soft outer glow (`0 0 0 3px rgba(255,77,109,0.18)`). That is the only glow in the system.

### 7.3 Category chip / filter pill
- Pill, 32px tall, icon tinted with the category color, label, optional count ("Potholes 820").
- Inactive: `--bg-surface-raised` + subtle border. Active: accent border + accent-tinted background.
- Row scrolls horizontally with edge fade on overflow.

### 7.4 Reported-issue list row
```
┌────────────────────────────────────────────────────────┐
│ [64x64 thumb]  [High]  Pothole - Patched required       │
│                📍 Sector 62, Greater Noida              │
│                #CV-2026-8F42A · Apr 22, 10:24 AM    ›   │
└────────────────────────────────────────────────────────┘
```
- Thumbnail 64x64, 12px radius. Severity chip sits above the title. Meta line in tertiary text.
- If `report_count > 1`: small "7 reports" pill with a users icon beside the date (duplicate-merge signal).
- Selected: see Elevation. Hover: `--bg-hover`.

### 7.5 Evidence viewer with AI detection overlay (signature component)
```
┌───────────────────────────────────────────┐
│ [AI detected]                              │  ← green tag, top-right, 12px radius
│                                            │
│            ┌─────────────┐                 │
│            │  detected   │  ← 2px red box  │
│            │   region    │    (category    │
│            └─────────────┘     color)      │
│  ‹                                      ›  │
│                  1 / 4                     │
└───────────────────────────────────────────┘
 [thumb][thumb][thumb][▶ video]
```
- Detection box: 2px stroke in the category color, 6px radius, no fill. Region comes from Gemini's `box_2d` (0-1000, `[ymin, xmin, ymax, xmax]`) if returned (see PRD addendum, 11.6), otherwise omit the box and never fake one.
- Thumbnail strip beneath; the selected thumb has an accent border.
- Image zoom on click (lightbox with arrow-key navigation).

### 7.6 AI analysis panel
Header: sparkle icon + "AI analysis" + confidence value ("Confidence 96%") with a 120px progress bar (accent fill, 6px tall, fully rounded).
Six info tiles in a 2x3 grid (10px radius, `--bg-surface-raised`, icon tile left, label above value):
1. Issue type
2. Severity (colored value)
3. Department (recommended)
4. Urgency / estimated priority ("High, 1-3 days")
5. Hazard
6. Location type (for example "Main road"), shown only if Gemini returned it

Below tiles: **Why this severity** (3-5 bullets with check icons), then **AI description** in body text, then actions.

Actions row: secondary button **Locate on map** (outlined, pin icon) and primary button (gradient). In the report flow the primary is **Submit case**. On an existing case the primary is **View complaint**.

Footer note, tertiary text: "AI can make mistakes. Check the details before you submit."

### 7.7 Buttons
| Type | Look |
|------|------|
| Primary | `--accent-gradient`, white text, 44px tall (36px compact), 10px radius, subtle top highlight. Hover brightens 6%. One per view. |
| Secondary | Transparent, 1px `--border-strong`, primary text. Hover `--bg-hover`. |
| Tertiary | Text-only, accent color. |
| Destructive | Red text, red-tinted hover. Admin only. |
- Icon on the left only. No arrows appended to labels.
- Loading state keeps the width; spinner replaces the icon; label changes to the progress form ("Analyzing...").
- Disabled: 45% opacity and a tooltip that says what is missing ("Add a photo first").

### 7.8 Map
- Engine: **Mapbox GL JS** (matches the reference). Free-tier token required (`VITE_MAPBOX_TOKEN`). Fallback if a token isn't available: MapLibre GL JS with open vector tiles.
- Default style: dark satellite-streets. Layer switcher bottom center (segmented control): Map, Satellite, Terrain, Heatmap, Clusters.
- Markers: 34px circular pins in category color with white icon, 2px dark ring. Selected marker: 1.25x scale plus a pulsing ring (one pulse on select, not continuous).
- Clusters: translucent teal circles with count; size scales with count.
- Heatmap weights: Critical 1.0, High 0.75, Medium 0.5, Low 0.25.
- Popup: 280px, raised surface, thumbnail left, severity chip, title, location, relative time, "View details" link.
- Controls: zoom +/-, locate-me, fullscreen, all in a vertical stack, 40px square, raised surface.
- Resolved cases: grey pin with a check; hidden by default behind a "Show resolved" toggle.

### 7.9 Duplicate-detection strip
Heading "Similar reports nearby" with a count. Horizontal cards (thumbnail, "120 m away", "2 days ago", similarity badge). Primary action inside the card: **Add my photo to this case**. Secondary: **This is a different issue**. When shown during reporting, it appears as a warning-tinted banner (amber) above the Submit button; on the dashboard it is informational.

### 7.10 Recent reports table
Columns: ID, Image (40px thumb), Issue type (icon + label), Location, Severity, Status, Reported. Sticky header, 48px rows, hover highlight, row click opens case. Right-align the time column. Mobile: collapses to list rows (7.4).

### 7.11 Impact insights (donut)
Donut 160px with total in the center; legend on the right with category dot, name, percent. Use category colors. A segment's tooltip shows count and percent. Title: "Impact insights", with a period dropdown (This month, 90 days, All time).

### 7.12 Case timeline
Vertical, 2px line in `--border-strong`; completed steps have a filled accent circle with a check; current step has a ring; future steps are hollow. Each step: title, timestamp, optional note. Admin-added notes appear with the author role.

### 7.13 Before/after resolution panel
Two images side by side with a draggable divider (slider) and "Before" and "After" tags. Below: result card ("Likely resolved, 91% confidence") with the same tinted-chip style as severity (green for resolved, amber for partial, red for not resolved, grey for cannot determine). Note in tertiary text: "AI check. An admin confirms the final status."

### 7.14 Upload zone
Large dashed 2px border in `--border-strong`, 18px radius, camera icon, "Drop a photo here or choose a file", small text "JPG, PNG or WEBP, up to 8 MB". Drag-over: accent border + accent tint. After upload: replaced by the preview with a "Replace photo" tertiary button. A privacy hint with a shield icon: "Avoid faces and number plates."

### 7.15 Analysis progress
A 4-step vertical list in a raised card: Image received, Identifying infrastructure, Assessing severity, Writing complaint. Completed steps show a green check; the active step shows a spinner; pending steps are dim. Steps update on real backend events when available.

### 7.16 Toasts, dialogs, empty and error states
- Toast: bottom-right, raised surface, 4s, includes an action when useful ("Copy case ID").
- Dialogs: 18px radius, centered, backdrop `rgba(3,6,12,0.7)` with 4px blur.
- Empty state: icon, one-line statement, one action. Example: "No reports match these filters." with "Clear filters".
- Errors say what happened and what to do: "Analysis timed out. Try again, or pick the category yourself."

---

## 8. Screens

### 8.1 Dashboard (`/dashboard`)
As in 6.2. The hero banner from reference 3 appears **only on the Home page**, not here. Selecting a list row or marker populates the right panel (7.6) and highlights the marker. Filters (category chips, severity, status, date) apply to the list, map, table, and donut together.

### 8.2 Home (`/`)
Hero banner (image of a city at night with two or three real detection chips drawn from actual sample photos, not decorative placeholders), headline "See it. Report it. Fix it." One primary CTA ("Report an issue") and one secondary ("Watch demo", only if a demo video exists). Beneath: live stats strip, how-it-works in four steps (this one is a real sequence, so numbering is appropriate), and a small map.

### 8.3 Report (`/report`)
Two-column on desktop: left, upload zone and location; right, a live "what happens next" summary of the 4 steps. After analysis, the page transitions in place to the analysis state rather than navigating, so the photo stays on screen.

### 8.4 Analysis (`/report/analysis`)
Left (60%): evidence viewer (7.5) with detection overlay and the AI info tiles. Right (40%): generated complaint card (editable textarea with title field, Regenerate, character count), duplicate banner if applicable, **Submit case** (primary). Mobile: stacked in the same order.

### 8.5 Case (`/case/:caseId`)
Same structure as the dashboard's right panel but full width: header (case ID with copy button, status chip, severity chip), evidence viewer + thumbnails, AI analysis tiles, complaint text, timeline, before/after panel (if present), "Reports on this case: N" and the admin actions (if admin mode).

### 8.6 Submitted (`/case/:id?submitted=1`)
Centered. Large success check in a green ring, "Case submitted", the Case ID in a bordered raised block with a copy button, a 4-row summary (issue, severity, department, status), and two buttons: **Track case** (primary) and **Report another issue** (secondary).

### 8.7 Admin (`/admin`)
Passcode gate (single field, centered). Then the dashboard with admin controls revealed in the right panel: status stepper (Submitted, Under inspection, In progress, Resolved), note field, "Upload after photo" action, and the AI resolution result with **Confirm resolved**.

### 8.8 Metrics (`/metrics`)
Evaluation numbers: accuracy, per-category F1 bar chart, duplicate precision and recall, time-to-submit distribution, complaint edit ratio. Clean chart cards, each with a one-line takeaway under the chart title.

---

## 9. Motion

Motion is used to show what changed, not to decorate.

| Moment | Behavior | Duration |
|--------|----------|----------|
| Page load | Single orchestrated reveal: KPI strip fades in, then panels (staggered 60ms). Once per session. | 400ms |
| Selecting a case | Panel content cross-fades; the marker pulses once; map eases to the location | 250ms / 600ms |
| AI analysis | Steps check off in sequence; the detection box draws in (stroke animates around the box) when the result lands | 500ms |
| Confidence bar | Fills from 0 to value on first display | 600ms |
| Number changes | KPI values count up once on first load, then update without animation | 700ms |
| Hover | Background color change only | 120ms |
| Submit success | The check mark draws in; the Case ID fades up | 400ms |

- No continuous or looping animation except the loading spinner.
- Respect `prefers-reduced-motion`: replace all of the above with instant state changes.
- Easing: `cubic-bezier(0.2, 0.7, 0.2, 1)` for entrances; `ease-in-out` for color changes.

---

## 10. Iconography and Imagery

- **Icons:** Lucide, 1.75px stroke, 20px default (16px in chips, 24px in KPI tiles). Rounded caps and joins.
- **Photography:** Real civic photographs only. No stock "smart city" illustrations in functional views. Demo/seed data uses real photos you took or properly licensed ones, and the demo database is labelled "Demo data" in the footer and in the README.
- **Thumbnails:** crop to 1:1 with `object-fit: cover`; keep original aspect ratio in the viewer.
- **Logo:** simple glyph (a lens/aperture combined with a map pin) in the accent gradient on a transparent background; wordmark "CivicLens" in Manrope 700 with "AI" in 600. Tagline in tertiary text: "See. Report. Resolve."

---

## 11. Data Visualization Rules

- One chart type per question: donut for composition of categories, bar for comparison (per-category F1), line/sparkline for trend, heatmap for geographic density.
- Direct labels where possible; legends only for the donut.
- Gridlines: horizontal only, `--border-subtle`. No chart borders. Axis text 12px tertiary.
- Chart tooltips use the raised surface with exact values.
- Always show the time period of a chart in its title or dropdown.
- Never use 3D or gradient fills on data marks.

---

## 12. Accessibility and Quality Floor

- WCAG 2.2 AA: contrast per 3.5, visible focus (2px accent ring), keyboard access for every control including the map (arrow keys pan, +/- zoom, markers focusable).
- Touch targets at least 44x44px on mobile.
- Severity and category always have text plus icon, never color alone.
- Image alt text from the AI description (edited by the user), e.g. "Large pothole in the right lane of the road, Sector 62."
- Respect `prefers-reduced-motion` and `prefers-color-scheme` (default to dark, remember the user's choice).
- Forms: labels always visible, errors inline and announced (`aria-live="polite"`).
- Performance: lazy-load map and charts; thumbnails served at 2x of display size; skeletons for every async region; LCP target under 2.5s.

---

## 13. Voice and Copy

Plain, active, sentence case. Name things by what users understand.

| Instead of | Use |
|-----------|-----|
| Submit | Submit case |
| Analyze | Analyze photo |
| Error 500 | Something went wrong on our side. Try again in a moment. |
| Invalid image | That file isn't a photo we can read. Use a JPG, PNG, or WEBP under 8 MB. |
| No data | No reports match these filters. |
| Duplicate detected | Similar report nearby |

Success messages echo the action: "Submit case" leads to "Case submitted". AI output is labelled "AI analysis" and always paired with the reminder that the user can edit it.

---

## 14. Implementation Tokens (Tailwind + shadcn/ui)

### 14.1 CSS variables (`client/src/index.css`)
```css
:root {
  --font-sans: "Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  /* Dark theme default */
  --bg-canvas: #070B14;
  --bg-sidebar: #0A1020;
  --bg-surface: #0E1626;
  --bg-surface-raised: #131D31;
  --bg-hover: #182440;
  --border-subtle: rgba(148,163,184,0.12);
  --border-strong: rgba(148,163,184,0.24);
  --text-primary: #E8EEF9;
  --text-secondary: #9AA8C2;
  --text-tertiary: #6B7A96;
  --accent: #2F7BFF;
  --accent-gradient: linear-gradient(90deg,#1F8BFF 0%,#6B6BFF 60%,#7B5CFF 100%);
  --ai-detect: #22C58B;

  --sev-critical: #FF4D6D;
  --sev-high: #F0484E;
  --sev-medium: #F5A524;
  --sev-low: #34C77B;

  --status-open: #3B82F6;
  --status-progress: #F5A524;
  --status-resolved: #34C77B;
  --status-reopened: #B28BFF;

  --cat-pothole: #F0484E;
  --cat-light: #F5C542;
  --cat-garbage: #3BA3FF;
  --cat-water: #29C7E8;
  --cat-structure: #9B6BFF;
  --cat-other: #7C8AA5;

  --radius-panel: 18px;
  --radius-card: 14px;
  --radius-control: 10px;
}

[data-theme="light"] {
  --bg-canvas: #F3F5F9;
  --bg-sidebar: #FFFFFF;
  --bg-surface: #FFFFFF;
  --bg-surface-raised: #F7F9FC;
  --bg-hover: #EEF2F8;
  --border-subtle: #E5E9F0;
  --border-strong: #CBD5E1;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #8492A6;
  --accent: #1F6BF2;
}

body {
  background: var(--bg-canvas);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

### 14.2 Tailwind extension (`tailwind.config.ts`)
```ts
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)"] },
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        raised: "var(--bg-surface-raised)",
        sidebar: "var(--bg-sidebar)",
        line: "var(--border-subtle)",
        "line-strong": "var(--border-strong)",
        ink: { DEFAULT: "var(--text-primary)", 2: "var(--text-secondary)", 3: "var(--text-tertiary)" },
        accent: "var(--accent)",
        sev: { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)" },
        status: { open: "var(--status-open)", progress: "var(--status-progress)", resolved: "var(--status-resolved)", reopened: "var(--status-reopened)" },
        cat: { pothole: "var(--cat-pothole)", light: "var(--cat-light)", garbage: "var(--cat-garbage)", water: "var(--cat-water)", structure: "var(--cat-structure)", other: "var(--cat-other)" },
      },
      borderRadius: { panel: "18px", card: "14px", control: "10px" },
      backgroundImage: { "accent-gradient": "var(--accent-gradient)" },
    },
  },
};
```

### 14.3 Component inventory (maps to `PRD.md` Section 14)
`AppShell`, `Sidebar`, `TopBar`, `KpiCard`, `SeverityBadge`, `StatusChip`, `CategoryChip`, `IssueRow`, `EvidenceViewer`, `DetectionOverlay`, `AnalysisPanel`, `InfoTile`, `ConfidenceBar`, `WhySeverity`, `ComplaintCard`, `DuplicateStrip`, `CivicMap` (+ `MapLayerSwitcher`, `MapPopup`), `ReportsTable`, `ImpactDonut`, `CaseTimeline`, `BeforeAfter`, `UploadZone`, `AnalysisProgress`, `Toast`, `EmptyState`.

Use shadcn/ui primitives for Button, Dialog, DropdownMenu, Tabs, Tooltip, Skeleton, Toast, and Sheet (the mobile and tablet drawer), restyled with the tokens above.

---

## 15. Differences From the Reference Mockups (and PRD Updates Needed)

The reference images show some features and numbers that are not in `PRD.md` or that need a decision. Resolve them before building.

| Item in mockup | Decision |
|----------------|----------|
| **Mapbox** with satellite, terrain, and cluster layers | Use Mapbox GL JS (free-tier token) or MapLibre as the fallback. **Update PRD F8**, which currently says Leaflet. |
| **KPI numbers** (12,450 issues, 8,920 resolved, 5.2 days) | These are mock numbers. In the real app all figures come from the database. Seed data must be labelled "Demo data". Do not present invented numbers as real results in the award application. |
| **Estimated size** ("~0.8 m diameter") and **Road type** | A single photo can't reliably give real-world size. Show only if Gemini returns it, label it "Approximate size (AI estimate)", or leave it out. Road type is fine as an optional AI field. |
| **Bounding box on the photo** | Add `box_2d` (Gemini's documented format: integers 0-1000 in `[ymin, xmin, ymax, xmax]` order, relative to image size) to the analysis schema (PRD 11.6 addendum). Convert to pixels in the client (value / 1000 × image height or width) and draw it only when present and valid (ymin < ymax, xmin < xmax). See RESEARCH.md section 5.1. |
| **Estimated priority** ("High, 1-3 days") | Derive from `urgency` with a fixed mapping (IMMEDIATE = same day, URGENT = 1-3 days, SOON = 3-7 days, ROUTINE = 7-14 days), shown as "target response". |
| **Leaderboard, Community, My Reports, Department Portal, Analytics** nav items | Not in PRD v1. **Keep in the sidebar only if built.** Recommended v1 nav: Dashboard, Report issue, AI analysis (history), City map, Reports, Analytics (the Metrics page), Settings. Leaderboard and Community are post-v1. |
| **"Generate complaint" button on an existing case** | In the PRD the complaint is auto-generated in the report flow. On existing cases show **View complaint**. |
| **Video evidence thumbnail** | Out of scope for v1 (images only). Remove from the viewer. |
| **"Watch demo" button** | Include only when a demo video exists. |
| **Resolution rate and average resolution time KPIs** | Add `GET /api/stats` fields `resolution_rate` and `avg_resolution_hours` (computed from `case_events`). |
| **Today's impact / Impact insights** | Supported by `GET /api/stats` (add daily counts and category distribution). |

**Suggested PRD addendum (11.6) for the analysis schema**
```json
"box_2d": [420, 380, 710, 660],
"road_type": "Main road"
```
Both optional; the UI hides them when missing.

---

## 16. Do and Don't

**Do**
- Let the evidence photo and the detection box be the hero of every analysis view.
- Pair every AI label with a reason.
- Keep severity colors reserved for severity.
- Use real data and label demo data.
- Keep one primary button per view.

**Don't**
- Add glow, gradient, or neon effects to cards.
- Use all-caps tracked labels, middle-dot meta strings, or trailing arrows on buttons.
- Show the same stat in more than one place on a screen.
- Fake AI output (for example, a bounding box that wasn't returned).
- Use color as the only indicator of severity or status.
- Animate things that loop or that the user didn't trigger.

---

## 17. Build Checklist

- [ ] Fonts loaded (Manrope 400-800) with `font-display: swap`
- [ ] Tokens in `index.css`, Tailwind extended, shadcn restyled
- [ ] Dark and light themes both pass contrast checks
- [ ] AppShell, Sidebar, TopBar responsive (sidebar to bottom tabs under 1024px)
- [ ] KPI, Severity, Status, Category components with skeleton states
- [ ] EvidenceViewer with DetectionOverlay (renders only with a real bounding box)
- [ ] AnalysisPanel with ConfidenceBar and WhySeverity
- [ ] CivicMap with five layers, clusters, popup, and filters tied to the list
- [ ] DuplicateStrip in both the report flow and the dashboard
- [ ] BeforeAfter slider and resolution result card
- [ ] CaseTimeline, Submitted page, Admin controls
- [ ] Keyboard navigation, focus rings, `prefers-reduced-motion` verified
- [ ] Screenshots captured at 1440px, 1024px, and 390px for the README and award report
