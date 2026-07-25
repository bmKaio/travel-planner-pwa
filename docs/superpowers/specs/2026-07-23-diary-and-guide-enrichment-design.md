# Travel Diary + Public Guide Enrichment — Design Spec

**Date:** 2026-07-23
**Status:** Approved
**Routes:** `/diary`, `/diary/:date`

---

## Overview

Two independent pieces built from one source — the trip owner's Obsidian journal
(`Viaje-Vietnam/`, 17 daily notes, 2026-07-04 → 2026-07-20):

- **Piece A — Diary feature (new domain).** A private, first-person travel diary rendered
  inside the app. The _code_ ships publicly (empty state for anyone), but the _content_ is
  personal and loads only via a dedicated private JSON import on the owner's device. Never
  seeded, never part of the public deploy.
- **Piece B — Public guide enrichment (content only).** Additive updates to the seed so the
  deployed app works as a real, anonymized reference guide for someone planning the same
  trip. New `places` and `recommendations` derived from the journal, in impersonal guide
  voice. The existing planned itinerary and `dailyPlans` are **not** rewritten.

The two pieces are separable and will be implemented as separate slices. This is the
hybrid model chosen during brainstorming: public anonymized guide + private personal diary.

### Privacy contract (non-negotiable)

The app deploys publicly to GitHub Pages. Therefore:

- Personal reflections, "momento destacado", "notas / reflexiones", people's names, and any
  personal data **never** enter the seed or the public guide. They live **only** in the
  private diary, loaded by import.
- The private diary JSON is generated to the scratchpad and is **never committed** to the
  repo, matching the existing memory rule "sensitive docs go via JSON import, never the
  public-deployed seed".
- The dedicated diary import is **isolated** from the general backup export/import so private
  content can never be dragged into a shared backup or the seed.

---

## Piece A — Diary Feature

### Data Layer

#### `src/types/index.ts` (extend)

```ts
export interface DiaryEntry {
  date: string // YYYY-MM-DD (primary key — one entry per day)
  dayNumber: number // 1..17
  title: string // e.g. "Día 6 — Ninh Binh"
  mood?: string
  weather?: string
  places: Location[] // "Dónde estuve" — reuses existing Location (name + googleMapsUrl)
  did?: string // "Qué hice" (free text; morning/afternoon/night preserved with line breaks)
  ate?: string // "Qué comí"
  highlight?: string // "Momento destacado del día"
  recommendation?: string // "Recomendación del día"
  notes?: string // "Notas / Reflexiones"
  photos?: string[]
  createdAt: Date
  updatedAt: Date
}
```

Add `'diaryEntries'` to `DatabaseTableName`.

`Location` is reused as-is (has `name`, optional `googleMapsUrl`, `lat`/`lng`). Text fields
(`did`, `ate`, etc.) stay as free-text blocks rather than over-structuring
morning/afternoon/night, because those subsections vary day to day. Rendering preserves
line breaks.

#### `src/db/schema.ts` (migrate)

- Bump `DB_VERSION` `1 → 2`.
- Add `diaryEntries: DiaryEntry` to `DatabaseSchema`.
- Add `diaryEntries: 'date, dayNumber'` to `TABLE_SCHEMAS` (only indexed fields).
- Add the Dexie version migration in `src/db/index.ts`: `this.version(2).stores({ diaryEntries: 'date, dayNumber' })`. Existing tables carry forward unchanged.

**Seeding:** `diaryEntries` is intentionally **absent** from `seed.ts`. On a fresh public
install the table is empty → `/diary` shows its empty state. Seeding logic in `main.tsx`
and `resetDatabase()`/`clearDatabase()` behavior is unaffected for the public tables.

### Hook — `src/hooks/useDiary.ts` (new)

Follows the established hook pattern (see `usePlaces`, `useItinerary`):

- `useLiveQuery` reads all entries ordered by `dayNumber` (or `date`).
- Exposes `create` / `update` / `remove` callbacks that set `createdAt`/`updatedAt`,
  generate IDs where needed (here `date` is the natural key), and surface errors via local
  state.
- Exposes `importDiary(entries)` — merge-upsert into `diaryEntries` only (see import below).

Components/pages never touch `db` directly — they go through `useDiary`.

### Private Import — `src/utils/diaryImport.ts` (new)

Separate from `src/utils/export.ts` (which is whole-DB backup/restore). The general
`importData()` clears **all** fixed `TABLE_NAMES` and is left untouched.

Private diary file format:

```json
{
  "version": 1,
  "type": "travel-diary",
  "diaryEntries": [
    /* DiaryEntry[] with dates as ISO strings */
  ]
}
```

- `readDiaryFile(file)` → parse + validate (`type === 'travel-diary'`, `diaryEntries` is an
  array). Reuses `readJsonFile` from `export.ts`.
- `importDiary(json)` → `db.diaryEntries.bulkPut(...)` inside a transaction on **only**
  `diaryEntries` (merge/upsert by `date`; re-import overwrites). Returns
  `{ imported, errors }`, same shape as `importData`.
