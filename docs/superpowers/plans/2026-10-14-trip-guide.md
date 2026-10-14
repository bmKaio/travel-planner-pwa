# Trip Guide ("Guía") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-trip reading guide (history, cities, food, drinks, curiosities, tips) that replaces "Checklist" in the v2 trip nav, links from each itinerary day, and moves the checklist and notes into "Ayuda".

**Architecture:** Guide entries are authored in the trip content file (`TripContent.guide`), synced by `syncTripContent` into a new `guideEntries` Dexie table (TripsDB v2), and read through a `useGuide` hook. Pure functions in `src/trips/domain/guide.ts` group entries into sections and select the entries of a day. Pages are containers; `GuideCardList` is presentational and shared by the guide list and the itinerary day.

**Tech Stack:** React 18, React Router 7, Dexie 4 (`dexie-react-hooks`), Tailwind 3, lucide-react, Vitest 3 + fake-indexeddb.

**Spec:** `docs/superpowers/specs/2026-10-14-trip-guide-design.md`

## Global Constraints

- UI copy in Spanish; code identifiers, types and comments in English.
- TypeScript strict with `noUnusedLocals` / `noUnusedParameters`: unused code fails `npm run build`.
- Components and pages never touch `tripsDb` directly; go through a hook in `src/trips/hooks/`.
- TDD for new code under `src/trips/`: observe RED before GREEN. Runner: `npm test` (Vitest, `environment: node`, only `src/**/*.test.ts`; no component test setup exists, so UI is checked manually).
- Every task ends green on: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.
- Commits: conventional commits, **no** `Co-Authored-By` / AI attribution. Do not push.
- `docs/peru/` stays untracked (it holds the agency dossier and private phone numbers).
- The guide holds reading content only: no maps links, no "places to go" (those live in "Visitar" / "Comer").
- Guide entries link to days only through explicit `dates`; there is no city matching.
- Content ships with `seedVersion` + 1 (6 → 7 at the time of writing). Re-read the file before bumping: another session may have bumped it.

## Review Focus

1. A device that already has TripsDB v1 with ticked checklist items and notes opens the new build → nothing is lost and `guideEntries` exists (test in Task 1).
2. An old bookmark or link to `/trips/peru-2026/checklist` → lands on "Ayuda" scrolled to the checklist, not a blank page or the trip home (manual check in Task 5).
3. An entry URL whose key does not exist (typo, or removed in a later content version) → redirects to the guide list (manual check in Task 3).
4. An entry whose `dates` names a day outside the trip → the content test fails, and the entry page skips that date instead of rendering a broken link (tests in Tasks 2 and 6).
5. The guide fails to load on the itinerary day → the itinerary still works and shows a short error instead of crashing (manual check in Task 4).

---

### Task 0: Research and write the content draft (no code)

**Files:**

- Create: `docs/peru/guia-borrador.md` (untracked, never committed)

**Interfaces:**

- Produces: one block per entry with exactly the `ContentGuideEntry` fields, so Task 7 is a mechanical copy.

