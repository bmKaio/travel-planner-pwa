# Travel Diary + Guide Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a private, import-only travel Diary feature to the PWA, and additively enrich the public seed guide with anonymized places and recommendations drawn from the trip journal.

**Architecture:** Piece A adds one new Dexie table (`diaryEntries`, keyed by `date`), a `useDiary` hook, an isolated private-import util decoupled from the general backup, and two lazy pages (`/diary`, `/diary/:date`) reachable from MorePage. Piece B only appends records to the existing `places` and `recommendations` arrays in `seed.ts` — no schema change, no itinerary rewrite. The private diary content is generated to the scratchpad and never committed or seeded.

**Tech Stack:** React 18, TypeScript (strict), Vite, Dexie + dexie-react-hooks, Tailwind 3, react-router-dom, lucide-react.

## Global Constraints

- No backend. All data in IndexedDB via Dexie. Deployed publicly to GitHub Pages under base `/travel-planner-pwa/`.
- **UI copy and user-facing strings in Spanish** (project convention). Code identifiers, types, comments in English.
- TypeScript strict mode + `noUnusedLocals` + `noUnusedParameters` — unused code fails the build.
- **No test runner exists.** Verification per task = `npm run build` (runs `tsc -b` typecheck then `vite build`) + `npm run lint`, plus manual checks in `npm run dev` where noted.
- Changing a table's indexed fields requires bumping `DB_VERSION` and a Dexie version migration.
- **Privacy (non-negotiable):** the private diary is never added to `seed.ts`, never added to `src/utils/export.ts`'s `TABLE_NAMES`, and the generated `diary-private.json` is never committed. Public guide content excludes people's names, personal reflections, "momento destacado", and personal data.
- Commits: conventional commit style, no AI attribution / no `Co-Authored-By`.
- Follow existing patterns: hooks are the only DB access point; components/pages never touch `db` directly.

---

# SLICE 1 — Diary Feature (Piece A)

### Task 1: Data model + schema migration

**Files:**

- Modify: `src/types/index.ts` (add `DiaryEntry`; add `'diaryEntries'` to `DatabaseTableName`)
- Modify: `src/db/schema.ts` (bump `DB_VERSION`; add to `DatabaseSchema` + `TABLE_SCHEMAS`)
- Modify: `src/db/index.ts` (add typed `EntityTable`)

**Interfaces:**

- Produces: `DiaryEntry` interface; `db.diaryEntries` typed as `EntityTable<DiaryEntry, 'date'>`; `DB_VERSION === 2`.

- [ ] **Step 1: Add the `DiaryEntry` type**

In `src/types/index.ts`, after the `DailyPlan` interface (around line 100), add:

```ts
export interface DiaryEntry {
  date: string // YYYY-MM-DD — primary key, one entry per day
  dayNumber: number // 1..17
  title: string // e.g. "Día 6 — Ninh Binh"
  mood?: string
  weather?: string
  places: Location[] // "Dónde estuve" — reuses Location (name + optional googleMapsUrl)
  did?: string // "Qué hice" — free text, line breaks preserved
  ate?: string // "Qué comí"
  highlight?: string // "Momento destacado del día"
  recommendation?: string // "Recomendación del día"
  notes?: string // "Notas / Reflexiones"
  photos?: string[]
  createdAt: Date
  updatedAt: Date
}
```

Then extend `DatabaseTableName` (around line 176) by adding `| 'diaryEntries'` as the last union member.

- [ ] **Step 2: Register the table in the schema**

In `src/db/schema.ts`:

- Add `DiaryEntry` to the type import from `../types`.
- Add `diaryEntries: DiaryEntry` to the `DatabaseSchema` interface.
- Change `export const DB_VERSION = 1` to `export const DB_VERSION = 2`.
- Add to `TABLE_SCHEMAS` (last entry): `diaryEntries: 'date, dayNumber',`

Note: `stores()` lists only indexed fields. `date` is the primary key (first field).

- [ ] **Step 3: Add the typed table to the Dexie class**

In `src/db/index.ts`:

- Add `DiaryEntry` to the type import from `../types`.
- Add this field to `TravelPlannerDatabase` (after `travelers!`):