- Dates are revived from ISO strings to `Date` for `createdAt`/`updatedAt`.

`diaryEntries` is **not** added to `export.ts`'s `TABLE_NAMES`, so the general backup neither
exports nor wipes the private diary.

### UI

#### Pages

- **`src/pages/Diary.tsx`** (`/diary`) — list of days. When empty (no imported entries),
  shows an empty state with an **"Importar diario"** file input that calls
  `useDiary().importDiary`. When populated, renders a day list (day number, title, date,
  mood/weather chip) linking to detail. Follows the visual pattern of `Schedule.tsx` /
  existing list pages.
- **`src/pages/DiaryDetail.tsx`** (`/diary/:date`) — one day: title, mood/weather, "Dónde
  estuve" (places with Google Maps links), "Qué hice", "Qué comí", "Momento destacado",
  "Recomendación", "Notas", photos. Sections render only when their field is present.
  Mirrors `DayDetail.tsx` layout conventions.

Both are `React.lazy` + `Suspense`, registered in `src/App.tsx`:

```tsx
const Diary = lazy(() => import('./pages/Diary'))
const DiaryDetail = lazy(() => import('./pages/DiaryDetail'))
// ...
<Route path="/diary" element={<Diary />} />
<Route path="/diary/:date" element={<DiaryDetail />} />
```

#### Navigation

`BottomNav` is full (4 items) — **not** modified. The Diary entry is added to **MorePage**
(`/more`) as a navigation card/link, consistent with how secondary sections (Coffee, Food,
Accommodations) are reached.

#### Copy

All user-facing strings in **Spanish** (project convention). Identifiers, types, comments in
English.

### Private content deliverable

A one-off generation step (not app code): parse the 17 `.md` files from
`Viaje-Vietnam/` into `DiaryEntry[]` and write `diary-private.json` to the **scratchpad**.
The owner imports it via `/diary`. This file is **never committed**. First-person wording and
personal detail are preserved verbatim (it is private).

---

## Piece B — Public Guide Enrichment (seed, additive)

Content-only. No schema change, no rewrite of existing itinerary or `dailyPlans`.

### `src/db/seed.ts` (extend)

- **New `places`** for journal locations not already present, e.g. Train Street, Hang Mua
  Big Pagoda, Trang An, Bai Dinh Pagoda, Dam Khe Specialty Coffee, Sun Mountain, Gau Coffee
  & Bakery, Ngoc Son Temple, Thang Long Water Puppet Theatre — with `name`, `description`
  (impersonal guide voice), `category` (existing `PlaceCategory` values), `location`
  (`googleMapsUrl` from the journal where present), and `tips[]`.
- **New `recommendations`** distilled from each day's "Recomendación del día", reworded to
  guide voice (e.g. "Cambiar dinero en efectivo al llegar", "Ir preparado para lluvia en
  Trang An", "Bai Dinh merece la tarde por la iluminación"), with `type`, `priority`, `tags`.
- De-duplicate against existing seed entries before adding (some places/cafés already exist,
  e.g. the coffee chain at seed line ~1187).

### Anonymization rules applied to Piece B

- Voice: impersonal / second-person guide ("se puede", "conviene", "lleva"), never "yo/
  nosotros" narrative.
- Excluded entirely: names of people, personal reflections, "momento destacado", passport/
  personal data.
- Only factual, reusable planning value is extracted (what a place is, why go, practical
  tip, opening/timing notes like water-puppet show times or night-market days).

---

## Implementation Slices

1. **Slice 1 — Diary feature (Piece A):** types, schema migration + `DB_VERSION` bump,
   `useDiary`, `diaryImport` util, `Diary`/`DiaryDetail` pages, routes, MorePage link, empty
   state + import UI. Plus generating the private `diary-private.json` deliverable to the
   scratchpad.
2. **Slice 2 — Guide enrichment (Piece B):** additive `places` + `recommendations` in
   `seed.ts`, de-duplicated and anonymized.

Each slice is an independent, reviewable PR.

## Testing / Verification

No test runner is configured (per `CLAUDE.md`). Verification is:

- `npm run build` (tsc typecheck + vite build) — must pass; strict mode + `noUnusedLocals`.
- `npm run lint` and `npm run format:check` — CI gates.
- Manual: `npm run dev`, confirm `/diary` empty state → import `diary-private.json` →
  entries render, detail pages show all sections and Maps links; confirm a general backup
  export does **not** contain `diaryEntries`; confirm public seed (fresh DB) leaves `/diary`
  empty and shows the new places/recommendations from Piece B.

## Out of Scope

- Rewriting the planned itinerary or `dailyPlans` (explicit "solo enriquecer" decision).
- Diary editing UX beyond import (no in-app authoring flow required now; hook exposes
  create/update/remove for future use).
- Photo hosting/upload (photos are optional URL strings only).
- Integrating diary into the general export/import (kept deliberately isolated).