- [ ] **Step 1: Read the existing day content** in `src/trips/content/peru-2026.ts` (`see`, `eat`, `plan` per day) to know what the guide must not repeat.
- [ ] **Step 2: Research** with the available web tools, preferring primary sources (UNESCO, Peru's Ministry of Culture, PromPerú / peru.travel, museums, Britannica as a fallback). Note the URL of each fact.
- [ ] **Step 3: Write the draft** in Spanish, short paragraphs for a phone, one block per entry:

```markdown
### ceviche — Ceviche

- **category:** food
- **summary:** El plato bandera de Perú: pescado fresco marinado en limón.
- **dates:** 2026-10-18
- **sources:** https://…, https://…

Pescado fresco cortado en cubos y marinado en jugo de limón recién exprimido, con cebolla morada,
ají limo, choclo y camote.

Se come a mediodía: el pescado es del día y en Lima muchas cevicherías cierran por la tarde.
```

Planned set (spec §6): Historia 4 · Ciudades 7 · Gastronomía ~14 (the user's notes without Maymanta + regional dishes) · Bebidas ~5 · Curiosidades ~8 · Consejos ~3.

- [ ] **Step 4: Cross-check** every entry against the day `see`/`eat` items: no entry recommends a place to go. Every `dates` value is one of `2026-10-17` … `2026-10-28`.
- [ ] **Step 5: Hand the draft to the user for review.** Do not start Task 7 until the user approves it.

---

### Task 1: Guide types, TripsDB v2 and sync

**Files:**

- Modify: `src/trips/types.ts` (add guide types, `TripContent.guide`)
- Modify: `src/trips/db.ts` (table + `version(2)`)
- Modify: `src/trips/domain/seedSync.ts`
- Test: `src/trips/domain/seedSync.test.ts`, create `src/trips/db.test.ts`

**Interfaces:**

- Produces:
  - `type GuideCategory = 'history' | 'city' | 'food' | 'drink' | 'curiosity' | 'tip'`
  - `interface ContentGuideEntry { key; category; title; summary; body: string[]; dates?: string[]; sources: string[] }`
  - `interface GuideEntry extends ContentGuideEntry { tripId: string; order: number }`
  - `TripContent.guide?: ContentGuideEntry[]`
  - `tripsDb.guideEntries: Table<GuideEntry, [string, string]>`, indexes `[tripId+key], tripId`

- [ ] **Step 1: Add the types** to `src/trips/types.ts` (types only, so the tests compile). Insert before `export interface ContentState`:

```ts
export type GuideCategory = 'history' | 'city' | 'food' | 'drink' | 'curiosity' | 'tip'

export interface ContentGuideEntry {
  /** Unique within the trip; URL segment of the entry page. Lowercase kebab-case. */
  key: string
  category: GuideCategory
  title: string
  /** One or two lines, shown on cards. */
  summary: string
  /** Short paragraphs, rendered in order. */
  body: string[]
  /** Trip days this entry belongs to (ISO dates present in `days`). */
  dates?: string[]
  /** Source URLs, shown small at the end of the entry page. At least one. */
  sources: string[]
}

export interface GuideEntry extends ContentGuideEntry {
  tripId: string
  /** Index in the authored `guide` array; Dexie returns rows by primary key, not authored order. */
  order: number
}
```

And in `TripContent`, after `checklist: ContentChecklistItem[]`:

```ts
  /** Reading guide; optional because not every trip has one. */
  guide?: ContentGuideEntry[]
```

- [ ] **Step 2: Write the failing sync tests.** In `src/trips/domain/seedSync.test.ts` add `import type { ContentGuideEntry } from '../types'` and, inside `describe('syncTripContent', …)`:

```ts
const ceviche: ContentGuideEntry = {
  key: 'ceviche',
  category: 'food',
  title: 'Ceviche',
  summary: 'El plato bandera.',
  body: ['Pescado marinado en limón.'],
  dates: ['2026-10-18'],
  sources: ['https://example.org/ceviche'],
}
const pisco: ContentGuideEntry = {
  key: 'pisco-sour',
  category: 'drink',
  title: 'Pisco sour',
  summary: 'El cóctel nacional.',
  body: ['Pisco, limón, jarabe y clara de huevo.'],
  sources: ['https://example.org/pisco'],
}

it('writes the guide entries with the trip id and their authored order', async () => {
  const db = getDb()
  await syncTripContent(db, makeContent({ guide: [pisco, ceviche] }))

  const entries = await db.guideEntries.where('tripId').equals('peru-2026').sortBy('order')
  expect(entries).toEqual([
    { ...pisco, tripId: 'peru-2026', order: 0 },
    { ...ceviche, tripId: 'peru-2026', order: 1 },
  ])
})

it('writes no guide entries when the content has no guide', async () => {
  const db = getDb()
  await syncTripContent(db, makeContent())
  expect(await db.guideEntries.count()).toBe(0)
})

it('replaces the guide on a version bump and leaves other trips alone', async () => {
  const db = getDb()
  await syncTripContent(db, makeContent({ guide: [ceviche, pisco] }))
  await syncTripContent(db, makeContent({ tripId: 'chile-2027', guide: [ceviche] }))

  await syncTripContent(db, makeContent({ seedVersion: 2, guide: [pisco] }))

  const peru = await db.guideEntries.where('tripId').equals('peru-2026').toArray()
  expect(peru.map((entry) => [entry.key, entry.order])).toEqual([['pisco-sour', 0]])
  expect(await db.guideEntries.get(['chile-2027', 'ceviche'])).toBeDefined()
})

it('keeps the guide when the stored version is the same', async () => {
  const db = getDb()
  await syncTripContent(db, makeContent({ guide: [ceviche] }))
  await syncTripContent(db, makeContent({ guide: [pisco] }))
  expect(
    (await db.guideEntries.where('tripId').equals('peru-2026').toArray()).map((e) => e.key)
  ).toEqual(['ceviche'])
})
```

- [ ] **Step 3: Write the failing upgrade test** in a new file `src/trips/db.test.ts`:

```ts
import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { TripsDatabase } from './db'

describe('TripsDatabase', () => {
  it('upgrades a version 1 database without losing data and adds the guide table', async () => {
    const name = `TripsDB-upgrade-${crypto.randomUUID()}`
    const v1 = new Dexie(name)
    v1.version(1).stores({
      days: '[tripId+date], tripId',
      checklistItems: 'id, tripId',
      notes: 'tripId',
      helpInfo: 'tripId',
      contentState: 'tripId',
    })
    await v1
      .table('notes')
      .put({ tripId: 'peru-2026', text: 'Llevar dólares', updatedAt: new Date() })
    await v1.table('checklistItems').put({
      id: 'peru-2026:g1',
      tripId: 'peru-2026',
      group: 'shared',
      label: 'Contratar el seguro',
      done: true,
      order: 1,
    })
    v1.close()

    const db = new TripsDatabase(name)
    try {
      expect((await db.notes.get('peru-2026'))?.text).toBe('Llevar dólares')
      expect((await db.checklistItems.get('peru-2026:g1'))?.done).toBe(true)
      expect(await db.guideEntries.count()).toBe(0)
    } finally {
      db.close()
      await Dexie.delete(name)
    }
  })
})
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm test -- src/trips/domain/seedSync.test.ts src/trips/db.test.ts`
Expected: FAIL. The new tests throw `TypeError: Cannot read properties of undefined` on `db.guideEntries`.

- [ ] **Step 5: Add the table** in `src/trips/db.ts`: import `GuideEntry` in the type import, declare `guideEntries!: Table<GuideEntry, [string, string]>` after `contentState`, and after the `version(1)` block:

```ts
// v2: guide entries. Additive; Dexie keeps every v1 table and its data.
this.version(2).stores({
  guideEntries: '[tripId+key], tripId',
})
```

- [ ] **Step 6: Sync the guide** in `src/trips/domain/seedSync.ts`. Add `db.guideEntries` to the transaction table list, and right after the two `db.days` lines:

```ts
await db.guideEntries.where('tripId').equals(tripId).delete()
await db.guideEntries.bulkPut(
  (content.guide ?? []).map((entry, order) => ({ ...entry, tripId, order }))
)
```

Update the doc comment's second sentence to: `Days and guide entries are replaced; checklist items are upserted keeping \`done\`; notes and the imported help data (cards, contacts, docs) are never touched. All in one transaction.`

- [ ] **Step 7: Run all tests to verify they pass**

Run: `npm test`
Expected: PASS, the existing tests plus 5 new ones.

- [ ] **Step 8: Run lint, format and build**

Run: `npm run lint && npm run format:check && npm run build`
Expected: all succeed.

- [ ] **Step 9: Commit**

```bash
git add src/trips/types.ts src/trips/db.ts src/trips/db.test.ts src/trips/domain/seedSync.ts src/trips/domain/seedSync.test.ts
git commit -m "feat(trips): add guide entries table and sync them from trip content"
```

---

### Task 2: Guide domain functions

**Files:**

- Create: `src/trips/domain/guide.ts`
- Test: `src/trips/domain/guide.test.ts`

**Interfaces:**

- Consumes: `GuideEntry`, `GuideCategory`, `TripDay` from `src/trips/types.ts`; `formatDayLabel` from `src/trips/domain/dates.ts`.
- Produces:
  - `GUIDE_SECTIONS: { category: GuideCategory; label: string }[]`
  - `guideCategoryLabel(category: GuideCategory): string`
  - `interface GuideSection { category: GuideCategory; label: string; entries: GuideEntry[] }`
  - `groupGuide(entries: GuideEntry[]): GuideSection[]`. Input is in authored order.
  - `guideForDay(entries: GuideEntry[], date: string): GuideEntry[]`
  - `interface GuideDayLink { date: string; label: string }`
  - `guideDayLinks(dates: string[] | undefined, days: Pick<TripDay, 'date' | 'title'>[]): GuideDayLink[]`
  - `sourceLabel(url: string): string`

- [ ] **Step 1: Write the failing tests** in `src/trips/domain/guide.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { GuideCategory, GuideEntry } from '../types'
import {
  GUIDE_SECTIONS,
  groupGuide,
  guideCategoryLabel,
  guideDayLinks,
  guideForDay,
  sourceLabel,
} from './guide'

let order = 0
function entry(key: string, category: GuideCategory, dates?: string[]): GuideEntry {
  return {
    tripId: 'peru-2026',
    order: order++,
    key,
    category,
    title: key,
    summary: `${key} summary`,
    body: [`${key} body`],
    dates,
    sources: ['https://example.org'],
  }
}

const keys = (entries: GuideEntry[]) => entries.map((e) => e.key)

describe('GUIDE_SECTIONS', () => {
  it('lists every category once, in reading order', () => {
    expect(GUIDE_SECTIONS.map((s) => s.label)).toEqual([
      'Historia',
      'Ciudades',
      'Gastronomía',
      'Bebidas',
      'Curiosidades',
      'Consejos',
    ])
  })

  it('labels a category', () => {
    expect(guideCategoryLabel('food')).toBe('Gastronomía')
  })
})

describe('groupGuide', () => {
  it('returns sections in fixed order and drops empty ones', () => {
    const sections = groupGuide([
      entry('pisco', 'drink'),
      entry('incas', 'history'),
      entry('ceviche', 'food'),
    ])
    expect(sections.map((s) => s.category)).toEqual(['history', 'food', 'drink'])
  })

  it('keeps authored order within a non-city section', () => {
    const sections = groupGuide([entry('lomo', 'food'), entry('ceviche', 'food')])
    expect(keys(sections[0].entries)).toEqual(['lomo', 'ceviche'])
  })

  it('sorts cities by their earliest date and puts undated cities last in authored order', () => {
    const sections = groupGuide([
      entry('cusco', 'city', ['2026-10-24', '2026-10-23']),
      entry('peru-andino', 'city'),
      entry('lima', 'city', ['2026-10-18']),
      entry('selva', 'city'),
      entry('arequipa', 'city', ['2026-10-19']),
    ])
    expect(keys(sections[0].entries)).toEqual(['lima', 'arequipa', 'cusco', 'peru-andino', 'selva'])
  })

  it('returns no sections for no entries', () => {
    expect(groupGuide([])).toEqual([])
  })
})

describe('guideForDay', () => {
  const all = [
    entry('pisco', 'drink', ['2026-10-18']),
    entry('lima', 'city', ['2026-10-18', '2026-10-19']),
    entry('incas', 'history'),
    entry('uros', 'curiosity', ['2026-10-22']),
  ]

  it('returns the entries dated on that day, in section order', () => {
    expect(keys(guideForDay(all, '2026-10-18'))).toEqual(['lima', 'pisco'])
  })

  it('returns nothing for a day without entries', () => {
    expect(guideForDay(all, '2026-10-28')).toEqual([])
  })
})

describe('guideDayLinks', () => {
  const days = [
    { date: '2026-10-21', title: 'Cañón del Colca → Puno' },
    { date: '2026-10-22', title: 'Lago Titicaca: Uros y Taquile' },
  ]

  it('labels each trip day with its date and title, in trip order', () => {
    expect(guideDayLinks(['2026-10-22', '2026-10-21'], days)).toEqual([
      { date: '2026-10-21', label: 'mié 21 oct · Cañón del Colca → Puno' },
      { date: '2026-10-22', label: 'jue 22 oct · Lago Titicaca: Uros y Taquile' },
    ])
  })

  it('skips dates that are not trip days and handles no dates', () => {
    expect(guideDayLinks(['2026-12-01'], days)).toEqual([])
    expect(guideDayLinks(undefined, days)).toEqual([])
  })
})

describe('sourceLabel', () => {
  it('shows the host without www', () => {
    expect(sourceLabel('https://www.peru.travel/es/gastronomia')).toBe('peru.travel')
  })

  it('falls back to the raw text when it is not a URL', () => {
    expect(sourceLabel('no es una url')).toBe('no es una url')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/trips/domain/guide.test.ts`
Expected: FAIL with `Failed to resolve import "./guide"`.

- [ ] **Step 3: Implement** `src/trips/domain/guide.ts`:

```ts
import type { GuideCategory, GuideEntry, TripDay } from '../types'
import { formatDayLabel } from './dates'

export const GUIDE_SECTIONS: { category: GuideCategory; label: string }[] = [
  { category: 'history', label: 'Historia' },
  { category: 'city', label: 'Ciudades' },
  { category: 'food', label: 'Gastronomía' },
  { category: 'drink', label: 'Bebidas' },
  { category: 'curiosity', label: 'Curiosidades' },
  { category: 'tip', label: 'Consejos' },
]

export function guideCategoryLabel(category: GuideCategory): string {
  return GUIDE_SECTIONS.find((section) => section.category === category)?.label ?? ''
}

export interface GuideSection {
  category: GuideCategory
  label: string
  entries: GuideEntry[]
}

function earliestDate(entry: GuideEntry): string | undefined {
  return entry.dates && entry.dates.length > 0 ? [...entry.dates].sort()[0] : undefined
}

/** Route order: earliest date first; undated entries last. Array sort is stable. */
function byRouteOrder(entries: GuideEntry[]): GuideEntry[] {
  return [...entries].sort((a, b) => {
    const da = earliestDate(a)
    const db = earliestDate(b)
    if (da === db) return 0
    if (da === undefined) return 1
    if (db === undefined) return -1
    return da < db ? -1 : 1
  })
}

/** Sections in reading order, empty ones dropped. `entries` must be in authored order. */
export function groupGuide(entries: GuideEntry[]): GuideSection[] {
  return GUIDE_SECTIONS.map(({ category, label }) => {
    const inSection = entries.filter((entry) => entry.category === category)
    return { category, label, entries: category === 'city' ? byRouteOrder(inSection) : inSection }
  }).filter((section) => section.entries.length > 0)
}

/** Entries linked to a trip day through their `dates`, in section order. */
export function guideForDay(entries: GuideEntry[], date: string): GuideEntry[] {
  return groupGuide(entries.filter((entry) => entry.dates?.includes(date))).flatMap(
    (section) => section.entries
  )
}

export interface GuideDayLink {
  date: string
  label: string
}

/** 'jue 22 oct · Lago Titicaca: Uros y Taquile' for each linked date that is a trip day. */
export function guideDayLinks(
  dates: string[] | undefined,
  days: Pick<TripDay, 'date' | 'title'>[]
): GuideDayLink[] {
  const wanted = new Set(dates ?? [])
  return days
    .filter((day) => wanted.has(day.date))
    .map((day) => ({ date: day.date, label: `${formatDayLabel(day.date)} · ${day.title}` }))
}

/** Short, readable label for a source link: its host without `www.`. */
export function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
```

`guideDayLinks` keeps the order of `days`. `useTripDays` returns them sorted by date, and the test passes them in that order.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/trips/domain/guide.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the full checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed.

- [ ] **Step 6: Commit**

```bash
git add src/trips/domain/guide.ts src/trips/domain/guide.test.ts
git commit -m "feat(trips): add guide grouping and day selection"
```

---

### Task 3: Guide hook, list page and entry page

**Files:**

- Create: `src/trips/hooks/useGuide.ts`
- Create: `src/trips/components/GuideCardList.tsx`
- Create: `src/trips/pages/GuidePage.tsx`
- Create: `src/trips/pages/GuideEntryPage.tsx`
- Modify: `src/App.tsx` (two lazy imports, two routes)

**Interfaces:**

- Consumes: `tripsDb.guideEntries` (Task 1); `groupGuide`, `guideCategoryLabel`, `guideDayLinks`, `sourceLabel` (Task 2); existing `useTrip`, `useTripDays`, `useTripQuery`, `PageHeader`, `TripStatusMessage`.
- Produces:
  - `useGuide(tripId: string): { entries: GuideEntry[]; loading: boolean; error: Error | null }`, entries in authored order.
  - `<GuideCardList entries={GuideEntry[]} tripId={string} />`, also used by Task 4.
  - Routes `/trips/:tripId/guide` and `/trips/:tripId/guide/:entryKey`.

No component test setup exists (`vitest` runs `*.test.ts` in node). This task is verified by build plus a manual pass.

- [ ] **Step 1: Hook** `src/trips/hooks/useGuide.ts`:

```ts
import { tripsDb } from '../db'
import type { GuideEntry } from '../types'
import { useTripQuery } from './useTripQuery'

const NO_ENTRIES: GuideEntry[] = []

export interface UseGuideResult {
  entries: GuideEntry[]
  loading: boolean
  error: Error | null
}

/** The trip's guide entries in authored order. */
export function useGuide(tripId: string): UseGuideResult {
  const { data, loading, error } = useTripQuery(
    () => tripsDb.guideEntries.where('tripId').equals(tripId).sortBy('order'),
    [tripId]
  )
  return { entries: data ?? NO_ENTRIES, loading, error }
}
```

- [ ] **Step 2: Presentational list** `src/trips/components/GuideCardList.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { GuideEntry } from '../types'

interface GuideCardListProps {
  entries: GuideEntry[]
  tripId: string
}

function GuideCardList({ entries, tripId }: GuideCardListProps) {
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {entries.map((entry) => (
        <li key={entry.key} className="border-t border-trip-line first:border-t-0">
          <Link
            to={`/trips/${tripId}/guide/${entry.key}`}
            className="flex items-center gap-3 py-4 text-trip-ink no-underline"
          >
            <span className="flex flex-1 flex-col gap-1">
              <span className="text-lg font-semibold">{entry.title}</span>
              <span className="text-base leading-snug text-trip-ink2">{entry.summary}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-trip-muted" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default GuideCardList
```

- [ ] **Step 3: List page** `src/trips/pages/GuidePage.tsx`:

```tsx
import { useMemo } from 'react'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { groupGuide } from '../domain/guide'
import PageHeader from '../components/PageHeader'
import GuideCardList from '../components/GuideCardList'
import TripStatusMessage from '../components/TripStatusMessage'

function GuidePage() {
  const trip = useTrip()
  const { entries, loading, error } = useGuide(trip.id)
  const sections = useMemo(() => groupGuide(entries), [entries])

  if (error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  if (loading) return <TripStatusMessage message="Cargando la guía…" />

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Guía" subtitle={trip.name} />
      {sections.length === 0 && <TripStatusMessage message="Este viaje todavía no tiene guía." />}
      {sections.map((section) => (
        <section key={section.category} className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">{section.label}</h2>
          <GuideCardList entries={section.entries} tripId={trip.id} />
        </section>
      ))}
    </div>
  )
}

export default GuidePage
```

- [ ] **Step 4: Entry page** `src/trips/pages/GuideEntryPage.tsx`:

```tsx
import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { useTripDays } from '../hooks/useTripDays'
import { guideCategoryLabel, guideDayLinks, sourceLabel } from '../domain/guide'
import TripStatusMessage from '../components/TripStatusMessage'

function GuideEntryPage() {
  const trip = useTrip()
  const { entryKey } = useParams<{ entryKey: string }>()
  const guide = useGuide(trip.id)
  const { days } = useTripDays(trip.id)
  const entry = guide.entries.find((candidate) => candidate.key === entryKey)
  const dayLinks = useMemo(() => guideDayLinks(entry?.dates, days), [entry, days])
  const guidePath = `/trips/${trip.id}/guide`

  if (guide.error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  if (guide.loading) return <TripStatusMessage message="Cargando la guía…" />
  // Unknown key (typo, or removed in a later content version): back to the list.
  if (!entry) return <Navigate to={guidePath} replace />

  return (
    <article className="flex flex-col gap-[18px]">
      <Link
        to={guidePath}
        className="flex items-center gap-1 self-start text-base font-semibold text-trip-ink2 no-underline"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        Guía
      </Link>

      <header className="flex flex-col gap-1">
        <p className="text-sm font-bold uppercase tracking-wider text-trip-muted">
          {guideCategoryLabel(entry.category)}
        </p>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">{entry.title}</h1>
      </header>

      <div className="flex flex-col gap-3">
        {entry.body.map((paragraph, index) => (
          <p key={index} className="text-[17px] leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {dayLinks.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">Días del viaje</h2>
          <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
            {dayLinks.map((link) => (
              <li key={link.date} className="border-t border-trip-line first:border-t-0">
                <Link
                  to={`/trips/${trip.id}/itinerary/${link.date}`}
                  className="flex items-center gap-3 py-4 text-base font-semibold text-trip-ink no-underline"
                >
                  <span className="flex-1">{link.label}</span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-trip-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="flex flex-col gap-1 text-sm text-trip-muted">
        <p className="font-semibold">Fuentes</p>
        <ul className="flex flex-col gap-1">
          {entry.sources.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="break-all">
                {sourceLabel(url)}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  )
}

export default GuideEntryPage
```

- [ ] **Step 5: Routes** in `src/App.tsx`. Next to the other `trips/pages` lazy imports:

```tsx
const GuidePage = lazy(() => import('./trips/pages/GuidePage'))
const GuideEntryPage = lazy(() => import('./trips/pages/GuideEntryPage'))
```

Inside `<Route path="/trips/:tripId" element={<TripShell />}>`, after the `itinerary/:date` route:

```tsx
              <Route path="guide" element={<GuidePage />} />
              <Route path="guide/:entryKey" element={<GuideEntryPage />} />
```

- [ ] **Step 6: Run the checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed.

- [ ] **Step 7: Manual check.** There is no content yet, so seed one entry from the dev console. Run `npm run dev` and open `http://localhost:5173/travel-planner-pwa/trips/peru-2026/guide`. Expect "Este viaje todavía no tiene guía.". Then in DevTools → Console:

```js
const req = indexedDB.open('TripsDB')
req.onsuccess = () => {
  const tx = req.result.transaction('guideEntries', 'readwrite')
  tx.objectStore('guideEntries').put({
    tripId: 'peru-2026',
    order: 0,
    key: 'prueba',
    category: 'food',
    title: 'Prueba',
    summary: 'Resumen',
    body: ['Uno', 'Dos'],
    dates: ['2026-10-22', '2026-12-01'],
    sources: ['https://www.peru.travel/es'],
  })
}
```

Reload the page (live queries only see writes made through Dexie). Expect:

- The list shows "Gastronomía › Prueba".
- The entry page shows the category, two paragraphs, one day link "jue 22 oct · Lago Titicaca: Uros y Taquile" (the 2026-12-01 date is skipped) and the source "peru.travel".
- `/trips/peru-2026/guide/no-existe` redirects to the list.

Delete the test row afterwards (`objectStore('guideEntries').delete(['peru-2026','prueba'])`).

- [ ] **Step 8: Commit**

```bash
git add src/trips/hooks/useGuide.ts src/trips/components/GuideCardList.tsx src/trips/pages/GuidePage.tsx src/trips/pages/GuideEntryPage.tsx src/App.tsx
git commit -m "feat(trips): add guide list and entry pages"
```

---

### Task 4: "Para saber más" on the itinerary day

**Files:**

- Modify: `src/trips/pages/ItineraryPage.tsx`

**Interfaces:**

- Consumes: `useGuide` and `GuideCardList` (Task 3); `guideForDay` (Task 2).

- [ ] **Step 1: Wire the hook.** Add the imports:

```tsx
import { useGuide } from '../hooks/useGuide'
import { guideForDay } from '../domain/guide'
import GuideCardList from '../components/GuideCardList'
```

Right after `const { days, loading, error } = useTripDays(trip.id)`, and before any early return (rules of hooks):

```tsx
const guide = useGuide(trip.id)
```

- [ ] **Step 2: Render the block** between the closing `</div>` of the `role="tabpanel"` element and the `{day.legs.length > 0 && (` Transporte section:

```tsx
{
  guide.error ? (
    <TripStatusMessage tone="error" message="No se pudo cargar la guía de este día." />
  ) : (
    <DayGuide entries={guideForDay(guide.entries, day.date)} tripId={trip.id} />
  )
}
```

And above `function ItineraryPage()`:

```tsx
function DayGuide({ entries, tripId }: { entries: GuideEntry[]; tripId: string }) {
  if (entries.length === 0) return null
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-xl font-bold">Para saber más</h2>
      <GuideCardList entries={entries} tripId={tripId} />
    </section>
  )
}
```

with `import type { GuideEntry } from '../types'`.

The itinerary's own loading state does not wait for the guide. While the guide loads, `entries` is empty and the block stays hidden.

- [ ] **Step 3: Run the checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed.

- [ ] **Step 4: Manual check.** Seed the test row from Task 3 Step 7 again, then open `/trips/peru-2026/itinerary/2026-10-22`:
  - "Para saber más" lists "Prueba" between the tabs and "Transporte", and the card opens the entry.
  - `/itinerary/2026-10-23` shows no block.
  - Temporarily change the querier in `useGuide.ts` to `() => Promise.reject(new Error('test'))`, reload the day: it still renders, with "No se pudo cargar la guía de este día." in place of the block. Revert the change (`git checkout src/trips/hooks/useGuide.ts`); never commit it.

  Delete the test row afterwards.

- [ ] **Step 5: Commit**

```bash
git add src/trips/pages/ItineraryPage.tsx
git commit -m "feat(trips): link guide entries from the itinerary day"
```

---

### Task 5: Move checklist and notes to "Ayuda", redirect, and switch the nav to "Guía"

**Files:**

- Create: `src/trips/pages/ChecklistSection.tsx` (container section rendered by `HelpPage`)
- Modify: `src/trips/pages/HelpPage.tsx`
- Modify: `src/App.tsx` (remove `ChecklistPage`, add the redirect)
- Modify: `src/trips/components/TripNav.tsx`
- Delete: `src/trips/pages/ChecklistPage.tsx`
- Modify: `CLAUDE.md` (Multi-trip routes line)

**Interfaces:**

- Consumes: existing `useChecklist`, `useNotes`, `summarizeChecklist`, `ChecklistGroup`, `NotesEditor`, `TripStatusMessage`.
- Produces: `<ChecklistSection tripId={string} />` with `id="checklist"`; nav item `guide`; redirect `checklist` → `../help#checklist`.

- [ ] **Step 1: Create** `src/trips/pages/ChecklistSection.tsx`. The JSX and logic move unchanged from `ChecklistPage`, plus a heading and the scroll to `#checklist`:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useChecklist } from '../hooks/useChecklist'
import { useNotes } from '../hooks/useNotes'
import { summarizeChecklist } from '../domain/checklist'
import ChecklistGroup from '../components/ChecklistGroup'
import NotesEditor from '../components/NotesEditor'
import TripStatusMessage from '../components/TripStatusMessage'

/** Checklist and notes of a trip, rendered at the end of the "Ayuda" page. */
function ChecklistSection({ tripId }: { tripId: string }) {
  const { items, loading, error, toggle } = useChecklist(tripId)
  const notes = useNotes(tripId)
  const summary = useMemo(() => summarizeChecklist(items), [items])
  // `notes.error` mixes read and save failures. Latch "loaded OK" so a failed save never
  // unmounts the editor (losing typed text) and a failed read never mounts it empty (a later
  // save would overwrite the stored notes).
  const [notesReady, setNotesReady] = useState(false)
  if (!notesReady && !notes.loading && !notes.error) setNotesReady(true)

  // Old /checklist links redirect to help#checklist: bring the section into view once loaded.
  const { hash } = useLocation()
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!loading && hash === '#checklist') sectionRef.current?.scrollIntoView?.({ block: 'start' })
  }, [loading, hash])

  return (
    <section
      ref={sectionRef}
      id="checklist"
      aria-labelledby="checklist-heading"
      className="flex scroll-mt-4 flex-col gap-[18px]"
    >
      <h2 id="checklist-heading" className="text-2xl font-bold">
        Checklist
      </h2>

      {loading ? (
        <TripStatusMessage message="Cargando el checklist…" />
      ) : (
        <>
          {summary.total > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold">
                {summary.done} de {summary.total} hechas
              </p>
              <div
                role="progressbar"
                aria-label="Progreso del checklist"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={summary.percent}
                className="h-2.5 overflow-hidden rounded-full bg-trip-soft"
              >
                <div
                  className="h-2.5 rounded-full bg-trip-done"
                  style={{ width: `${summary.percent}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <TripStatusMessage
              tone="error"
              message={
                items.length === 0
                  ? 'No se pudo cargar el checklist.'
                  : 'No se pudo guardar el cambio. Inténtalo de nuevo.'
              }
            />
          )}

          {summary.groups.map((group) => (
            <ChecklistGroup
              key={group.group}
              group={group}
              onToggle={(id) => {
                toggle(id).catch(() => undefined)
              }}
            />
          ))}
        </>
      )}

      {notesReady && <NotesEditor key={tripId} initialText={notes.text} onSave={notes.save} />}
      {!notesReady && notes.error && (
        <TripStatusMessage tone="error" message="No se pudieron cargar las notas." />
      )}
    </section>
  )
}

export default ChecklistSection
```

- [ ] **Step 2: Render it in Help.** In `src/trips/pages/HelpPage.tsx`, add `import ChecklistSection from './ChecklistSection'` and, as the last child of the outer `<div className="flex flex-col gap-[18px]">` (after the import-button `div`):

```tsx
<ChecklistSection tripId={trip.id} />
```

- [ ] **Step 3: Redirect and remove the page** in `src/App.tsx`. Delete the `const ChecklistPage = lazy(...)` line. Replace `<Route path="checklist" element={<ChecklistPage />} />` with:

```tsx
{
  /* Kept for old links: the checklist now lives at the end of "Ayuda". */
}
;<Route path="checklist" element={<Navigate to="../help#checklist" replace />} />
```

`Navigate` is already imported. Then delete the old page: `git rm src/trips/pages/ChecklistPage.tsx`.

- [ ] **Step 4: Nav.** In `src/trips/components/TripNav.tsx`, change the import to `import { BookOpen, CalendarDays, LifeBuoy, ListOrdered } from 'lucide-react'` and the third item to:

```tsx
  { to: 'guide', label: 'Guía', icon: BookOpen },
```

- [ ] **Step 5: Docs.** In `CLAUDE.md` ("Multi-trip"), replace `` `/trips/:tripId/{today,itinerary[/:date],checklist,help}`. `` with:

```markdown
switcher; `/trips/:tripId/{today,itinerary[/:date],guide[/:entryKey],help}`
(`/checklist` redirects to `help#checklist`: checklist and notes live at the end of "Ayuda").
```

and under "Content updates", after "devices resync days and checklist labels keeping ticks", add ", and replace the guide entries".

- [ ] **Step 6: Run the checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed. The build fails if anything still imports `ChecklistPage`.

- [ ] **Step 7: Manual check** (`npm run dev`):
  - The nav reads "Hoy · Itinerario · Guía · Ayuda", and "Guía" is highlighted on both `/guide` and `/guide/:key`.
  - "Ayuda" ends with "Checklist", showing the same progress and ticks as before, and with the notes. Tick an item, reload, and it stays ticked.
  - `/trips/peru-2026/checklist` lands on `/trips/peru-2026/help#checklist`, scrolled to the checklist.

- [ ] **Step 8: Commit**

```bash
git add src/trips/pages/ChecklistSection.tsx src/trips/pages/HelpPage.tsx src/App.tsx src/trips/components/TripNav.tsx CLAUDE.md
git commit -m "feat(trips): replace checklist tab with the guide and move checklist to help"
```

(`git rm` already staged the deleted page.)

---

### Task 6: Content guard tests

**Files:**

- Modify: `src/trips/content/content.test.ts`

**Interfaces:**

- Consumes: `TripContent.guide` (Task 1).

- [ ] **Step 1: Write the tests** inside `describe('trip content', …)`:

```ts
it.each(v2Trips)('$id guide entries are well-formed', async (trip) => {
  const content = await loadTripContent(trip.id)
  const guide = content.guide ?? []
  const keys = guide.map((entry) => entry.key)
  expect(new Set(keys).size).toBe(keys.length)

  const tripDates = new Set(content.days.map((day) => day.date))
  for (const entry of guide) {
    expect(entry.key).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(entry.title.trim()).not.toBe('')
    expect(entry.summary.trim()).not.toBe('')
    expect(entry.body.length).toBeGreaterThan(0)
    for (const paragraph of entry.body) expect(paragraph.trim()).not.toBe('')
    expect(entry.sources.length).toBeGreaterThan(0)
    for (const url of entry.sources) expect(url).toMatch(/^https:\/\/\S+$/)
    for (const date of entry.dates ?? []) expect(tripDates.has(date)).toBe(true)
  }
})

it('Peru has a guide', async () => {
  const content = await loadTripContent('peru-2026')
  expect(content.guide?.length ?? 0).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run to verify RED**

Run: `npm test -- src/trips/content/content.test.ts`
Expected: "Peru has a guide" FAILS (`expected 0 to be greater than 0`). The well-formed test passes vacuously. This test turns GREEN in Task 7.

- [ ] **Step 3: Do not commit yet.** These tests go in the same commit as the content (Task 7), so the branch never has a red commit.

---

### Task 7: Peru guide content (after the user approves the draft)

**Files:**

- Modify: `src/trips/content/peru-2026.ts`
- Commit together with: `src/trips/content/content.test.ts` (Task 6)

**Interfaces:**

- Consumes: the approved `docs/peru/guia-borrador.md` (Task 0) and `ContentGuideEntry` (Task 1).

- [ ] **Step 1: Re-read the current `seedVersion`** in `peru-2026.ts`. Another session may have changed it.
- [ ] **Step 2: Add `guide`** after `checklist: [...]`, copying the approved draft in its order. One object per entry, for example:

```ts
  guide: [
    {
      key: 'ceviche',
      category: 'food',
      title: 'Ceviche',
      summary: 'El plato bandera de Perú: pescado fresco marinado en limón.',
      body: [
        'Pescado fresco cortado en cubos y marinado en jugo de limón recién exprimido, con cebolla morada, ají limo, choclo y camote.',
        'Se come a mediodía: el pescado es del día y en Lima muchas cevicherías cierran por la tarde.',
      ],
      dates: ['2026-10-18'],
      sources: ['https://www.peru.travel/es/experiencias/gastronomia'],
    },
    // …every other approved entry, verbatim from the draft
  ],
```

(The example's text and URL are illustrative. Use exactly what the approved draft says.)

- [ ] **Step 3: Bump `seedVersion`** by one and add `Guide: docs/peru/guia-borrador.md (reviewed by the owner).` to the header comment.
- [ ] **Step 4: Run the tests to verify GREEN**

Run: `npm test`
Expected: PASS, including "Peru has a guide" and "peru-2026 guide entries are well-formed".

- [ ] **Step 5: Run lint, format and build**

Run: `npm run lint && npm run format:check && npm run build`
Expected: all succeed.

- [ ] **Step 6: Manual pass** (`npm run build && npm run preview`, then open `/travel-planner-pwa/trips/peru-2026/guide`):
  - Sections appear in order, with cities in route order.
  - Each day of 17–28 Oct shows only the entries the draft assigned to it.
  - Entry pages open from both the list and the day.
  - After the first load, go offline (DevTools → Network → Offline) and reload an entry page by its URL: it still renders.
  - A device that already had `seedVersion` 6 resyncs: the ticks and notes in "Ayuda" are unchanged.

- [ ] **Step 7: Commit**

```bash
git add src/trips/content/peru-2026.ts src/trips/content/content.test.ts
git commit -m "feat(trips): add the Peru travel guide"
```