```ts
diaryEntries!: EntityTable<DiaryEntry, 'date'>
```

The constructor already does `this.version(DB_VERSION).stores(TABLE_SCHEMAS)`. Because this change is **purely additive** (a brand-new table, no index change to existing tables), bumping `DB_VERSION` to 2 with the new store in `TABLE_SCHEMAS` is a clean Dexie upgrade — existing clients gain the empty `diaryEntries` table with no data transform. Do **not** add `diaryEntries` to `seedDatabase()` or `clearDatabase()`; it stays empty on public installs and is managed only via import.

- [ ] **Step 4: Typecheck + lint**

Run: `npm run build`
Expected: PASS (no TS errors). The new table compiles; nothing consumes it yet.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/db/schema.ts src/db/index.ts
git commit -m "feat(diary): add DiaryEntry model and diaryEntries table (DB v2)"
```

---

### Task 2: Isolated private-import utility

**Files:**

- Create: `src/utils/diaryImport.ts`

**Interfaces:**

- Consumes: `readJsonFile` from `src/utils/export.ts`; `db.diaryEntries` from Task 1.
- Produces: `DiaryImportFile` interface; `importDiary(json: unknown): Promise<{ imported: number; errors: string[] }>`; `importDiaryFromFile(file: File): Promise<{ imported: number; errors: string[] }>`.

- [ ] **Step 1: Write the util**

Create `src/utils/diaryImport.ts`:

```ts
import { db } from '../db'
import type { DiaryEntry } from '../types'
import { readJsonFile } from './export'

export interface DiaryImportFile {
  version: number
  type: 'travel-diary'
  diaryEntries: DiaryEntry[]
}

function isDiaryImportFile(value: unknown): value is DiaryImportFile {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return obj.type === 'travel-diary' && Array.isArray(obj.diaryEntries)
}

function reviveEntry(raw: DiaryEntry): DiaryEntry {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

// Merge/upsert into diaryEntries ONLY. Never touches other tables, so the
// private diary is fully decoupled from the general backup/restore.
export async function importDiary(json: unknown): Promise<{ imported: number; errors: string[] }> {
  if (!isDiaryImportFile(json)) {
    throw new Error('Formato de archivo de diario no válido')
  }
  const errors: string[] = []
  let imported = 0
  await db.transaction('rw', db.diaryEntries, async () => {
    try {
      const entries = json.diaryEntries.map(reviveEntry)
      await db.diaryEntries.bulkPut(entries)
      imported = entries.length
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  })
  return { imported, errors }
}

export async function importDiaryFromFile(
  file: File
): Promise<{ imported: number; errors: string[] }> {
  const json = await readJsonFile(file)
  return importDiary(json)
}
```

Note: `bulkPut` upserts by primary key (`date`), so re-importing overwrites cleanly. `diaryEntries` is intentionally absent from `export.ts`'s `TABLE_NAMES`.

- [ ] **Step 2: Typecheck + lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/utils/diaryImport.ts
git commit -m "feat(diary): add isolated private diary import util"
```

---

### Task 3: `useDiary` hook

**Files:**

- Create: `src/hooks/useDiary.ts`

**Interfaces:**

- Consumes: `db.diaryEntries` (Task 1); `importDiary` (Task 2).
- Produces: `useDiary(): { entries: DiaryEntry[]; loading: boolean; error: Error | null; getByDate: (date: string) => DiaryEntry | undefined; importFromFile: (file: File) => Promise<{ imported: number; errors: string[] }> }`.

- [ ] **Step 1: Write the hook**

Create `src/hooks/useDiary.ts`, following the `usePlaces` pattern:

```ts
import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { DiaryEntry } from '../types'
import { importDiaryFromFile } from '../utils/diaryImport'

export interface UseDiaryResult {
  entries: DiaryEntry[]
  loading: boolean
  error: Error | null
  getByDate: (date: string) => DiaryEntry | undefined
  importFromFile: (file: File) => Promise<{ imported: number; errors: string[] }>
}

export function useDiary(): UseDiaryResult {
  const [error, setError] = useState<Error | null>(null)

  const entries = useLiveQuery<DiaryEntry[]>(
    () => db.diaryEntries.orderBy('dayNumber').toArray(),
    []
  )

  const getByDate = useCallback(
    (date: string) => (entries ?? []).find((e) => e.date === date),
    [entries]
  )

  const importFromFile = useCallback(async (file: File) => {
    try {
      setError(null)
      return await importDiaryFromFile(file)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  return {
    entries: entries ?? [],
    loading: entries === undefined,
    error,
    getByDate,
    importFromFile,
  }
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useDiary.ts
git commit -m "feat(diary): add useDiary hook"
```

---

### Task 4: Diary list page, route, and MorePage entry

**Files:**

- Create: `src/pages/Diary.tsx`
- Modify: `src/App.tsx` (lazy import + route)
- Modify: `src/pages/MorePage.tsx` (add a `SectionLink` to `/diary`)

**Interfaces:**

- Consumes: `useDiary` (Task 3).
- Produces: route `/diary` rendering `<Diary />`.

- [ ] **Step 1: Write the list page**

Create `src/pages/Diary.tsx`. Empty state offers a file input that calls `importFromFile`; populated state lists days linking to `/diary/:date`:

```tsx
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Upload } from 'lucide-react'
import { useDiary } from '../hooks/useDiary'

function Diary() {
  const navigate = useNavigate()
  const { entries, loading, importFromFile } = useDiary()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus(null)
    try {
      const { imported } = await importFromFile(file)
      setStatus(`Diario importado: ${imported} días.`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al importar el diario.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Diario de viaje</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Recuerdos, comidas y momentos día a día.
        </p>
      </div>

      {!loading && entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <BookOpen
            className="mx-auto mb-3 h-10 w-10 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <h2 className="font-semibold text-gray-900 dark:text-white">Aún no hay diario</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
            El diario es privado y no se sincroniza. Impórtalo desde tu archivo para verlo en este
            dispositivo.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-travel-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-travel-blue-700"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Importar diario
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.date}>
              <button
                type="button"
                onClick={() => navigate(`/diary/${entry.date}`)}
                className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-travel-blue-50 font-bold text-travel-blue-600 dark:bg-travel-blue-900/30 dark:text-travel-blue-300">
                  {entry.dayNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                    {entry.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {entry.date}
                    {entry.weather ? ` · ${entry.weather}` : ''}
                  </p>
                </div>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {status && <p className="text-center text-sm text-gray-600 dark:text-gray-300">{status}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}

export default Diary
```

- [ ] **Step 2: Register the route**

In `src/App.tsx`, add the lazy import alongside the others:

```tsx
const Diary = lazy(() => import('./pages/Diary'))
```

And add the route inside `<Routes>` (near the other feature routes):

```tsx
<Route path="/diary" element={<Diary />} />
```

- [ ] **Step 3: Add the MorePage entry**

In `src/pages/MorePage.tsx`, add `BookOpen` to the `lucide-react` import, then add a `SectionLink` inside the existing `vietnam-heading` section's `<div className="space-y-3">` (after the Food link):

```tsx
<SectionLink
  to="/diary"
  icon={<BookOpen className="h-6 w-6" aria-hidden="true" />}
  title="Diario de viaje"
  description="Recuerdos, comidas y momentos día a día (privado, requiere importar)."
  onClick={() => navigate('/diary')}
/>
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 5: Manual check**

Run: `npm run dev`, open `http://localhost:5173/travel-planner-pwa/more`, click "Diario de viaje".
Expected: `/diary` shows the empty state with an "Importar diario" button (no entries seeded).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Diary.tsx src/App.tsx src/pages/MorePage.tsx
git commit -m "feat(diary): add diary list page, route and MorePage entry"
```

---

### Task 5: Diary detail page

**Files:**

- Create: `src/pages/DiaryDetail.tsx`
- Modify: `src/App.tsx` (lazy import + route)

**Interfaces:**

- Consumes: `useDiary` (Task 3); route param `:date`.
- Produces: route `/diary/:date` rendering `<DiaryDetail />`.

- [ ] **Step 1: Write the detail page**

Create `src/pages/DiaryDetail.tsx`. Each section renders only when its field is present:

```tsx
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react'
import { useDiary } from '../hooks/useDiary'
import type { DiaryEntry } from '../types'

interface TextSectionProps {
  title: string
  body?: string
}

function TextSection({ title, body }: TextSectionProps) {
  if (!body) return null
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      <p className="whitespace-pre-line text-sm text-gray-800 dark:text-gray-200">{body}</p>
    </section>
  )
}

function PlacesSection({ entry }: { entry: DiaryEntry }) {
  if (!entry.places?.length) return null
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Dónde estuve
      </h2>
      <ul className="space-y-2">
        {entry.places.map((place, i) => (
          <li key={`${place.name}-${i}`} className="flex items-center gap-2">
            <MapPin
              className="h-4 w-4 shrink-0 text-travel-blue-600 dark:text-travel-blue-300"
              aria-hidden="true"
            />
            {place.googleMapsUrl ? (
              <a
                href={place.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-travel-blue-700 hover:underline dark:text-travel-blue-300"
              >
                {place.name}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : (
              <span className="text-sm text-gray-800 dark:text-gray-200">{place.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function DiaryDetail() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const { getByDate, loading } = useDiary()
  const entry = date ? getByDate(date) : undefined

  if (loading) {
    return <p className="py-8 text-center text-sm text-gray-500">Cargando...</p>
  }

  if (!entry) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay entrada de diario para este día.
        </p>
        <button
          type="button"
          onClick={() => navigate('/diary')}
          className="inline-flex items-center gap-2 text-sm font-medium text-travel-blue-700 dark:text-travel-blue-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al diario
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <button
        type="button"
        onClick={() => navigate('/diary')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Diario
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{entry.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {entry.date}
          {entry.mood ? ` · ${entry.mood}` : ''}
          {entry.weather ? ` · ${entry.weather}` : ''}
        </p>
      </div>

      <PlacesSection entry={entry} />
      <TextSection title="Qué hice" body={entry.did} />
      <TextSection title="Qué comí" body={entry.ate} />
      <TextSection title="Momento destacado" body={entry.highlight} />
      <TextSection title="Recomendación del día" body={entry.recommendation} />
      <TextSection title="Notas / Reflexiones" body={entry.notes} />
    </div>
  )
}

export default DiaryDetail
```

- [ ] **Step 2: Register the route**

In `src/App.tsx`, add:

```tsx
const DiaryDetail = lazy(() => import('./pages/DiaryDetail'))
```

And, immediately after the `/diary` route:

```tsx
<Route path="/diary/:date" element={<DiaryDetail />} />
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/DiaryDetail.tsx src/App.tsx
git commit -m "feat(diary): add diary detail page"
```

---

### Task 6: Generate the private diary content file

**Files:**

- Create (scratchpad, NOT committed): `<scratchpad>/diary-private.json`

Source journal: `/srv/state/borja-hermes/obsidian-vault/Viaje-Vietnam/2026-07-*.md` (17 files, `2026-07-04` … `2026-07-20`). Scratchpad dir: `/tmp/claude-1000/-srv-data-proyectos-personal-github-travel-planner-pwa/bbe8c597-eb81-47bb-9dba-56c2e39e9b22/scratchpad`.

- [ ] **Step 1: Parse each daily note into a `DiaryEntry`**

For each `2026-07-DD.md`, map:

- `date` ← frontmatter `date` (YYYY-MM-DD).
- `dayNumber` ← position in the trip (04→1 … 20→17). Prefer the "Día N" in the `day` frontmatter or the `#` heading; fall back to date offset.
- `title` ← the H1 without the flag emoji/date prefix, e.g. `"Día 6 — Ninh Binh"`; if the note only says "Día N", append the day's base location from "Dónde estuve".
- `mood` ← frontmatter `mood` (omit if blank).
- `weather` ← frontmatter `weather` (omit if blank).
- `places` ← "📍 Dónde estuve hoy" bullets → `Location[]`: `name` = the bolded/plain place label, `googleMapsUrl` = the `maps.app.goo.gl` link when present. Skip empty `https://maps.app.goo.gl/` placeholders (leave `googleMapsUrl` undefined).
- `did` ← "🚶 Qué hice" body, preserving Mañana/Tarde/Noche line breaks as `\n`.
- `ate` ← "🍜 Qué comí" body.
- `highlight` ← "⭐ Momento destacado del día".
- `recommendation` ← "💡 Recomendación del día".
- `notes` ← "📝 Notas / Reflexiones".
- `photos` ← omit or `[]` (journal has none / placeholders only).
- `createdAt`/`updatedAt` ← the trip end timestamp `"2026-07-20T00:00:00.000Z"` (fixed literal — do NOT use `Date.now()`).

Preserve first-person wording verbatim — this file is private.

- [ ] **Step 2: Emit the file**

Write JSON with this exact top-level shape (matches `DiaryImportFile` from Task 2):

```json
{
  "version": 1,
  "type": "travel-diary",
  "diaryEntries": [
    /* 17 DiaryEntry objects, dates ISO strings for createdAt/updatedAt */
  ]
}
```

- [ ] **Step 3: Verify importability (manual)**

Run `npm run dev`, open `/diary`, click "Importar diario", pick `diary-private.json`.
Expected: "Diario importado: 17 días.", list shows 17 days, each detail page renders its sections and Google Maps links open.

- [ ] **Step 4: Confirm privacy**

Confirm `diary-private.json` lives only in the scratchpad and is NOT staged: `git status` shows no diary JSON. Do **not** commit it. (Optional: hand the file to the owner out-of-band.)

There is no code commit for this task — it produces a private data artifact only.

---

# SLICE 2 — Public Guide Enrichment (Piece B)

### Task 7: Append anonymized places to the seed

**Files:**

- Modify: `src/db/seed.ts` (append objects to the `places` array literal, before its closing `])` at ~line 646–1446)

**Interfaces:**

- Consumes: existing `Place` shape + `withTimestamps` wrapper (id via `uuid()`).
- Produces: additional `places` records; some flow into existing `dailyPlans` filters when their `location.name`/inclusion predicate matches.

- [ ] **Step 1: Add new place records**

Append `Place` objects (following the existing literal style — `id: uuid()`, no `createdAt`/`updatedAt`, those come from `withTimestamps`) for journal locations not already in the array. De-dupe first: search the array for each name before adding. Candidate set (verify against the 17 notes and existing seed):

- Ngoc Son Temple (`temple`, Hanoi) — with `googleMapsUrl` if available.
- Train Street Hanoi (`other`) — tip: el tren pasa a diario, mesas se recogen justo antes.
- Thang Long Water Puppet Theatre (`other`, Hanoi).
- Gau Coffee & Bakery (`cafe`, Hanoi) — `googleMapsUrl` from note 2026-07-05.
- Hang Mua Big Pagoda / Mua Caves (`nature`, Ninh Binh) — tip: ~500 escalones, vistas.
- Trang An (`nature`, Ninh Binh) — tip: tour N3 en barca ~3h, prepararse para lluvia.
- Bai Dinh Pagoda (`temple`, Ninh Binh) — tip: ir por la tarde para la iluminación; ascensor disponible.
- Dam Khe Specialty Coffee (`cafe`, Tam Coc) — tip: Phi drip con robusta local.
- Sun Mountain Bar & Restaurant (`restaurant`, Ninh Binh).

Use `location.googleMapsUrl` from the notes where a real `maps.app.goo.gl/<id>` link exists; otherwise provide `lat`/`lng` if known or just `name`. Descriptions in impersonal guide voice — **no** first-person narrative, **no** "momento destacado", **no** names of people. Example record:

```ts
{
  id: uuid(),
  name: 'Hang Mua Big Pagoda',
  description:
    'Mirador de Ninh Binh: unos 500 escalones hasta la cima con vistas panorámicas sobre Tam Coc y, abajo, un jardín de nenúfares.',
  category: 'nature',
  location: {
    name: 'Hang Mua Big Pagoda',
    googleMapsUrl: 'https://maps.app.goo.gl/AAJBqCU5coWmHZRz7',
  },
  tips: ['Subida dura con calor o lluvia; calzado con agarre', 'Mejor a primera hora o al atardecer'],
},
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run build`
Expected: PASS (all objects conform to `Place`).

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Manual check (fresh DB)**

In `npm run dev`, open the app in a private window (or reset via More → Ajustes), and confirm the new places appear in `/places` and on `/map`. Confirm `/diary` remains empty (seed unaffected).

- [ ] **Step 4: Commit**

```bash
git add src/db/seed.ts
git commit -m "feat(places): enrich seed with anonymized places from the trip"
```

---

### Task 8: Append anonymized recommendations to the seed

**Files:**

- Modify: `src/db/seed.ts` (append to the `recommendations` array literal, before its closing `])` at ~line 1777–2105)

**Interfaces:**

- Consumes: existing `Recommendation` shape + `withTimestamps`.
- Produces: additional `recommendations`; those with tags matching a day's `dailyPlans` filter (e.g. `tags.includes('hanoi')`) surface on that day automatically.

- [ ] **Step 1: Add new recommendation records**

Append `Recommendation` objects distilled from each day's "💡 Recomendación del día", reworded to guide voice. De-dupe against existing titles. Tag with the relevant city slug used by `dailyPlans` filters (`hanoi`, `ninh-binh`, `hue`, `hoi-an`, `siem-reap`, `pu-luong`, `cat-ba`) so they flow into the matching day. Examples:

```ts
{
  id: uuid(),
  type: 'activity',
  title: 'Cambiar efectivo al llegar',
  description:
    'Cambiar dinero en efectivo nada más aterrizar para pagar en moneda local; muchos restaurantes y mercados no aceptan tarjeta. Llevar billetes pequeños en VND.',
  tags: ['hanoi', 'dinero', 'consejo'],
  priority: 'must-see',
},
{
  id: uuid(),
  type: 'activity',
  title: 'Trang An: ir preparado para la lluvia',
  description:
    'En el tour en barca (~3h) la tormenta puede caer en cualquier momento. Llevar funda impermeable para el móvil y bolsas para la mochila.',
  tags: ['ninh-binh', 'naturaleza', 'consejo'],
  priority: 'if-time',
},
{
  id: uuid(),
  type: 'place',
  title: 'Bai Dinh al atardecer',
  description:
    'Reservar la tarde para Bai Dinh: la iluminación del recinto al anochecer merece la pena. Hay ascensor hasta la pagoda de 100 m.',
  tags: ['ninh-binh', 'templo'],
  priority: 'if-time',
},
```

Cover the practical, reusable tips across the 17 notes (money, SIM card, water-puppet/light-show timing and booking, night market days, rain gear, Phi drip coffee souvenir, etc.). Exclude anything personal.

- [ ] **Step 2: Typecheck + lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Manual check**

In `npm run dev`, open `/recommendations` and a matching day (e.g. a Ninh Binh day in `/schedule`) and confirm the new recommendations show. Confirm no personal content leaked.

- [ ] **Step 4: Commit**

```bash
git add src/db/seed.ts
git commit -m "feat(recommendations): enrich seed with anonymized tips from the trip"
```

---

## Self-Review

**Spec coverage:**

- Piece A model + migration → Task 1. ✅
- Isolated private import → Task 2. ✅
- `useDiary` hook → Task 3. ✅
- `/diary` list + empty-state import + MorePage nav → Task 4. ✅
- `/diary/:date` detail with per-section rendering + Maps links → Task 5. ✅
- Private `diary-private.json` deliverable to scratchpad, never committed → Task 6. ✅
- Piece B additive places → Task 7; recommendations → Task 8. ✅
- Anonymization / privacy contract → enforced in Tasks 6, 7, 8 and Global Constraints. ✅
- Diary NOT in general export/seed → Task 1 Step 3, Task 2 note. ✅

**Placeholder scan:** No "TBD/TODO"; every code step shows complete code. Task 6 and Tasks 7–8 describe a content set the implementer curates from the 17 source notes (data curation, not code placeholders); representative records and exact field mappings are given.

**Type consistency:** `DiaryEntry` fields are identical across Tasks 1, 2, 3, 5. `importDiary`/`importDiaryFromFile` names match between Task 2 (util) and Task 3 (hook consumes `importDiaryFromFile`). `getByDate` defined in Task 3, consumed in Task 5. `db.diaryEntries` keyed `'date'` consistent everywhere. `DiaryImportFile.type === 'travel-diary'` matches the generated file in Task 6.
