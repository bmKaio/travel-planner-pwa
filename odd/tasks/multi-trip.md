# Multi-trip Support (Peru first) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-trip PWA into a multi-trip app: Vietnam stays frozen as a legacy trip, and new trips (Peru first) run on a new engine with the mockup UI, per-trip URLs and a trip switcher.

**Architecture:** Two engines side by side. Vietnam keeps `TravelPlannerDB` and its current pages untouched (only its home moves to `/trips/vietnam-2026`). New trips live in `src/trips/`: a static registry, a separate Dexie database `TripsDB`, pure domain functions (tested with Vitest), thin `useLiveQuery` hooks, container pages and presentational components following the mockup.

**Tech Stack:** React 18, React Router 7.18, Dexie 4.4 + dexie-react-hooks 4.4, Tailwind 3, lucide-react, Vite 5.4, vite-plugin-pwa. New: `vitest@3.2.7`, `fake-indexeddb@6.2.5` (dev), `@fontsource-variable/geist@5.3.0`.

**Spec:** `docs/superpowers/specs/2026-10-10-multi-trip-design.md` (approved 2026-10-10). Mockup: https://claude.ai/artifact/8F75EfvtjMcjUFJYQSymzS (artboards Hoy, Itinerario, Checklist, Ayuda, Hoy · modo oscuro). Peru source content: `docs/peru/itinerario-peru.md` (untracked, user-provided).

---

## ODD feature document

| Field             | Value                                                                                                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Feature           | `multi-trip` · file `odd/tasks/multi-trip.md` · Engram mirror topic `odd/multi-trip/tasks`                                                                                                                                                                                                                         |
| Objective         | Keep a history of trips in the PWA, open Vietnam and Peru by direct URL, switch between trips, and preview Peru live from `feat/viaje-peru`.                                                                                                                                                                       |
| Problem           | The app models exactly one trip: no `tripId` anywhere, Vietnam is hardcoded in ~15 modules, `dailyPlans`/`diaryEntries` use the date as primary key, and deep links 404 on GitHub Pages cold loads.                                                                                                                |
| Why               | The Peru trip (17–28 Oct 2026) needs its own itinerary in the same installed PWA without risking the finished Vietnam trip's real data.                                                                                                                                                                            |
| Scope             | Registry, `TripsDB`, content sync, private import, switcher, landing redirect, per-trip routes, `404.html` shim, v2 screens Hoy / Itinerario / Checklist / Ayuda, Peru content, Vitest setup, docs.                                                                                                                |
| Out of scope (v1) | Backup/export of v2 checklist and notes; in-app itinerary editing; weather; migrating Vietnam; map/places/recommendations/diary/coffee/food for v2 trips.                                                                                                                                                          |
| Authorized scope  | Code changes on branch `feat/viaje-peru` within the files listed in this plan. Commits allowed; **push only when the user asks** (a push redeploys the live site). Legacy Vietnam edits limited to `src/App.tsx`, `src/components/layout/BottomNav.tsx`, `src/pages/MorePage.tsx`.                                 |
| TDD mode          | **on** · source: user decision in conversation on 2026-10-10 (resolves global Strict TDD vs `openspec/config.yaml` `tdd: false`) · runner: Vitest via `npm test` (`vitest run`) · applies to all new code in `src/trips/`; legacy code is not tested. UI-only tasks verify with lint/format/build + manual checks. |
| Applicable checks | `npm test`, `npm run lint`, `npm run format:check`, `npm run build` (tsc -b + vite build), manual check with `npm run dev` at the URL given per task.                                                                                                                                                              |

### Acceptance criteria (from the spec's success criteria)

1. `…/trips/vietnam-2026` opens the existing Vietnam dashboard; every existing Vietnam route keeps working and Vietnam data on devices is untouched.
2. `…/trips/peru-2026` opens the Peru trip in the new UI from the mockup, including on a cold load (no service worker yet) on GitHub Pages.
3. `…/trips` lists trips: upcoming/current first, then past trips under "Historial".
4. Opening the installed PWA (`start_url` = root) lands on the most relevant trip.
5. Adding a future trip requires a registry entry plus a content file, with no schema migration.

### Rationale (short)

The approved design (spec §1) chose two engines so the real Vietnam data in `TravelPlannerDB` is never migrated, and so the new model can follow the mockup instead of the legacy schema. Accepted refinements made while planning are listed under "Deviations from the spec" below.

### Deviations from the spec (accepted while planning)

- `EmergencyInfo` gets a `description` field (`{ label, number, description }`): Peru has separate numbers for police, ambulance and fire, so one number is not enough.
- `HelpInfo.emergency` is nullable: a private import can arrive before the first content sync.
- `LegMode` adds `train` and `boat` (Peru: train to Aguas Calientes, boats on Lake Titicaca).
- Checklist item ids are namespaced as `${tripId}:${key}` by the sync, so two trips can never collide.
- `NotFound.tsx` needs no change: it already navigates to `/`, which becomes the landing redirect.
- `vite.config.ts` workbox `globPatterns` gains `woff2`, otherwise the self-hosted Geist font is not precached and the v2 UI loses its font offline.
- Times in the mockup use Geist Mono; v1 uses `ui-monospace` (no second font package).
- The stay card drops the mockup's "Ver reserva" button: there is no reservation data in the model.
- The pure route resolution (`resolveTripRoute`) and offline content fallback (`ensureTripContent`) are new domain functions so the redirects and the offline behaviour are unit-tested.
- Peru content uses the real itinerary from `docs/peru/itinerario-peru.md` instead of sample days, because it now exists (spec §8). See the assumptions below.

### Assumptions and open decisions (flag to the user before T06)

- **Approximate times:** the dossier only gives flight times. Every other `t` in the Peru content is an approximate slot, marked in a comment. "Ahora / Siguiente" on Hoy is only as good as these times.
- **No hotel names, addresses, flight numbers or phones in public content:** the repo and the site are public. Stays use generic names ("Hotel en Lima"). Hotel names and phones, TUI 24 h, the local agency and insurance go in the **private** JSON (`private/peru-2026-private.json`, gitignored) as Help cards. If the user wants hotel names on Hoy, that needs a decision, because `days` content is public.
- **Hotels pending confirmation:** Puno and Aguas Calientes stays say "Hotel pendiente de confirmar" until the agency confirms (dossier §9).
- `docs/peru/` (itinerary and a 1.2 MB PDF) is **untracked and not gitignored**. Never stage it. Suggest to the user adding `/docs/peru/` to `.gitignore` or moving it under `private/`.

---

## Global Constraints

- UI copy is Spanish; identifiers, types and code comments are English.
- TypeScript strict with `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`: unused code fails `npm run build`.
- Prettier style: no semicolons, single quotes, 2 spaces, `trailingComma: es5`, `printWidth: 100`.
- New code imports with relative paths (as the existing code does). If an alias is ever added, keep `vite.config.ts` and `tsconfig.app.json` in sync.
- No manual service worker registration (vite-plugin-pwa injects it).
- Components stay under 300 lines (`openspec/config.yaml`).
- Pages and components never import `tripsDb` or `db` directly: data goes through hooks in `src/trips/hooks/`.
- Vietnam code is frozen except: `src/App.tsx` (routes), `src/components/layout/BottomNav.tsx` ("Inicio" link), `src/pages/MorePage.tsx` ("Cambiar de viaje" entry).
- Never change the `TravelPlannerDB` schema or `DB_VERSION`; `TripsDB` is a separate IndexedDB database.
- No personal data in `src/trips/content/*` (no passports, names, hotel names, phones, flight numbers, addresses).
- Never stage `docs/peru/` or `private/`. Stage files by explicit path, never `git add -A` / `git add .`.
- Conventional commits, **without** any `Co-Authored-By` or AI attribution line.
- Never `git push` unless the user asks (pushing `feat/viaje-peru` redeploys https://bmkaio.github.io/travel-planner-pwa/).
- Router base: `BrowserRouter basename` = `import.meta.env.BASE_URL` without trailing slash (`/travel-planner-pwa`). Every in-app link is base-relative (`/trips/...`), never prefixed with the base.

## Review Focus

1. **Cold deep link on GitHub Pages** (`/travel-planner-pwa/trips/peru-2026/itinerary/2026-10-24?tab=eat` on a device without the service worker): expected to open that exact screen and tab, not a GitHub 404 or the home. Pinned by `src/trips/spaRedirect.test.ts` (T09).
2. **Device clock near midnight in Peru (UTC−5):** at 23:30 local on 17 Oct (04:30 UTC on 18 Oct), Hoy must show 17 Oct. Pinned by the time zone tests in `src/trips/domain/dates.test.ts` (T01) and `src/trips/domain/today.test.ts` (T03), with Vitest pinned to `TZ=America/Lima`.
3. **Content update after the user ticked checklist items** (`seedVersion` bump in a deploy): ticks survive, renamed items keep their tick, removed items disappear, notes and imported help data are untouched. Pinned by `src/trips/domain/seedSync.test.ts` (T05).
4. **Offline with the lazy content chunk unavailable but `TripsDB` already synced:** the trip must still open with the stored content instead of an error. Pinned by `src/trips/domain/ensureContent.test.ts` (T06).
5. **Private JSON for the wrong trip, an unknown trip, or malformed:** rejected with a Spanish explanation and nothing written. Pinned by `src/trips/import/privateImport.test.ts` (T07).

---

## File Structure

```
vitest.config.ts                         (T01) Vitest config, TZ pinned, fake-indexeddb setup
tsconfig.node.json                       (T01) include vitest.config.ts
package.json                             (T01, T09) test script, devDeps, Geist dep
.github/workflows/deploy.yml             (T01) "Test" step
src/trips/types.ts                       (T01) all v2 domain types
src/trips/registry.ts                    (T01) TRIPS, getTrip, VIETNAM_HOME_PATH
src/trips/domain/dates.ts                (T01, T03, T09) local ISO dates, labels, ranges
src/trips/domain/tripStatus.ts           (T01) upcoming/current/past, switcher sorting
src/trips/domain/landing.ts              (T02) tripHomePath, resolveLandingTarget, resolveTripRoute
src/trips/domain/lastTrip.ts             (T02) last-opened trip in localStorage (try/catch)
src/trips/domain/today.ts                (T03) now/next/rest, today view, banner text
src/trips/domain/mapsUrl.ts              (T04) Google Maps URLs as in the mockup
src/trips/db.ts                          (T05) TripsDatabase, tripsDb singleton
src/trips/domain/seedSync.ts             (T05) versioned content sync
src/trips/testing/makeContent.ts         (T05) test fixture builder (tests only)
src/trips/content/index.ts               (T06) lazy content loader map
src/trips/content/peru-2026.ts           (T06) public Peru content
src/trips/domain/ensureContent.ts        (T06) load + sync with offline fallback
src/trips/hooks/useTripContent.ts        (T06) runs ensureTripContent for the shell
src/trips/import/privateImport.ts        (T07) validate + write private help data
src/trips/domain/checklist.ts            (T08) checklist grouping/progress
src/trips/hooks/{toError,useTripDays,useChecklist,useNotes,useHelpInfo}.ts   (T08)
src/index.css · tailwind.config.js · vite.config.ts                         (T09) palette, font, precache
src/trips/components/{TripScreen,TripCard,LegacyTripLayout}.tsx             (T09)
src/trips/hooks/useRecordLastTrip.ts                                        (T09)
src/trips/pages/{TripSwitcher,LandingRedirect}.tsx                          (T09)
public/404.html · index.html · src/trips/spaRedirect.test.ts                (T09)
src/App.tsx · src/components/layout/BottomNav.tsx · src/pages/MorePage.tsx  (T09, T10–T13 routes)
src/trips/hooks/{useTrip,useNow}.ts                                         (T10)
src/trips/components/{TripLayout,TripNav,PageHeader,TripStatusMessage,buttonStyles,NowCard,PlanList,StayCard,LegList}.tsx|ts (T10)
src/trips/pages/{TripShell,V2TripShell,TripHomeRedirect,TodayPage}.tsx      (T10)
src/trips/domain/itinerary.ts + test                                        (T11)
src/trips/components/{DayStrip,TabBar,StayRow,EatList,SeeList}.tsx          (T11)
src/trips/pages/ItineraryPage.tsx                                           (T11)
src/trips/components/{ChecklistGroup,NotesEditor}.tsx · pages/ChecklistPage.tsx  (T12)
src/trips/components/{EmergencyCard,HelpCard,ContactList,DocList}.tsx · pages/HelpPage.tsx (T13)
CLAUDE.md · openspec/config.yaml                                            (T14)
```

---

### Task T01: Test infrastructure, trip types, registry and trip status

**Files:**

- Modify: `package.json` (script `test`, devDeps)
- Create: `vitest.config.ts`
- Modify: `tsconfig.node.json` (include)
- Modify: `.github/workflows/deploy.yml` (Test step)
- Create: `src/trips/types.ts`, `src/trips/registry.ts`, `src/trips/domain/dates.ts`, `src/trips/domain/tripStatus.ts`
- Test: `src/trips/domain/dates.test.ts`, `src/trips/domain/tripStatus.test.ts`, `src/trips/registry.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `types.ts`: `TripEngine`, `TripMeta`, `TripStatus`, `PlanItem`, `EatItem`, `SeeItem`, `LegMode`, `TravelMode`, `Leg`, `Stay`, `TripDay`, `ChecklistGroupId`, `ChecklistItem`, `TripNote`, `EmergencyInfo`, `HelpCardInfo`, `Contact`, `DocInfo`, `HelpInfo`, `ContentState`, `ContentDay`, `ContentChecklistItem`, `TripContent`.
  - `registry.ts`: `TRIPS: TripMeta[]`, `VIETNAM_HOME_PATH = '/trips/vietnam-2026'`, `getTrip(id: string, trips?: TripMeta[]): TripMeta | undefined`.
  - `dates.ts`: `toLocalIsoDate(date: Date): string`, `daysBetween(from: string, to: string): number`.
  - `tripStatus.ts`: `getTripStatus(trip, today): TripStatus`, `sortTripsForSwitcher(trips, today): { active: TripMeta[]; past: TripMeta[] }`, `TRIP_STATUS_LABEL: Record<TripStatus, string>`.

- [ ] **Step 1: Install the test runner**

Run:

```bash
npm install --save-dev --save-exact vitest@3.2.7 fake-indexeddb@6.2.5
```

Then add the script in `package.json` (`scripts`, after `"preview"`):

```json
    "test": "vitest run",
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

// Pin a non-UTC zone so date helpers are exercised against a real offset (Peru, UTC-5).
process.env.TZ = 'America/Lima'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['fake-indexeddb/auto'],
  },
})
```

In `tsconfig.node.json` change the `include` to:

```json
  "include": ["vite.config.ts", "vitest.config.ts"]
```

In `.github/workflows/deploy.yml`, after the `Check formatting` step, add:

```yaml
- name: Test
  run: npm test
```

- [ ] **Step 2: Write the failing tests**

`src/trips/domain/dates.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { daysBetween, toLocalIsoDate } from './dates'

describe('test environment', () => {
  it('runs in the America/Lima time zone (UTC-5)', () => {
    expect(new Date('2026-10-18T04:30:00Z').getTimezoneOffset()).toBe(300)
  })
})

describe('toLocalIsoDate', () => {
  it('formats the local calendar date with zero padding', () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5, 9, 0))).toBe('2026-01-05')
  })

  it('uses the device time zone, not UTC, near midnight', () => {
    // 04:30 UTC on 18 Oct is 23:30 on 17 Oct in Lima.
    expect(toLocalIsoDate(new Date('2026-10-18T04:30:00Z'))).toBe('2026-10-17')
  })
})

describe('daysBetween', () => {
  it('counts whole days forward', () => {
    expect(daysBetween('2026-10-10', '2026-10-17')).toBe(7)
  })

  it('crosses month boundaries', () => {
    expect(daysBetween('2026-11-28', '2026-12-01')).toBe(3)
  })

  it('is negative when the target is earlier', () => {
    expect(daysBetween('2026-10-28', '2026-10-26')).toBe(-2)
  })
})
```

`src/trips/domain/tripStatus.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { TripMeta } from '../types'
import { getTripStatus, sortTripsForSwitcher, TRIP_STATUS_LABEL } from './tripStatus'

const trip = (id: string, startDate: string, endDate: string): TripMeta => ({
  id,
  name: id,
  startDate,
  endDate,
  countries: [],
  engine: 'v2',
})

describe('getTripStatus', () => {
  const peru = trip('peru-2026', '2026-10-17', '2026-10-28')

  it('is upcoming before the first day', () => {
    expect(getTripStatus(peru, '2026-10-16')).toBe('upcoming')
  })

  it('is current on the first and last day (inclusive)', () => {
    expect(getTripStatus(peru, '2026-10-17')).toBe('current')
    expect(getTripStatus(peru, '2026-10-28')).toBe('current')
  })

  it('is past after the last day', () => {
    expect(getTripStatus(peru, '2026-10-29')).toBe('past')
  })
})

describe('sortTripsForSwitcher', () => {
  const vietnam = trip('vietnam-2026', '2026-07-04', '2026-07-20')
  const italy = trip('italy-2025', '2025-05-01', '2025-05-08')
  const peru = trip('peru-2026', '2026-10-17', '2026-10-28')
  const chile = trip('chile-2027', '2027-02-10', '2027-02-20')
  const japan = trip('japan-2026', '2026-10-01', '2026-10-20')

  it('puts current trips first, then upcoming by start date', () => {
    const { active } = sortTripsForSwitcher([chile, peru, japan, vietnam], '2026-10-10')
    expect(active.map((t) => t.id)).toEqual(['japan-2026', 'peru-2026', 'chile-2027'])
  })

  it('lists past trips most recent first', () => {
    const { past } = sortTripsForSwitcher([italy, vietnam, peru], '2026-10-10')
    expect(past.map((t) => t.id)).toEqual(['vietnam-2026', 'italy-2025'])
  })
})

describe('TRIP_STATUS_LABEL', () => {
  it('has Spanish labels', () => {
    expect(TRIP_STATUS_LABEL).toEqual({
      upcoming: 'Próximo',
      current: 'En curso',
      past: 'Terminado',
    })
  })
})
```

`src/trips/registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getTrip, TRIPS, VIETNAM_HOME_PATH } from './registry'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

describe('trip registry', () => {
  it('has unique ids', () => {
    const ids = TRIPS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has valid ISO date ranges', () => {
    for (const trip of TRIPS) {
      expect(trip.startDate).toMatch(ISO_DATE)
      expect(trip.endDate).toMatch(ISO_DATE)
      expect(trip.startDate <= trip.endDate).toBe(true)
    }
  })

  it('gives every legacy trip a home path', () => {
    for (const trip of TRIPS.filter((t) => t.engine === 'legacy')) {
      expect(trip.legacyHomePath).toBeTruthy()
    }
  })

  it('registers Vietnam as legacy and Peru as v2', () => {
    expect(getTrip('vietnam-2026')).toMatchObject({
      engine: 'legacy',
      legacyHomePath: VIETNAM_HOME_PATH,
    })
    expect(getTrip('peru-2026')).toMatchObject({
      engine: 'v2',
      startDate: '2026-10-17',
      endDate: '2026-10-28',
    })
  })

  it('returns undefined for unknown ids', () => {
    expect(getTrip('japon-2025')).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./dates"`, `"./tripStatus"` and `"./registry"` (files do not exist). The environment test inside `dates.test.ts` is not reached because the import fails.

- [ ] **Step 4: Write the implementation**

`src/trips/types.ts`:

```ts
// Domain types for the v2 trip engine. Legacy Vietnam types live in src/types.

export type TripEngine = 'legacy' | 'v2'

export interface TripMeta {
  id: string
  name: string
  /** ISO date (YYYY-MM-DD), inclusive. */
  startDate: string
  /** ISO date (YYYY-MM-DD), inclusive. */
  endDate: string
  countries: string[]
  engine: TripEngine
  /** Home route of a legacy trip, e.g. '/trips/vietnam-2026'. */
  legacyHomePath?: string
}

export type TripStatus = 'upcoming' | 'current' | 'past'

export interface PlanItem {
  /** Local time HH:mm. Items of a day are sorted by time. */
  t: string
  title: string
  place: string
  /** Google Maps query. */
  q: string
}

export interface EatItem {
  when: string
  name: string
  kind: string
  tip: string
  q: string
}

export interface SeeItem {
  name: string
  desc: string
  dur: string
  q: string
}

export type LegMode = 'car' | 'cable' | 'walk' | 'plane' | 'bus' | 'train' | 'boat'

export type TravelMode = 'driving' | 'walking' | 'transit' | 'bicycling'

export interface Leg {
  mode: LegMode
  title: string
  meta: string
  q?: string
  from?: string
  to?: string
  travel?: TravelMode
}

export interface Stay {
  name: string
  meta: string
  q: string
  phone?: string
}

export interface TripDay {
  tripId: string
  date: string
  title: string
  cities: string[]
  stay: Stay | null
  legs: Leg[]
  plan: PlanItem[]
  eat: EatItem[]
  see: SeeItem[]
}

export type ChecklistGroupId = 'shared' | 'private'

export interface ChecklistItem {
  /** `${tripId}:${key}` */
  id: string
  tripId: string
  group: ChecklistGroupId
  label: string
  done: boolean
  order: number
}

export interface TripNote {
  tripId: string
  text: string
  updatedAt: Date
}

export interface EmergencyInfo {
  label: string
  number: string
  description: string
}

export interface HelpCardInfo {
  title: string
  sub: string
  cta: string
  phone: string
  mapQuery?: string
}

export interface Contact {
  name: string
  role: string
  phone?: string
}

export interface DocInfo {
  name: string
  where: string
  who: string
}

export interface HelpInfo {
  tripId: string
  emergency: EmergencyInfo | null
  cards: HelpCardInfo[]
  contacts: Contact[]
  docs: DocInfo[]
}

export interface ContentState {
  tripId: string
  seedVersion: number
}

export type ContentDay = Omit<TripDay, 'tripId'>

export interface ContentChecklistItem {
  /** Unique within the trip; stored id is `${tripId}:${key}`. */
  key: string
  group: ChecklistGroupId
  label: string
  order: number
}

export interface TripContent {
  tripId: string
  /** Bump on every content change so devices resync. */
  seedVersion: number
  emergency: EmergencyInfo
  days: ContentDay[]
  checklist: ContentChecklistItem[]
}
```

`src/trips/registry.ts`:

```ts
import type { TripMeta } from './types'

export const VIETNAM_HOME_PATH = '/trips/vietnam-2026'

// Adding a trip to the history = one entry here (+ a content file for v2 trips).
export const TRIPS: TripMeta[] = [
  {
    id: 'vietnam-2026',
    name: 'Vietnam y Camboya',
    startDate: '2026-07-04',
    endDate: '2026-07-20',
    countries: ['Vietnam', 'Camboya'],
    engine: 'legacy',
    legacyHomePath: VIETNAM_HOME_PATH,
  },
  {
    id: 'peru-2026',
    name: 'Perú',
    startDate: '2026-10-17',
    endDate: '2026-10-28',
    countries: ['Perú'],
    engine: 'v2',
  },
]

export function getTrip(id: string, trips: TripMeta[] = TRIPS): TripMeta | undefined {
  return trips.find((trip) => trip.id === id)
}
```

`src/trips/domain/dates.ts`:

```ts
const pad = (n: number): string => String(n).padStart(2, '0')

/** Local calendar date (device time zone) as YYYY-MM-DD. Never use toISOString(): it is UTC. */
export function toLocalIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function isoToUtcMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** Whole days from `from` to `to` (ISO dates). Computed in UTC so DST never skews it. */
export function daysBetween(from: string, to: string): number {
  return Math.round((isoToUtcMs(to) - isoToUtcMs(from)) / 86_400_000)
}
```

`src/trips/domain/tripStatus.ts`:

```ts
import type { TripMeta, TripStatus } from '../types'

export function getTripStatus(
  trip: Pick<TripMeta, 'startDate' | 'endDate'>,
  today: string
): TripStatus {
  if (today < trip.startDate) return 'upcoming'
  if (today > trip.endDate) return 'past'
  return 'current'
}

export interface SwitcherSections {
  active: TripMeta[]
  past: TripMeta[]
}

/** Current trips first, then upcoming by start date; past trips most recent first. */
export function sortTripsForSwitcher(trips: TripMeta[], today: string): SwitcherSections {
  const byStatus = (status: TripStatus) => trips.filter((t) => getTripStatus(t, today) === status)
  const current = byStatus('current').sort((a, b) => a.startDate.localeCompare(b.startDate))
  const upcoming = byStatus('upcoming').sort((a, b) => a.startDate.localeCompare(b.startDate))
  const past = byStatus('past').sort((a, b) => b.endDate.localeCompare(a.endDate))
  return { active: [...current, ...upcoming], past }
}

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  upcoming: 'Próximo',
  current: 'En curso',
  past: 'Terminado',
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 3 files, 17 tests passed.

- [ ] **Step 6: Run the project checks**

Run: `npm run lint && npm run format:check && npm run build`
Expected: no lint errors, `All matched files use Prettier code style!`, build finishes with `✓ built in`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tsconfig.node.json .github/workflows/deploy.yml src/trips/types.ts src/trips/registry.ts src/trips/registry.test.ts src/trips/domain/dates.ts src/trips/domain/dates.test.ts src/trips/domain/tripStatus.ts src/trips/domain/tripStatus.test.ts
git commit -m "test: add vitest and trip registry with status helpers"
```

---

### Task T02: Landing target, trip route resolution and last-opened trip

**Files:**

- Create: `src/trips/domain/landing.ts`, `src/trips/domain/lastTrip.ts`
- Test: `src/trips/domain/landing.test.ts`, `src/trips/domain/lastTrip.test.ts`

**Interfaces:**

- Consumes: `TripMeta` (T01), `getTripStatus` (T01).
- Produces:
  - `tripHomePath(trip: TripMeta): string` — legacy → `legacyHomePath ?? '/trips'`; v2 → `/trips/${id}/today`.
  - `resolveLandingTarget(trips: TripMeta[], lastTripId: string | null, today: string): string`.
  - `type TripRoute = { kind: 'v2'; trip: TripMeta } | { kind: 'redirect'; to: string }`; `resolveTripRoute(trips: TripMeta[], tripId: string): TripRoute`.
  - `LAST_TRIP_KEY`, `readLastTripId(storage: Pick<Storage, 'getItem'> | null): string | null`, `writeLastTripId(storage: Pick<Storage, 'setItem'> | null, tripId: string): void`, `getBrowserStorage(): Storage | null`.

- [ ] **Step 1: Write the failing tests**

`src/trips/domain/landing.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { TripMeta } from '../types'
import { resolveLandingTarget, resolveTripRoute, tripHomePath } from './landing'

const vietnam: TripMeta = {
  id: 'vietnam-2026',
  name: 'Vietnam y Camboya',
  startDate: '2026-07-04',
  endDate: '2026-07-20',
  countries: ['Vietnam'],
  engine: 'legacy',
  legacyHomePath: '/trips/vietnam-2026',
}
const peru: TripMeta = {
  id: 'peru-2026',
  name: 'Perú',
  startDate: '2026-10-17',
  endDate: '2026-10-28',
  countries: ['Perú'],
  engine: 'v2',
}
const chile: TripMeta = {
  id: 'chile-2027',
  name: 'Chile',
  startDate: '2027-02-10',
  endDate: '2027-02-20',
  countries: ['Chile'],
  engine: 'v2',
}
const trips = [vietnam, peru, chile]

describe('tripHomePath', () => {
  it('uses the legacy home path for legacy trips', () => {
    expect(tripHomePath(vietnam)).toBe('/trips/vietnam-2026')
  })

  it('falls back to the switcher when a legacy trip has no home path', () => {
    expect(tripHomePath({ ...vietnam, legacyHomePath: undefined })).toBe('/trips')
  })

  it('opens the today screen for v2 trips', () => {
    expect(tripHomePath(peru)).toBe('/trips/peru-2026/today')
  })
})

describe('resolveLandingTarget', () => {
  it('prefers the last opened trip', () => {
    expect(resolveLandingTarget(trips, 'vietnam-2026', '2026-10-20')).toBe('/trips/vietnam-2026')
  })

  it('ignores a stale last opened id and uses the current trip', () => {
    expect(resolveLandingTarget(trips, 'japon-2025', '2026-10-20')).toBe('/trips/peru-2026/today')
  })

  it('uses the soonest upcoming trip when none is current', () => {
    expect(resolveLandingTarget(trips, null, '2026-10-10')).toBe('/trips/peru-2026/today')
  })

  it('falls back to the switcher when every trip is past', () => {
    expect(resolveLandingTarget(trips, null, '2028-01-01')).toBe('/trips')
  })

  it('falls back to the switcher with no trips', () => {
    expect(resolveLandingTarget([], null, '2026-10-10')).toBe('/trips')
  })
})

describe('resolveTripRoute', () => {
  it('renders v2 trips', () => {
    expect(resolveTripRoute(trips, 'peru-2026')).toEqual({ kind: 'v2', trip: peru })
  })

  it('redirects unknown ids to the switcher', () => {
    expect(resolveTripRoute(trips, 'japon-2025')).toEqual({ kind: 'redirect', to: '/trips' })
  })

  it('redirects legacy ids to their legacy home', () => {
    expect(resolveTripRoute(trips, 'vietnam-2026')).toEqual({
      kind: 'redirect',
      to: '/trips/vietnam-2026',
    })
  })
})
```

`src/trips/domain/lastTrip.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { LAST_TRIP_KEY, readLastTripId, writeLastTripId } from './lastTrip'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

const brokenStorage = {
  getItem: (): string | null => {
    throw new Error('SecurityError')
  },
  setItem: (): void => {
    throw new Error('QuotaExceededError')
  },
}

describe('last opened trip', () => {
  it('round-trips the trip id', () => {
    const storage = memoryStorage()
    writeLastTripId(storage, 'peru-2026')
    expect(storage.data.get(LAST_TRIP_KEY)).toBe('peru-2026')
    expect(readLastTripId(storage)).toBe('peru-2026')
  })

  it('returns null when nothing was stored', () => {
    expect(readLastTripId(memoryStorage())).toBeNull()
  })

  it('returns null without storage', () => {
    expect(readLastTripId(null)).toBeNull()
    expect(() => writeLastTripId(null, 'peru-2026')).not.toThrow()
  })

  it('never throws when storage access fails', () => {
    expect(readLastTripId(brokenStorage)).toBeNull()
    expect(() => writeLastTripId(brokenStorage, 'peru-2026')).not.toThrow()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/trips/domain/landing.test.ts src/trips/domain/lastTrip.test.ts`
Expected: FAIL — `Failed to resolve import "./landing"` and `"./lastTrip"`.

- [ ] **Step 3: Write the implementation**

`src/trips/domain/landing.ts`:

```ts
import type { TripMeta } from '../types'
import { getTripStatus } from './tripStatus'

export function tripHomePath(trip: TripMeta): string {
  if (trip.engine === 'legacy') return trip.legacyHomePath ?? '/trips'
  return `/trips/${trip.id}/today`
}

/** Where `/` should go: last opened trip, else current, else next upcoming, else the switcher. */
export function resolveLandingTarget(
  trips: TripMeta[],
  lastTripId: string | null,
  today: string
): string {
  const last = lastTripId ? trips.find((t) => t.id === lastTripId) : undefined
  if (last) return tripHomePath(last)

  const current = trips.find((t) => getTripStatus(t, today) === 'current')
  if (current) return tripHomePath(current)

  const next = trips
    .filter((t) => getTripStatus(t, today) === 'upcoming')
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
  if (next) return tripHomePath(next)

  return '/trips'
}

export type TripRoute = { kind: 'v2'; trip: TripMeta } | { kind: 'redirect'; to: string }

/** Decides what `/trips/:tripId/*` renders. */
export function resolveTripRoute(trips: TripMeta[], tripId: string): TripRoute {
  const trip = trips.find((t) => t.id === tripId)
  if (!trip) return { kind: 'redirect', to: '/trips' }
  if (trip.engine === 'legacy') return { kind: 'redirect', to: tripHomePath(trip) }
  return { kind: 'v2', trip }
}
```

`src/trips/domain/lastTrip.ts`:

```ts
export const LAST_TRIP_KEY = 'travel-planner-last-trip'

export function readLastTripId(storage: Pick<Storage, 'getItem'> | null): string | null {
  if (!storage) return null
  try {
    return storage.getItem(LAST_TRIP_KEY)
  } catch {
    return null
  }
}

export function writeLastTripId(storage: Pick<Storage, 'setItem'> | null, tripId: string): void {
  if (!storage) return
  try {
    storage.setItem(LAST_TRIP_KEY, tripId)
  } catch {
    // Storage unavailable (private mode, quota): the landing falls back to trip dates.
  }
}

export function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all files green (T01 + 15 new tests).

- [ ] **Step 5: Run the project checks**

Run: `npm run lint && npm run format:check && npm run build`
Expected: clean, `✓ built in`.

- [ ] **Step 6: Commit**

```bash
git add src/trips/domain/landing.ts src/trips/domain/landing.test.ts src/trips/domain/lastTrip.ts src/trips/domain/lastTrip.test.ts
git commit -m "feat(trips): add landing and trip route resolution"
```

---

### Task T03: Today view logic and date labels

**Files:**

- Create: `src/trips/domain/today.ts`
- Modify: `src/trips/domain/dates.ts` (labels)
- Test: `src/trips/domain/today.test.ts`, `src/trips/domain/dates.test.ts` (extend)

**Interfaces:**

- Consumes: `PlanItem` (T01), `toLocalIsoDate`, `daysBetween` (T01).
- Produces:
  - `dates.ts`: `MONTHS`, `parseIsoDate(iso): Date`, `weekdayShort(iso): string`, `formatDayLabel(iso): string` (`'sáb 17 oct'`), `formatDayHeading(index, total, iso): string` (`'Día 1 de 12 · sáb 17 oct'`).
  - `today.ts`: `minutesOf(time: string): number`; `interface NowItem extends PlanItem { range: string }`; `interface NowResult { label: 'Ahora' | 'Siguiente'; item: NowItem | null; rest: PlanItem[] }`; `computeNow(plan, nowMinutes): NowResult`; `type TodayBanner = { kind: 'before'; daysLeft: number } | { kind: 'after' } | null`; `interface TodayView { dayIndex: number; banner: TodayBanner; nowMinutes: number | null }`; `resolveTodayView(dates: string[], now: Date): TodayView`; `formatBanner(banner: TodayBanner): string | null`.

- [ ] **Step 1: Write the failing tests**

Append to `src/trips/domain/dates.test.ts` (and add the new names to its import line: `import { daysBetween, formatDayHeading, formatDayLabel, toLocalIsoDate, weekdayShort } from './dates'`):

```ts
describe('day labels', () => {
  it('formats a short Spanish day label', () => {
    expect(formatDayLabel('2026-10-17')).toBe('sáb 17 oct')
    expect(formatDayLabel('2026-12-01')).toBe('mar 1 dic')
  })

  it('returns the short weekday', () => {
    expect(weekdayShort('2026-10-18')).toBe('dom')
  })

  it('formats the day heading', () => {
    expect(formatDayHeading(7, 12, '2026-10-24')).toBe('Día 8 de 12 · sáb 24 oct')
  })
})
```

`src/trips/domain/today.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { PlanItem } from '../types'
import { computeNow, formatBanner, minutesOf, resolveTodayView } from './today'

const item = (t: string, title: string): PlanItem => ({ t, title, place: title, q: title })
const plan = [item('08:30', 'A'), item('10:00', 'B'), item('13:00', 'C')]

describe('minutesOf', () => {
  it('converts HH:mm to minutes', () => {
    expect(minutesOf('00:00')).toBe(0)
    expect(minutesOf('13:05')).toBe(785)
  })
})

describe('computeNow', () => {
  it('shows the first item as next before the day starts', () => {
    const result = computeNow(plan, minutesOf('07:00'))
    expect(result.label).toBe('Siguiente')
    expect(result.item).toMatchObject({ title: 'A', range: '08:30 – 10:00' })
    expect(result.rest.map((p) => p.title)).toEqual(['B', 'C'])
  })

  it('shows the item in progress as now', () => {
    const result = computeNow(plan, minutesOf('10:15'))
    expect(result.label).toBe('Ahora')
    expect(result.item).toMatchObject({ title: 'B', range: '10:00 – 13:00' })
    expect(result.rest.map((p) => p.title)).toEqual(['C'])
  })

  it('treats the start minute as now and the last item as open-ended', () => {
    const result = computeNow(plan, minutesOf('13:00'))
    expect(result.label).toBe('Ahora')
    expect(result.item).toMatchObject({ title: 'C', range: 'Desde las 13:00' })
    expect(result.rest).toEqual([])
  })

  it('handles an empty plan', () => {
    expect(computeNow([], 600)).toEqual({ label: 'Siguiente', item: null, rest: [] })
  })
})

describe('resolveTodayView', () => {
  const dates = ['2026-10-17', '2026-10-18', '2026-10-19']

  it('selects today with the current minute during the trip', () => {
    expect(resolveTodayView(dates, new Date(2026, 9, 18, 10, 15))).toEqual({
      dayIndex: 1,
      banner: null,
      nowMinutes: 615,
    })
  })

  it('shows day 1 with a countdown before the trip', () => {
    expect(resolveTodayView(dates, new Date(2026, 9, 10, 9, 0))).toEqual({
      dayIndex: 0,
      banner: { kind: 'before', daysLeft: 7 },
      nowMinutes: null,
    })
  })

  it('shows the last day after the trip', () => {
    expect(resolveTodayView(dates, new Date(2026, 9, 30, 9, 0))).toEqual({
      dayIndex: 2,
      banner: { kind: 'after' },
      nowMinutes: null,
    })
  })

  it('shows the previous day without a now marker when today has no entry', () => {
    expect(resolveTodayView(['2026-10-17', '2026-10-19'], new Date(2026, 9, 18, 9, 0))).toEqual({
      dayIndex: 0,
      banner: null,
      nowMinutes: null,
    })
  })

  it('handles a trip without days', () => {
    expect(resolveTodayView([], new Date(2026, 9, 18))).toEqual({
      dayIndex: -1,
      banner: null,
      nowMinutes: null,
    })
  })

  it('uses the local day near midnight in Peru, not the UTC day', () => {
    // 04:30 UTC on 18 Oct = 23:30 on 17 Oct in Lima.
    expect(resolveTodayView(dates, new Date('2026-10-18T04:30:00Z'))).toEqual({
      dayIndex: 0,
      banner: null,
      nowMinutes: 23 * 60 + 30,
    })
  })
})

describe('formatBanner', () => {
  it('formats the countdown and the end of the trip', () => {
    expect(formatBanner({ kind: 'before', daysLeft: 1 })).toBe('Falta 1 día')
    expect(formatBanner({ kind: 'before', daysLeft: 7 })).toBe('Faltan 7 días')
    expect(formatBanner({ kind: 'after' })).toBe('Viaje terminado')
    expect(formatBanner(null)).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/trips/domain/today.test.ts src/trips/domain/dates.test.ts`
Expected: FAIL — `Failed to resolve import "./today"`; in `dates.test.ts`, `formatDayLabel is not a function`.

- [ ] **Step 3: Write the implementation**

Append to `src/trips/domain/dates.ts`:

```ts
const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

/** Parses an ISO date at local noon so the weekday never shifts with the time zone. */
export function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`)
}

export function weekdayShort(iso: string): string {
  return WEEKDAYS[parseIsoDate(iso).getDay()]
}

/** 'sáb 17 oct' */
export function formatDayLabel(iso: string): string {
  const date = parseIsoDate(iso)
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

/** 'Día 1 de 12 · sáb 17 oct' (index is zero-based) */
export function formatDayHeading(index: number, total: number, iso: string): string {
  return `Día ${index + 1} de ${total} · ${formatDayLabel(iso)}`
}
```

`src/trips/domain/today.ts`:

```ts
import type { PlanItem } from '../types'
import { daysBetween, toLocalIsoDate } from './dates'

export function minutesOf(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export interface NowItem extends PlanItem {
  range: string
}

export interface NowResult {
  label: 'Ahora' | 'Siguiente'
  item: NowItem | null
  rest: PlanItem[]
}

/** Mirrors the mockup: the last item already started is "Ahora"; before the first one, "Siguiente". */
export function computeNow(plan: PlanItem[], nowMinutes: number): NowResult {
  if (plan.length === 0) return { label: 'Siguiente', item: null, rest: [] }

  let current = -1
  plan.forEach((p, i) => {
    if (minutesOf(p.t) <= nowMinutes) current = i
  })
  const index = current >= 0 ? current : 0
  const active = plan[index]
  const next = plan[index + 1]

  return {
    label: current >= 0 ? 'Ahora' : 'Siguiente',
    item: { ...active, range: next ? `${active.t} – ${next.t}` : `Desde las ${active.t}` },
    rest: plan.slice(index + 1),
  }
}

export type TodayBanner = { kind: 'before'; daysLeft: number } | { kind: 'after' } | null

export interface TodayView {
  dayIndex: number
  banner: TodayBanner
  /** Minutes since local midnight; null when today is not a trip day. */
  nowMinutes: number | null
}

/** `dates` must be sorted ascending (the hooks sort by date). */
export function resolveTodayView(dates: string[], now: Date): TodayView {
  if (dates.length === 0) return { dayIndex: -1, banner: null, nowMinutes: null }

  const today = toLocalIsoDate(now)
  const first = dates[0]
  const last = dates[dates.length - 1]

  if (today < first) {
    return {
      dayIndex: 0,
      banner: { kind: 'before', daysLeft: daysBetween(today, first) },
      nowMinutes: null,
    }
  }
  if (today > last) {
    return { dayIndex: dates.length - 1, banner: { kind: 'after' }, nowMinutes: null }
  }

  const exact = dates.indexOf(today)
  if (exact >= 0) {
    return { dayIndex: exact, banner: null, nowMinutes: now.getHours() * 60 + now.getMinutes() }
  }

  // Gap inside the trip: show the latest previous day without a "now" marker.
  let previous = 0
  dates.forEach((date, i) => {
    if (date <= today) previous = i
  })
  return { dayIndex: previous, banner: null, nowMinutes: null }
}

export function formatBanner(banner: TodayBanner): string | null {
  if (!banner) return null
  if (banner.kind === 'after') return 'Viaje terminado'
  return banner.daysLeft === 1 ? 'Falta 1 día' : `Faltan ${banner.daysLeft} días`
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all files green.

- [ ] **Step 5: Run the project checks**

Run: `npm run lint && npm run format:check && npm run build`
Expected: clean, `✓ built in`.

- [ ] **Step 6: Commit**

```bash
git add src/trips/domain/today.ts src/trips/domain/today.test.ts src/trips/domain/dates.ts src/trips/domain/dates.test.ts
git commit -m "feat(trips): add today view domain logic"
```

---

### Task T04: Google Maps URL helpers

**Files:**

- Create: `src/trips/domain/mapsUrl.ts`
- Test: `src/trips/domain/mapsUrl.test.ts`

**Interfaces:**

- Consumes: `Leg`, `TravelMode` (T01).
- Produces: `directionsUrl(destination: string, travelMode?: TravelMode): string`, `searchUrl(query: string): string`, `legUrl(leg: Leg): string`.

- [ ] **Step 1: Write the failing test**

`src/trips/domain/mapsUrl.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { directionsUrl, legUrl, searchUrl } from './mapsUrl'

describe('directionsUrl', () => {
  it('builds a directions link to the destination', () => {
    expect(directionsUrl('Plaza de Armas, Cusco')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Plaza%20de%20Armas%2C%20Cusco'
    )
  })

  it('adds the travel mode when given', () => {
    expect(directionsUrl('Machu Picchu', 'walking')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Machu%20Picchu&travelmode=walking'
    )
  })
})

describe('searchUrl', () => {
  it('builds a search link', () => {
    expect(searchUrl('Museo Larco, Lima')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Museo%20Larco%2C%20Lima'
    )
  })
})

describe('legUrl', () => {
  it('builds a route between origin and destination, driving by default', () => {
    expect(
      legUrl({ mode: 'bus', title: 'Arequipa → Chivay', meta: '', from: 'Arequipa', to: 'Chivay' })
    ).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=Arequipa&destination=Chivay&travelmode=driving'
    )
  })

  it('keeps an explicit travel mode', () => {
    expect(
      legUrl({
        mode: 'train',
        title: 'Tren',
        meta: '',
        from: 'Ollantaytambo',
        to: 'Aguas Calientes',
        travel: 'transit',
      })
    ).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=Ollantaytambo&destination=Aguas%20Calientes&travelmode=transit'
    )
  })

  it('searches the query when there is no origin/destination', () => {
    expect(legUrl({ mode: 'plane', title: 'Vuelo', meta: '', q: 'Aeropuerto Jorge Chávez' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=Aeropuerto%20Jorge%20Ch%C3%A1vez'
    )
  })

  it('falls back to the title when there is no query', () => {
    expect(legUrl({ mode: 'walk', title: 'Paseo por Barranco', meta: '' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=Paseo%20por%20Barranco'
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/trips/domain/mapsUrl.test.ts`
Expected: FAIL — `Failed to resolve import "./mapsUrl"`.

- [ ] **Step 3: Write the implementation**

`src/trips/domain/mapsUrl.ts`:

```ts
import type { Leg, TravelMode } from '../types'

const enc = encodeURIComponent

export function directionsUrl(destination: string, travelMode?: TravelMode): string {
  const mode = travelMode ? `&travelmode=${travelMode}` : ''
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(destination)}${mode}`
}

export function searchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${enc(query)}`
}

/** Route when the leg has both ends, otherwise a search for its place. */
export function legUrl(leg: Leg): string {
  if (leg.from && leg.to) {
    return `https://www.google.com/maps/dir/?api=1&origin=${enc(leg.from)}&destination=${enc(leg.to)}&travelmode=${leg.travel ?? 'driving'}`
  }
  return searchUrl(leg.q ?? leg.title)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all files green.

- [ ] **Step 5: Run the project checks**

Run: `npm run lint && npm run format:check && npm run build`
Expected: clean (run `npx prettier --write src/trips/domain/mapsUrl.test.ts` first if format:check flags the long test lines).

- [ ] **Step 6: Commit**

```bash
git add src/trips/domain/mapsUrl.ts src/trips/domain/mapsUrl.test.ts
git commit -m "feat(trips): add google maps url helpers"
```

---

### Task T05: TripsDB and versioned content sync

**Files:**

- Create: `src/trips/db.ts`, `src/trips/domain/seedSync.ts`, `src/trips/testing/makeContent.ts`
- Test: `src/trips/domain/seedSync.test.ts`

**Interfaces:**

- Consumes: types (T01).
- Produces:
  - `db.ts`: `TRIPS_DB_NAME = 'TripsDB'`, `class TripsDatabase extends Dexie` with tables `days: Table<TripDay, [string, string]>`, `checklistItems: EntityTable<ChecklistItem, 'id'>`, `notes: EntityTable<TripNote, 'tripId'>`, `helpInfo: EntityTable<HelpInfo, 'tripId'>`, `contentState: EntityTable<ContentState, 'tripId'>`; constructor `(name = TRIPS_DB_NAME)`; singleton `tripsDb`.
  - `seedSync.ts`: `checklistItemId(tripId: string, key: string): string`, `syncTripContent(db: TripsDatabase, content: TripContent): Promise<boolean>` (true when applied).
  - `testing/makeContent.ts`: `makeContent(overrides?: Partial<TripContent>): TripContent`, `makeDay(date: string, title?: string): ContentDay`.

- [ ] **Step 1: Write the database and the fixture builder (no logic yet)**

`src/trips/db.ts`:

```ts
import Dexie, { type EntityTable, type Table } from 'dexie'
import type { ChecklistItem, ContentState, HelpInfo, TripDay, TripNote } from './types'

export const TRIPS_DB_NAME = 'TripsDB'

/**
 * Database of the v2 trip engine. Separate from the legacy TravelPlannerDB (Vietnam),
 * which is never migrated. Every table is keyed by tripId, so new trips need no schema change.
 */
export class TripsDatabase extends Dexie {
  days!: Table<TripDay, [string, string]>
  checklistItems!: EntityTable<ChecklistItem, 'id'>
  notes!: EntityTable<TripNote, 'tripId'>
  helpInfo!: EntityTable<HelpInfo, 'tripId'>
  contentState!: EntityTable<ContentState, 'tripId'>

  constructor(name: string = TRIPS_DB_NAME) {
    super(name)
    this.version(1).stores({
      days: '[tripId+date], tripId',
      checklistItems: 'id, tripId',
      notes: 'tripId',
      helpInfo: 'tripId',
      contentState: 'tripId',
    })
  }
}

export const tripsDb = new TripsDatabase()
```

`src/trips/testing/makeContent.ts`:

```ts
import type { ContentDay, TripContent } from '../types'

export function makeDay(date: string, title = `Día ${date}`): ContentDay {
  return { date, title, cities: ['Lima'], stay: null, legs: [], plan: [], eat: [], see: [] }
}

export function makeContent(overrides: Partial<TripContent> = {}): TripContent {
  return {
    tripId: 'peru-2026',
    seedVersion: 1,
    emergency: { label: 'Emergencias en Perú', number: '105', description: 'Policía' },
    days: [makeDay('2026-10-17'), makeDay('2026-10-18')],
    checklist: [
      { key: 'g1', group: 'shared', label: 'Contratar el seguro', order: 1 },
      { key: 'p1', group: 'private', label: 'Pasaporte', order: 2 },
    ],
    ...overrides,
  }
}
```

- [ ] **Step 2: Write the failing tests**

`src/trips/domain/seedSync.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TripsDatabase } from '../db'
import { makeContent, makeDay } from '../testing/makeContent'
import { checklistItemId, syncTripContent } from './seedSync'

let db: TripsDatabase

beforeEach(() => {
  db = new TripsDatabase(`TripsDB-test-${crypto.randomUUID()}`)
})

afterEach(async () => {
  await db.delete()
})

describe('syncTripContent', () => {
  it('writes days, namespaced checklist items, emergency info and the version', async () => {
    expect(await syncTripContent(db, makeContent())).toBe(true)

    const days = await db.days.where('tripId').equals('peru-2026').sortBy('date')
    expect(days.map((d) => [d.tripId, d.date])).toEqual([
      ['peru-2026', '2026-10-17'],
      ['peru-2026', '2026-10-18'],
    ])
    expect(await db.checklistItems.get('peru-2026:g1')).toEqual({
      id: 'peru-2026:g1',
      tripId: 'peru-2026',
      group: 'shared',
      label: 'Contratar el seguro',
      order: 1,
      done: false,
    })
    expect(await db.helpInfo.get('peru-2026')).toEqual({
      tripId: 'peru-2026',
      emergency: { label: 'Emergencias en Perú', number: '105', description: 'Policía' },
      cards: [],
      contacts: [],
      docs: [],
    })
    expect(await db.contentState.get('peru-2026')).toEqual({ tripId: 'peru-2026', seedVersion: 1 })
  })

  it('does nothing when the stored version is the same', async () => {
    await syncTripContent(db, makeContent())
    const changed = makeContent({ days: [makeDay('2026-10-17', 'Cambiado')] })
    expect(await syncTripContent(db, changed)).toBe(false)
    expect((await db.days.get(['peru-2026', '2026-10-17']))?.title).toBe('Día 2026-10-17')
  })

  it('does nothing when the content is older than the stored version (rollback)', async () => {
    await syncTripContent(db, makeContent({ seedVersion: 3 }))
    expect(await syncTripContent(db, makeContent({ seedVersion: 2 }))).toBe(false)
    expect(await db.contentState.get('peru-2026')).toEqual({ tripId: 'peru-2026', seedVersion: 3 })
  })

  it('keeps checklist ticks across a version bump, including renamed items', async () => {
    await syncTripContent(db, makeContent())
    await db.checklistItems.update('peru-2026:g1', { done: true })

    await syncTripContent(
      db,
      makeContent({
        seedVersion: 2,
        checklist: [
          { key: 'g1', group: 'shared', label: 'Contratar el seguro de viaje', order: 1 },
          { key: 'p1', group: 'private', label: 'Pasaporte', order: 2 },
        ],
      })
    )

    expect(await db.checklistItems.get('peru-2026:g1')).toMatchObject({
      label: 'Contratar el seguro de viaje',
      done: true,
    })
    expect(await db.checklistItems.get('peru-2026:p1')).toMatchObject({ done: false })
  })

  it('deletes checklist items removed from the content', async () => {
    await syncTripContent(db, makeContent())
    await syncTripContent(
      db,
      makeContent({
        seedVersion: 2,
        checklist: [{ key: 'g1', group: 'shared', label: 'Contratar el seguro', order: 1 }],
      })
    )
    expect(await db.checklistItems.get('peru-2026:p1')).toBeUndefined()
  })

  it('replaces the days of the trip and leaves other trips alone', async () => {
    await syncTripContent(db, makeContent())
    await syncTripContent(db, makeContent({ tripId: 'chile-2027', days: [makeDay('2027-02-10')] }))

    await syncTripContent(db, makeContent({ seedVersion: 2, days: [makeDay('2026-10-18')] }))

    const peruDays = await db.days.where('tripId').equals('peru-2026').toArray()
    expect(peruDays.map((d) => d.date)).toEqual(['2026-10-18'])
    expect(await db.days.get(['chile-2027', '2027-02-10'])).toBeDefined()
  })

  it('never touches notes or imported help data, but updates the emergency info', async () => {
    await syncTripContent(db, makeContent())
    await db.notes.put({ tripId: 'peru-2026', text: 'Llevar dólares', updatedAt: new Date() })
    await db.helpInfo.update('peru-2026', {
      cards: [{ title: 'Seguro', sub: '24 h', cta: 'Llamar', phone: '+34900000000' }],
      contacts: [{ name: 'Ana', role: 'Organiza' }],
      docs: [{ name: 'Pasaportes', where: 'Riñonera', who: 'Embajada' }],
    })

    await syncTripContent(
      db,
      makeContent({
        seedVersion: 2,
        emergency: {
          label: 'Emergencias en Perú',
          number: '105',
          description: 'Policía. SAMU 106',
        },
      })
    )

    expect((await db.notes.get('peru-2026'))?.text).toBe('Llevar dólares')
    const help = await db.helpInfo.get('peru-2026')
    expect(help?.cards).toHaveLength(1)
    expect(help?.contacts).toEqual([{ name: 'Ana', role: 'Organiza' }])
    expect(help?.docs).toHaveLength(1)
    expect(help?.emergency?.description).toBe('Policía. SAMU 106')
  })

  it('rolls everything back when the content is invalid', async () => {
    await syncTripContent(db, makeContent())
    const invalidDay = { ...makeDay('2026-10-19'), date: undefined as unknown as string }

    await expect(
      syncTripContent(db, makeContent({ seedVersion: 2, days: [invalidDay] }))
    ).rejects.toThrow()

    expect(await db.days.where('tripId').equals('peru-2026').count()).toBe(2)
    expect(await db.contentState.get('peru-2026')).toEqual({ tripId: 'peru-2026', seedVersion: 1 })
  })
})

describe('checklistItemId', () => {
  it('namespaces the key with the trip id', () => {
    expect(checklistItemId('peru-2026', 'g1')).toBe('peru-2026:g1')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/trips/domain/seedSync.test.ts`
Expected: FAIL — `Failed to resolve import "./seedSync"`.

- [ ] **Step 4: Write the implementation**

`src/trips/domain/seedSync.ts`:

```ts
import type { TripsDatabase } from '../db'
import type { ChecklistItem, TripContent } from '../types'

export function checklistItemId(tripId: string, key: string): string {
  return `${tripId}:${key}`
}

/**
 * Applies public trip content when its seedVersion is newer than the stored one.
 * Days are replaced; checklist items are upserted keeping `done`; notes and the
 * imported help data (cards, contacts, docs) are never touched. All in one transaction.
 */
export async function syncTripContent(db: TripsDatabase, content: TripContent): Promise<boolean> {
  const { tripId } = content

  return db.transaction(
    'rw',
    [db.days, db.checklistItems, db.helpInfo, db.contentState],
    async () => {
      const state = await db.contentState.get(tripId)
      if (state && state.seedVersion >= content.seedVersion) return false

      await db.days.where('tripId').equals(tripId).delete()
      await db.days.bulkPut(content.days.map((day) => ({ ...day, tripId })))

      const existing = await db.checklistItems.where('tripId').equals(tripId).toArray()
      const doneById = new Map(existing.map((item) => [item.id, item.done]))
      const next: ChecklistItem[] = content.checklist.map((item) => {
        const id = checklistItemId(tripId, item.key)
        return {
          id,
          tripId,
          group: item.group,
          label: item.label,
          order: item.order,
          done: doneById.get(id) ?? false,
        }
      })
      const keep = new Set(next.map((item) => item.id))
      await db.checklistItems.bulkDelete(
        existing.filter((item) => !keep.has(item.id)).map((item) => item.id)
      )
      await db.checklistItems.bulkPut(next)

      const help = await db.helpInfo.get(tripId)
      await db.helpInfo.put({
        tripId,
        emergency: content.emergency,
        cards: help?.cards ?? [],
        contacts: help?.contacts ?? [],
        docs: help?.docs ?? [],
      })

      await db.contentState.put({ tripId, seedVersion: content.seedVersion })
      return true
    }
  )
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all files green, including 9 new `seedSync` tests.

- [ ] **Step 6: Run the project checks**

Run: `npm run lint && npm run format:check && npm run build`
Expected: clean, `✓ built in`.

- [ ] **Step 7: Commit**

```bash
git add src/trips/db.ts src/trips/domain/seedSync.ts src/trips/domain/seedSync.test.ts src/trips/testing/makeContent.ts
git commit -m "feat(trips): add TripsDB and versioned content sync"
```

---

### Task T06: Peru content, content loader and offline-safe loading

**Files:**

- Create: `src/trips/content/index.ts`, `src/trips/content/peru-2026.ts`, `src/trips/domain/ensureContent.ts`, `src/trips/hooks/useTripContent.ts`
- Test: `src/trips/content/content.test.ts`, `src/trips/domain/ensureContent.test.ts`

**Interfaces:**

- Consumes: `TRIPS` (T01), `minutesOf` (T03), `TripsDatabase`, `tripsDb`, `syncTripContent`, `makeContent` (T05).
- Produces:
  - `content/index.ts`: `hasTripContent(tripId: string): boolean`, `loadTripContent(tripId: string): Promise<TripContent>`.
  - `ensureContent.ts`: `type EnsureResult = 'synced' | 'unchanged' | 'stale'`, `ensureTripContent(db: TripsDatabase, tripId: string, load: (tripId: string) => Promise<TripContent>): Promise<EnsureResult>`.
  - `useTripContent(tripId: string): { ready: boolean; error: Error | null; retry: () => void }`.

- [ ] **Step 1: Confirm the open content decisions with the user**

Before writing `peru-2026.ts`, ask the user (one question) whether hotel names may appear in public content. Default if they don't answer: **no**. Generic stays as below; hotel details go in the private JSON (T13).

- [ ] **Step 2: Write the failing tests**

`src/trips/domain/ensureContent.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TripsDatabase } from '../db'
import { makeContent } from '../testing/makeContent'
import { ensureTripContent } from './ensureContent'
import { syncTripContent } from './seedSync'

let db: TripsDatabase

beforeEach(() => {
  db = new TripsDatabase(`TripsDB-test-${crypto.randomUUID()}`)
})

afterEach(async () => {
  await db.delete()
})

const offline = async (): Promise<never> => {
  throw new Error('Failed to fetch dynamically imported module')
}

describe('ensureTripContent', () => {
  it('syncs new content and reports unchanged afterwards', async () => {
    const load = async () => makeContent()
    expect(await ensureTripContent(db, 'peru-2026', load)).toBe('synced')
    expect(await ensureTripContent(db, 'peru-2026', load)).toBe('unchanged')
  })

  it('falls back to stored content when loading fails (offline, chunk not cached)', async () => {
    await syncTripContent(db, makeContent())
    expect(await ensureTripContent(db, 'peru-2026', offline)).toBe('stale')
  })

  it('rethrows when loading fails and nothing is stored', async () => {
    await expect(ensureTripContent(db, 'peru-2026', offline)).rejects.toThrow(
      'Failed to fetch dynamically imported module'
    )
  })
})
```

`src/trips/content/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { TRIPS } from '../registry'
import { minutesOf } from '../domain/today'
import { hasTripContent, loadTripContent } from './index'

const v2Trips = TRIPS.filter((trip) => trip.engine === 'v2')

describe('trip content', () => {
  it('exists for every v2 trip in the registry', () => {
    for (const trip of v2Trips) expect(hasTripContent(trip.id)).toBe(true)
  })

  it.each(v2Trips)('$id content is consistent with the registry', async (trip) => {
    const content = await loadTripContent(trip.id)
    expect(content.tripId).toBe(trip.id)
    expect(Number.isInteger(content.seedVersion) && content.seedVersion > 0).toBe(true)

    const dates = content.days.map((day) => day.date)
    expect(dates).toEqual([...dates].sort())
    expect(new Set(dates).size).toBe(dates.length)
    for (const date of dates) {
      expect(date >= trip.startDate && date <= trip.endDate).toBe(true)
    }

    const keys = content.checklist.map((item) => item.key)
    expect(new Set(keys).size).toBe(keys.length)

    for (const day of content.days) {
      for (const item of day.plan) expect(item.t).toMatch(/^\d{2}:\d{2}$/)
      const minutes = day.plan.map((item) => minutesOf(item.t))
      expect(minutes).toEqual([...minutes].sort((a, b) => a - b))
    }
  })

  it('rejects unknown trips', async () => {
    await expect(loadTripContent('japon-2025')).rejects.toThrow('No hay contenido')
  })

  it('does not treat Object prototype keys as trips', async () => {
    expect(hasTripContent('constructor')).toBe(false)
    await expect(loadTripContent('constructor')).rejects.toThrow('No hay contenido')
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/trips/domain/ensureContent.test.ts src/trips/content/content.test.ts`
Expected: FAIL — `Failed to resolve import "./ensureContent"` and `"./index"`.

- [ ] **Step 4: Write the loader, ensureContent and the hook**

`src/trips/content/index.ts`:

```ts
import type { TripContent } from '../types'

// Each trip's content is a separate lazy chunk (precached by the service worker).
const loaders: Record<string, () => Promise<TripContent>> = {
  'peru-2026': () => import('./peru-2026').then((module) => module.default),
}

export function hasTripContent(tripId: string): boolean {
  return Object.prototype.hasOwnProperty.call(loaders, tripId)
}

export async function loadTripContent(tripId: string): Promise<TripContent> {
  if (!hasTripContent(tripId)) throw new Error(`No hay contenido para el viaje ${tripId}`)
  return loaders[tripId]()
}
```

`src/trips/domain/ensureContent.ts`:

```ts
import type { TripsDatabase } from '../db'
import type { TripContent } from '../types'
import { syncTripContent } from './seedSync'

export type EnsureResult = 'synced' | 'unchanged' | 'stale'

/**
 * Loads and syncs a trip's public content. If loading fails (offline and the chunk is not
 * cached) but the trip was synced before, the stored content is used instead of failing.
 */
export async function ensureTripContent(
  db: TripsDatabase,
  tripId: string,
  load: (tripId: string) => Promise<TripContent>
): Promise<EnsureResult> {
  let content: TripContent
  try {
    content = await load(tripId)
  } catch (err) {
    const state = await db.contentState.get(tripId)
    if (state) return 'stale'
    throw err
  }
  return (await syncTripContent(db, content)) ? 'synced' : 'unchanged'
}
```

`src/trips/hooks/useTripContent.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'
import { loadTripContent } from '../content'
import { tripsDb } from '../db'
import { ensureTripContent } from '../domain/ensureContent'

export interface UseTripContentResult {
  ready: boolean
  error: Error | null
  retry: () => void
}

export function useTripContent(tripId: string): UseTripContentResult {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setError(null)
    ensureTripContent(tripsDb, tripId, loadTripContent)
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
    return () => {
      cancelled = true
    }
  }, [tripId, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { ready, error, retry }
}
```

- [ ] **Step 5: Write the Peru content**

`src/trips/content/peru-2026.ts` — transcribed from `docs/peru/itinerario-peru.md` §3–§7. Public file: no hotel names, addresses, phones or flight numbers.

```ts
import type { TripContent } from '../types'

// Public content for the Peru trip (17–28 Oct 2026), from docs/peru/itinerario-peru.md.
// Times: flights are exact (local time); every other time is an approximate slot because the
// dossier gives none. Hotel names, phones and agency contacts are private (JSON import only).
// Bump seedVersion on every change so installed devices resync.

const content: TripContent = {
  tripId: 'peru-2026',
  seedVersion: 1,
  // Verify these numbers before travelling.
  emergency: {
    label: 'Emergencias en Perú',
    number: '105',
    description: 'Policía: 105 · Ambulancia (SAMU): 106 · Bomberos: 116.',
  },
  days: [
    {
      date: '2026-10-17',
      title: 'Madrid → Lima',
      cities: ['Madrid', 'Lima'],
      stay: {
        name: 'Hotel en Lima',
        meta: 'Miraflores · check-in desde 15:00',
        q: 'Miraflores, Lima',
      },
      legs: [
        {
          mode: 'plane',
          title: 'Vuelo Madrid → Lima',
          meta: 'Sale 13:20 · llega 18:20 (hora local)',
          q: 'Aeropuerto Internacional Jorge Chávez',
        },
        {
          mode: 'car',
          title: 'Traslado al hotel',
          meta: 'Incluido en el circuito',
          from: 'Aeropuerto Internacional Jorge Chávez',
          to: 'Miraflores, Lima',
        },
      ],
      plan: [
        {
          t: '13:20',
          title: 'Vuelo a Lima',
          place: 'Aeropuerto de Madrid-Barajas',
          q: 'Aeropuerto Adolfo Suárez Madrid-Barajas',
        },
        {
          t: '18:20',
          title: 'Llegada a Lima y traslado al hotel',
          place: 'Aeropuerto Jorge Chávez',
          q: 'Aeropuerto Internacional Jorge Chávez',
        },
      ],
      eat: [],
      see: [],
    },
    {
      date: '2026-10-18',
      title: 'Lima: Barranco, centro histórico y Museo Larco',
      cities: ['Lima'],
      stay: { name: 'Hotel en Lima', meta: 'Miraflores · segunda noche', q: 'Miraflores, Lima' },
      legs: [],
      plan: [
        {
          t: '09:00',
          title: 'Barranco y Puente de los Suspiros',
          place: 'Barranco',
          q: 'Puente de los Suspiros, Barranco, Lima',
        },
        {
          t: '11:00',
          title: 'Centro histórico: Plaza de Armas, Catedral y Casa Aliaga',
          place: 'Plaza de Armas de Lima',
          q: 'Plaza de Armas de Lima',
        },
        {
          t: '13:00',
          title: 'Clase express de pisco sour con mini causitas',
          place: 'Lima',
          q: 'Centro de Lima',
        },
        { t: '15:00', title: 'Museo Larco', place: 'Pueblo Libre', q: 'Museo Larco, Lima' },
        { t: '17:00', title: 'Tarde libre', place: 'Miraflores', q: 'Miraflores, Lima' },
      ],
      eat: [
        {
          when: 'Desayuno',
          name: 'Desayuno en el hotel',
          kind: 'Incluido',
          tip: 'Es la única comida incluida hoy.',
          q: 'Miraflores, Lima',
        },
        {
          when: 'Cena',
          name: 'Cena libre en Miraflores',
          kind: 'Por tu cuenta',
          tip: 'Prueba el ceviche o la causa limeña.',
          q: 'restaurantes Miraflores Lima',
        },
      ],
      see: [
        {
          name: 'Puente de los Suspiros',
          desc: 'Barrio bohemio de Barranco y arte urbano.',
          dur: 'Visita guiada',
          q: 'Puente de los Suspiros, Barranco, Lima',
        },
        {
          name: 'Plaza de Armas y Catedral',
          desc: 'La Catedral cierra los domingos por la mañana: confirmar el orden de la visita.',
          dur: 'Visita guiada',
          q: 'Catedral de Lima',
        },
        {
          name: 'Casa Aliaga',
          desc: 'Casona colonial en el centro histórico.',
          dur: 'Visita guiada',
          q: 'Casa Aliaga, Lima',
        },
        {
          name: 'Museo Larco',
          desc: 'Colección de arte precolombino.',
          dur: 'Visita guiada',
          q: 'Museo Larco, Lima',
        },
      ],
    },
    {
      date: '2026-10-19',
      title: 'Lima → Arequipa, la Ciudad Blanca',
      cities: ['Lima', 'Arequipa'],
      stay: {
        name: 'Hotel en Arequipa',
        meta: 'Centro histórico · check-in desde 15:00',
        q: 'Centro histórico de Arequipa',
      },
      legs: [
        {
          mode: 'plane',
          title: 'Vuelo Lima → Arequipa',
          meta: 'Sale 10:30 · llega 12:00',
          q: 'Aeropuerto Internacional Alfredo Rodríguez Ballón',
        },
      ],
      plan: [
        {
          t: '07:30',
          title: 'Traslado al aeropuerto',
          place: 'Aeropuerto Jorge Chávez',
          q: 'Aeropuerto Internacional Jorge Chávez',
        },
        {
          t: '10:30',
          title: 'Vuelo a Arequipa',
          place: 'Aeropuerto Jorge Chávez',
          q: 'Aeropuerto Internacional Jorge Chávez',
        },
        {
          t: '15:00',
          title: 'Miradores de Carmen Alto y Yanahuara',
          place: 'Yanahuara',
          q: 'Mirador de Yanahuara, Arequipa',
        },
        {
          t: '16:30',
          title: 'Plaza de Armas de Arequipa',
          place: 'Centro histórico',
          q: 'Plaza de Armas de Arequipa',
        },
        {
          t: '17:30',
          title: 'Monasterio de Santa Catalina',
          place: 'Centro histórico',
          q: 'Monasterio de Santa Catalina, Arequipa',
        },
      ],
      eat: [
        {
          when: 'Desayuno',
          name: 'Desayuno en el hotel',
          kind: 'Incluido',
          tip: 'Sal con tiempo hacia el aeropuerto.',
          q: 'Miraflores, Lima',
        },
        {
          when: 'Cena',
          name: 'Cena libre en Arequipa',
          kind: 'Por tu cuenta',
          tip: 'Plato típico de la zona: cuy chactado.',
          q: 'restaurantes centro histórico Arequipa',
        },
      ],
      see: [
        {
          name: 'Mirador de Yanahuara',
          desc: 'Arcos de sillar con vistas al Misti.',
          dur: 'Visita guiada',
          q: 'Mirador de Yanahuara, Arequipa',
        },
        {
          name: 'Mirador de Carmen Alto',
          desc: 'Andenes y vistas de los volcanes.',
          dur: 'Visita guiada',
          q: 'Mirador de Carmen Alto, Arequipa',
        },
        {
          name: 'Monasterio de Santa Catalina',
          desc: 'Ciudadela colonial dentro de la ciudad.',
          dur: 'Visita guiada',
          q: 'Monasterio de Santa Catalina, Arequipa',
        },
      ],
    },
    {
      date: '2026-10-20',
      title: 'Arequipa → Cañón del Colca',
      cities: ['Arequipa', 'Patapampa', 'Chivay', 'Yanque'],
      stay: {
        name: 'Hotel en el valle del Colca',
        meta: 'Yanque · check-in desde 15:00',
        q: 'Yanque, Caylloma',
      },
      legs: [
        {
          mode: 'bus',
          title: 'Arequipa → Chivay',
          meta: 'Bus del circuito · carretera de alta montaña',
          from: 'Arequipa',
          to: 'Chivay',
        },
      ],
      plan: [
        { t: '08:00', title: 'Salida hacia el Colca', place: 'Arequipa', q: 'Arequipa' },
        {
          t: '09:30',
          title: 'Reserva Nacional de Salinas y Aguada Blanca',
          place: 'Pampa de Toccra',
          q: 'Reserva Nacional de Salinas y Aguada Blanca',
        },
        {
          t: '11:30',
          title: 'Mirador de Patapampa (4.910 m)',
          place: 'Patapampa',
          q: 'Mirador de los Volcanes Patapampa',
        },
        { t: '13:30', title: 'Llegada a Chivay y almuerzo', place: 'Chivay', q: 'Chivay' },
      ],
      eat: [
        {
          when: 'Almuerzo',
          name: 'Almuerzo en Chivay',
          kind: 'Incluido',
          tip: 'Come ligero: estás por encima de 3.500 m.',
          q: 'Chivay',
        },
      ],
      see: [
        {
          name: 'Salinas y Aguada Blanca',
          desc: 'Alpacas y vistas del Misti, Pichu Pichu y Chachani.',
          dur: 'Parada en ruta',
          q: 'Reserva Nacional de Salinas y Aguada Blanca',
        },
        {
          name: 'Mirador de Patapampa',
          desc: 'El punto más alto del viaje (4.910 m). Camina despacio.',
          dur: 'Parada en ruta',
          q: 'Mirador de los Volcanes Patapampa',
        },
      ],
    },
    {
      date: '2026-10-21',
      title: 'Cañón del Colca → Puno',
      cities: ['Cruz del Cóndor', 'Maca', 'Lagunillas', 'Puno'],
      stay: {
        name: 'Hotel en Puno',
        meta: 'Hotel pendiente de confirmar · check-in desde 15:00',
        q: 'Puno',
      },
      legs: [
        {
          mode: 'bus',
          title: 'Colca → Puno',
          meta: 'Bus del circuito · parada en Lagunillas',
          from: 'Chivay',
          to: 'Puno',
        },
      ],
      plan: [
        {
          t: '07:00',
          title: 'Cruz del Cóndor',
          place: 'Cañón del Colca',
          q: 'Mirador Cruz del Cóndor',
        },
        {
          t: '09:30',
          title: 'Pueblos de Pinchollo, Wayra Punku y Maca',
          place: 'Valle del Colca',
          q: 'Maca, Caylloma',
        },
        { t: '12:30', title: 'Almuerzo', place: 'Valle del Colca', q: 'Chivay' },
        {
          t: '15:00',
          title: 'Laguna de Lagunillas',
          place: 'Ruta a Puno',
          q: 'Laguna Lagunillas, Puno',
        },
        { t: '18:00', title: 'Llegada a Puno', place: 'Puno', q: 'Puno' },
      ],
      eat: [
        {
          when: 'Almuerzo',
          name: 'Almuerzo en el valle del Colca',
          kind: 'Incluido',
          tip: 'Día largo de carretera: lleva agua y algo de picar.',
          q: 'Chivay',
        },
      ],
      see: [
        {
          name: 'Cruz del Cóndor',
          desc: 'Observación de cóndores y vistas del cañón.',
          dur: 'Visita guiada',
          q: 'Mirador Cruz del Cóndor',
        },
        {
          name: 'Maca',
          desc: 'Pueblo del valle con iglesia colonial.',
          dur: 'Parada en ruta',
          q: 'Maca, Caylloma',
        },
        {
          name: 'Laguna de Lagunillas',
          desc: 'Laguna del altiplano camino de Puno.',
          dur: 'Parada en ruta',
          q: 'Laguna Lagunillas, Puno',
        },
      ],
    },
    {
      date: '2026-10-22',
      title: 'Lago Titicaca: Uros y Taquile',
      cities: ['Puno', 'Uros', 'Taquile'],
      stay: {
        name: 'Hotel en Puno',
        meta: 'Hotel pendiente de confirmar · segunda noche',
        q: 'Puno',
      },
      legs: [
        {
          mode: 'boat',
          title: 'Puno → Uros y Taquile',
          meta: 'Barco del circuito',
          q: 'Islas flotantes de los Uros',
        },
      ],
      plan: [
        {
          t: '08:00',
          title: 'Islas flotantes de los Uros',
          place: 'Lago Titicaca',
          q: 'Islas flotantes de los Uros',
        },
        {
          t: '09:30',
          title: 'Paseo en balsa de totora',
          place: 'Uros',
          q: 'Islas flotantes de los Uros',
        },
        { t: '11:30', title: 'Isla de Taquile', place: 'Lago Titicaca', q: 'Isla Taquile' },
        { t: '13:00', title: 'Almuerzo en la isla', place: 'Taquile', q: 'Isla Taquile' },
        { t: '17:00', title: 'Regreso al hotel', place: 'Puno', q: 'Puno' },
      ],
      eat: [
        {
          when: 'Almuerzo',
          name: 'Almuerzo en Taquile',
          kind: 'Incluido',
          tip: 'Tiempo con la comunidad después de comer.',
          q: 'Isla Taquile',
        },
      ],
      see: [
        {
          name: 'Islas de los Uros',
          desc: 'Islas hechas de totora, con paseo en balsa.',
          dur: 'Visita guiada',
          q: 'Islas flotantes de los Uros',
        },
        {
          name: 'Isla de Taquile',
          desc: 'Técnica textil declarada Patrimonio de la Humanidad por la UNESCO.',
          dur: 'Visita guiada',
          q: 'Isla Taquile',
        },
      ],
    },
    {
      date: '2026-10-23',
      title: 'Puno → Cusco por la Ruta del Sur',
      cities: ['Puno', 'Pucará', 'La Raya', 'Raqchi', 'Andahuaylillas', 'Cusco'],
      stay: { name: 'Hotel en Cusco', meta: 'Centro · check-in desde 15:00', q: 'Cusco' },
      legs: [
        {
          mode: 'bus',
          title: 'Puno → Cusco',
          meta: 'Bus turístico · tasa de 0,5 $ por persona (pago directo)',
          from: 'Puno',
          to: 'Cusco',
        },
      ],
      plan: [
        { t: '07:00', title: 'Salida de Puno', place: 'Puno', q: 'Puno' },
        {
          t: '08:30',
          title: 'Pucará: museo, tradición y cultura',
          place: 'Pucará',
          q: 'Pucará, Puno',
        },
        { t: '11:00', title: 'Paso de La Raya (4.335 m)', place: 'La Raya', q: 'Abra La Raya' },
        {
          t: '13:00',
          title: 'Raqchi y Templo de Wiracocha',
          place: 'Raqchi',
          q: 'Complejo arqueológico de Raqchi',
        },
        { t: '14:00', title: 'Almuerzo', place: 'Ruta del Sur', q: 'Raqchi' },
        {
          t: '15:30',
          title: 'Iglesia de Andahuaylillas',
          place: 'Andahuaylillas',
          q: 'Iglesia de San Pedro Apóstol de Andahuaylillas',
        },
        { t: '17:30', title: 'Llegada a Cusco', place: 'Cusco', q: 'Cusco' },
      ],
      eat: [
        {
          when: 'Almuerzo',
          name: 'Almuerzo en la Ruta del Sur',
          kind: 'Incluido',
          tip: 'Lleva efectivo para la tasa del bus.',
          q: 'Raqchi',
        },
      ],
      see: [
        {
          name: 'Pucará',
          desc: 'Museo y tradición alfarera.',
          dur: 'Parada en ruta',
          q: 'Pucará, Puno',
        },
        {
          name: 'Paso de La Raya',
          desc: 'Nevado Chimboya y los Andes a 4.335 m.',
          dur: 'Parada en ruta',
          q: 'Abra La Raya',
        },
        {
          name: 'Raqchi',
          desc: 'Templo de Wiracocha.',
          dur: 'Visita guiada',
          q: 'Complejo arqueológico de Raqchi',
        },
        {
          name: 'Andahuaylillas',
          desc: 'Iglesia barroca, la "Capilla Sixtina de América".',
          dur: 'Visita guiada',
          q: 'Iglesia de San Pedro Apóstol de Andahuaylillas',
        },
      ],
    },
    {
      date: '2026-10-24',
      title: 'Cusco',
      cities: ['Cusco'],
      stay: { name: 'Hotel en Cusco', meta: 'Centro · segunda noche', q: 'Cusco' },
      legs: [],
      plan: [
        {
          t: '09:00',
          title: 'Mercado de San Pedro',
          place: 'Cusco',
          q: 'Mercado de San Pedro, Cusco',
        },
        { t: '10:00', title: 'Koricancha', place: 'Cusco', q: 'Qorikancha, Cusco' },
        { t: '11:30', title: 'Fortaleza de Sacsayhuamán', place: 'Cusco', q: 'Sacsayhuamán' },
        { t: '12:30', title: 'Centro ceremonial de Kenko', place: 'Cusco', q: 'Qenqo, Cusco' },
        {
          t: '13:30',
          title: 'Catedral de Cusco',
          place: 'Plaza de Armas',
          q: 'Catedral del Cusco',
        },
        { t: '15:00', title: 'Tarde libre', place: 'Cusco', q: 'Plaza de Armas del Cusco' },
      ],
      eat: [
        {
          when: 'Desayuno',
          name: 'Desayuno en el hotel',
          kind: 'Incluido',
          tip: 'Tour de medio día: la tarde es libre.',
          q: 'Cusco',
        },
        {
          when: 'Cena',
          name: 'Cena libre en Cusco',
          kind: 'Por tu cuenta',
          tip: 'Prueba el lomo saltado o el ají de gallina.',
          q: 'restaurantes centro Cusco',
        },
      ],
      see: [
        {
          name: 'Mercado de San Pedro',
          desc: 'Mercado central de la ciudad.',
          dur: 'Visita guiada',
          q: 'Mercado de San Pedro, Cusco',
        },
        {
          name: 'Koricancha',
          desc: 'Sincretismo inca y español.',
          dur: 'Visita guiada',
          q: 'Qorikancha, Cusco',
        },
        {
          name: 'Sacsayhuamán',
          desc: 'Fortaleza inca sobre la ciudad.',
          dur: 'Visita guiada',
          q: 'Sacsayhuamán',
        },
        {
          name: 'Catedral de Cusco',
          desc: 'Arte colonial y orfebrería.',
          dur: 'Visita guiada',
          q: 'Catedral del Cusco',
        },
      ],
    },
    {
      date: '2026-10-25',
      title: 'Valle Sagrado → Aguas Calientes',
      cities: ['Cusco', 'Chinchero', 'Moray', 'Ollantaytambo', 'Aguas Calientes'],
      stay: {
        name: 'Hotel en Aguas Calientes',
        meta: 'Hotel pendiente de confirmar · solo equipaje de mano',
        q: 'Aguas Calientes',
      },
      legs: [
        {
          mode: 'bus',
          title: 'Cusco → Ollantaytambo',
          meta: 'Bus del circuito por el Valle Sagrado',
          from: 'Cusco',
          to: 'Ollantaytambo',
        },
        {
          mode: 'train',
          title: 'Ollantaytambo → Aguas Calientes',
          meta: 'Tren · máximo 5 kg de equipaje de mano por persona',
          from: 'Estación de tren de Ollantaytambo',
          to: 'Aguas Calientes',
          travel: 'transit',
        },
      ],
      plan: [
        {
          t: '08:00',
          title: 'Chinchero: tejidos y complejo arqueológico',
          place: 'Chinchero',
          q: 'Chinchero',
        },
        { t: '10:30', title: 'Terrazas de Moray', place: 'Moray', q: 'Moray, Maras' },
        {
          t: '13:00',
          title: 'Almuerzo en el Valle Sagrado',
          place: 'Valle Sagrado',
          q: 'Urubamba',
        },
        {
          t: '15:00',
          title: 'Fortaleza de Ollantaytambo',
          place: 'Ollantaytambo',
          q: 'Ollantaytambo',
        },
        {
          t: '17:30',
          title: 'Tren a Aguas Calientes',
          place: 'Estación de Ollantaytambo',
          q: 'Estación de tren de Ollantaytambo',
        },
        {
          t: '20:00',
          title: 'Cena en Aguas Calientes',
          place: 'Aguas Calientes',
          q: 'Aguas Calientes',
        },
      ],
      eat: [
        {
          when: 'Almuerzo',
          name: 'Almuerzo en el Valle Sagrado',
          kind: 'Incluido',
          tip: 'Deja la maleta grande en el hotel de Cusco.',
          q: 'Urubamba',
        },
        {
          when: 'Cena',
          name: 'Cena en Aguas Calientes',
          kind: 'Incluida',
          tip: 'Acuéstate pronto: mañana toca Machu Picchu.',
          q: 'Aguas Calientes',
        },
      ],
      see: [
        {
          name: 'Chinchero',
          desc: 'Tejidos tradicionales y complejo arqueológico.',
          dur: 'Visita guiada',
          q: 'Chinchero',
        },
        {
          name: 'Moray',
          desc: 'Terrazas agrícolas incas.',
          dur: 'Visita guiada',
          q: 'Moray, Maras',
        },
        {
          name: 'Ollantaytambo',
          desc: 'Fortaleza inca con templos y calles originales.',
          dur: 'Visita guiada',
          q: 'Ollantaytambo',
        },
      ],
    },
    {
      date: '2026-10-26',
      title: 'Machu Picchu → Cusco',
      cities: ['Aguas Calientes', 'Machu Picchu', 'Ollantaytambo', 'Cusco'],
      stay: {
        name: 'Hotel en Cusco',
        meta: 'Centro · última noche · check-in desde 15:00',
        q: 'Cusco',
      },
      legs: [
        {
          mode: 'bus',
          title: 'Aguas Calientes → Machu Picchu',
          meta: 'Bus de subida',
          q: 'Machu Picchu',
        },
        {
          mode: 'train',
          title: 'Aguas Calientes → Ollantaytambo',
          meta: 'Tren de regreso',
          from: 'Aguas Calientes',
          to: 'Estación de tren de Ollantaytambo',
          travel: 'transit',
        },
        {
          mode: 'car',
          title: 'Ollantaytambo → Cusco',
          meta: 'Traslado por carretera',
          from: 'Ollantaytambo',
          to: 'Cusco',
        },
      ],
      plan: [
        {
          t: '07:00',
          title: 'Bus de subida a Machu Picchu',
          place: 'Aguas Calientes',
          q: 'Aguas Calientes',
        },
        {
          t: '08:00',
          title: 'Visita guiada a Machu Picchu',
          place: 'Machu Picchu',
          q: 'Machu Picchu',
        },
        {
          t: '12:30',
          title: 'Almuerzo en Aguas Calientes',
          place: 'Aguas Calientes',
          q: 'Aguas Calientes',
        },
        {
          t: '15:00',
          title: 'Tren de regreso y traslado a Cusco',
          place: 'Aguas Calientes',
          q: 'Estación de tren de Machu Picchu',
        },
        { t: '20:30', title: 'Cena de despedida', place: 'Cusco', q: 'Cusco' },
      ],
      eat: [
        {
          when: 'Almuerzo',
          name: 'Almuerzo en Aguas Calientes',
          kind: 'Incluido',
          tip: 'No se puede subir comida a Machu Picchu.',
          q: 'Aguas Calientes',
        },
        {
          when: 'Cena',
          name: 'Cena de despedida',
          kind: 'Incluida',
          tip: 'Última noche del circuito.',
          q: 'Cusco',
        },
      ],
      see: [
        {
          name: 'Machu Picchu',
          desc: 'Prohibido: trípodes, palos selfie, mochilas de más de 5 kg, comida y drones.',
          dur: 'Visita guiada',
          q: 'Machu Picchu',
        },
      ],
    },
    {
      date: '2026-10-27',
      title: 'Cusco → Lima → Madrid',
      cities: ['Cusco', 'Lima', 'Madrid'],
      stay: null,
      legs: [
        {
          mode: 'plane',
          title: 'Vuelo Cusco → Lima',
          meta: 'Sale 18:00 · llega 19:35',
          q: 'Aeropuerto Internacional Alejandro Velasco Astete',
        },
        {
          mode: 'plane',
          title: 'Vuelo Lima → Madrid',
          meta: 'Sale 21:05 · noche a bordo · conexión de 1 h 30 min',
          q: 'Aeropuerto Internacional Jorge Chávez',
        },
      ],
      plan: [
        {
          t: '09:00',
          title: 'Mañana libre en Cusco',
          place: 'Cusco',
          q: 'Plaza de Armas del Cusco',
        },
        {
          t: '15:00',
          title: 'Traslado al aeropuerto',
          place: 'Aeropuerto de Cusco',
          q: 'Aeropuerto Internacional Alejandro Velasco Astete',
        },
        {
          t: '18:00',
          title: 'Vuelo a Lima',
          place: 'Aeropuerto de Cusco',
          q: 'Aeropuerto Internacional Alejandro Velasco Astete',
        },
        {
          t: '21:05',
          title: 'Vuelo a Madrid',
          place: 'Aeropuerto Jorge Chávez',
          q: 'Aeropuerto Internacional Jorge Chávez',
        },
      ],
      eat: [
        {
          when: 'Desayuno',
          name: 'Desayuno en el hotel',
          kind: 'Incluido',
          tip: 'Lleva las dos tarjetas de embarque para la conexión en Lima.',
          q: 'Cusco',
        },
      ],
      see: [],
    },
    {
      date: '2026-10-28',
      title: 'Llegada a Madrid',
      cities: ['Madrid'],
      stay: null,
      legs: [],
      plan: [
        {
          t: '14:20',
          title: 'Llegada a Madrid',
          place: 'Aeropuerto de Madrid-Barajas',
          q: 'Aeropuerto Adolfo Suárez Madrid-Barajas',
        },
      ],
      eat: [],
      see: [],
    },
  ],
  checklist: [
    {
      key: 'g-hotel-puno',
      group: 'shared',
      label: 'Confirmar el hotel de Puno con la agencia',
      order: 1,
    },
    {
      key: 'g-hotel-aguas',
      group: 'shared',
      label: 'Confirmar el hotel de Aguas Calientes',
      order: 2,
    },
    {
      key: 'g-trenes',
      group: 'shared',
      label: 'Confirmar horarios de tren y hora de entrada a Machu Picchu',
      order: 3,
    },
    {
      key: 'g-catedral',
      group: 'shared',
      label: 'Confirmar la visita a la Catedral de Lima (domingo 18)',
      order: 4,
    },
    {
      key: 'g-conexion',
      group: 'shared',
      label: 'Confirmar si la facturación es directa hasta Madrid el 27',
      order: 5,
    },
    {
      key: 'g-checkin',
      group: 'shared',
      label: 'Check-in online de los vuelos (entre 48 h y 4 h antes)',
      order: 6,
    },
    {
      key: 'g-adaptador',
      group: 'shared',
      label: 'Adaptador de enchufe (tipos A, B y C)',
      order: 7,
    },
    {
      key: 'p-pasaporte',
      group: 'private',
      label: 'Pasaporte con al menos 6 meses de validez',
      order: 8,
    },
    {
      key: 'p-embarque',
      group: 'private',
      label: 'Las dos tarjetas de embarque para la conexión en Lima',
      order: 9,
    },
    {
      key: 'p-mochila',
      group: 'private',
      label: 'Mochila de mano de máximo 5 kg para el tren',
      order: 10,
    },
    { key: 'p-ropa', group: 'private', label: 'Ropa de abrigo por capas e impermeable', order: 11 },
    { key: 'p-calzado', group: 'private', label: 'Calzado de montaña', order: 12 },
    { key: 'p-sol', group: 'private', label: 'Protector solar y repelente', order: 13 },
  ],
}

export default content
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx prettier --write src/trips/content/peru-2026.ts && npm test`
Expected: PASS — all files green, including `peru-2026 content is consistent with the registry`.

- [ ] **Step 7: Run the project checks**

Run: `npm run lint && npm run format:check && npm run build`
Expected: clean; the build output lists a separate `peru-2026-*.js` chunk.

- [ ] **Step 8: Commit**

```bash
git add src/trips/content/index.ts src/trips/content/peru-2026.ts src/trips/content/content.test.ts src/trips/domain/ensureContent.ts src/trips/domain/ensureContent.test.ts src/trips/hooks/useTripContent.ts
git commit -m "feat(trips): add Peru content and content loader"
```

---

### Task T07: Private trip data import

**Files:**

- Create: `src/trips/import/privateImport.ts`
- Test: `src/trips/import/privateImport.test.ts`

**Interfaces:**

- Consumes: `TripsDatabase` (T05), `TRIPS` (T01), types (T01).
- Produces:
  - `interface TripPrivateFile { version: 1; type: 'trip-private'; tripId: string; helpInfo: { cards: HelpCardInfo[]; contacts: Contact[]; docs: DocInfo[] } }`
  - `validatePrivateImport(json: unknown, expectedTripId: string, trips?: TripMeta[]): TripPrivateFile` (throws `Error` with a Spanish message)
  - `importTripPrivate(db: TripsDatabase, json: unknown, expectedTripId: string, trips?: TripMeta[]): Promise<void>`

- [ ] **Step 1: Write the failing test**

`src/trips/import/privateImport.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TripsDatabase } from '../db'
import type { TripMeta } from '../types'
import { importTripPrivate, validatePrivateImport } from './privateImport'

const trips: TripMeta[] = [
  {
    id: 'vietnam-2026',
    name: 'Vietnam y Camboya',
    startDate: '2026-07-04',
    endDate: '2026-07-20',
    countries: [],
    engine: 'legacy',
    legacyHomePath: '/trips/vietnam-2026',
  },
  {
    id: 'peru-2026',
    name: 'Perú',
    startDate: '2026-10-17',
    endDate: '2026-10-28',
    countries: [],
    engine: 'v2',
  },
  {
    id: 'chile-2027',
    name: 'Chile',
    startDate: '2027-02-10',
    endDate: '2027-02-20',
    countries: [],
    engine: 'v2',
  },
]

const validFile = () => ({
  version: 1,
  type: 'trip-private',
  tripId: 'peru-2026',
  helpInfo: {
    cards: [
      {
        title: 'Asistencia 24 h',
        sub: 'Agencia',
        cta: 'Llamar a la agencia',
        phone: '+34000000000',
      },
      {
        title: 'Hotel en Lima',
        sub: 'Miraflores',
        cta: 'Llamar al hotel',
        phone: '+5100000000',
        mapQuery: 'Miraflores, Lima',
      },
    ],
    contacts: [{ name: 'Ana', role: 'Organiza el viaje', phone: '+34600000000' }],
    docs: [{ name: 'Pasaportes', where: 'Riñonera de Ana', who: 'Embajada de España' }],
  },
})

let db: TripsDatabase

beforeEach(() => {
  db = new TripsDatabase(`TripsDB-test-${crypto.randomUUID()}`)
})

afterEach(async () => {
  await db.delete()
})

describe('validatePrivateImport', () => {
  it('accepts a valid file', () => {
    expect(validatePrivateImport(validFile(), 'peru-2026', trips).helpInfo.cards).toHaveLength(2)
  })

  it('rejects other file types', () => {
    expect(() => validatePrivateImport({ type: 'travel-diary' }, 'peru-2026', trips)).toThrow(
      'Formato de archivo no válido'
    )
    expect(() => validatePrivateImport(null, 'peru-2026', trips)).toThrow(
      'Formato de archivo no válido'
    )
  })

  it('rejects unsupported versions', () => {
    expect(() => validatePrivateImport({ ...validFile(), version: 2 }, 'peru-2026', trips)).toThrow(
      'Versión de archivo no soportada'
    )
  })

  it('rejects unknown and legacy trips', () => {
    expect(() =>
      validatePrivateImport({ ...validFile(), tripId: 'japon-2025' }, 'peru-2026', trips)
    ).toThrow('El viaje del archivo no existe o no admite importación')
    expect(() =>
      validatePrivateImport({ ...validFile(), tripId: 'vietnam-2026' }, 'peru-2026', trips)
    ).toThrow('El viaje del archivo no existe o no admite importación')
  })

  it('rejects a file that belongs to another trip', () => {
    expect(() =>
      validatePrivateImport({ ...validFile(), tripId: 'chile-2027' }, 'peru-2026', trips)
    ).toThrow('Este archivo es del viaje "Chile", no de este viaje')
  })

  it('rejects malformed help data', () => {
    const file = validFile()
    const broken = { ...file, helpInfo: { ...file.helpInfo, contacts: [{ name: 'Ana' }] } }
    expect(() => validatePrivateImport(broken, 'peru-2026', trips)).toThrow(
      'Datos de ayuda incompletos o con formato incorrecto'
    )
  })
})

describe('importTripPrivate', () => {
  it('writes the help data and keeps the synced emergency info', async () => {
    const emergency = { label: 'Emergencias en Perú', number: '105', description: 'Policía' }
    await db.helpInfo.put({ tripId: 'peru-2026', emergency, cards: [], contacts: [], docs: [] })

    await importTripPrivate(db, validFile(), 'peru-2026', trips)

    const help = await db.helpInfo.get('peru-2026')
    expect(help?.emergency).toEqual(emergency)
    expect(help?.cards).toHaveLength(2)
    expect(help?.contacts[0].name).toBe('Ana')
  })

  it('works before the first content sync (no emergency yet)', async () => {
    await importTripPrivate(db, validFile(), 'peru-2026', trips)
    expect((await db.helpInfo.get('peru-2026'))?.emergency).toBeNull()
  })

  it('replaces a previous import instead of merging', async () => {
    await importTripPrivate(db, validFile(), 'peru-2026', trips)
    const second = { ...validFile(), helpInfo: { cards: [], contacts: [], docs: [] } }
    await importTripPrivate(db, second, 'peru-2026', trips)
    expect((await db.helpInfo.get('peru-2026'))?.cards).toEqual([])
  })

  it('writes nothing when the file is rejected', async () => {
    await importTripPrivate(db, validFile(), 'peru-2026', trips)
    const before = await db.helpInfo.get('peru-2026')

    await expect(
      importTripPrivate(db, { ...validFile(), tripId: 'chile-2027' }, 'peru-2026', trips)
    ).rejects.toThrow()

    expect(await db.helpInfo.get('peru-2026')).toEqual(before)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/trips/import/privateImport.test.ts`
Expected: FAIL — `Failed to resolve import "./privateImport"`.

- [ ] **Step 3: Write the implementation**

`src/trips/import/privateImport.ts`:

```ts
import type { TripsDatabase } from '../db'
import { TRIPS } from '../registry'
import type { Contact, DocInfo, HelpCardInfo, TripMeta } from '../types'

export interface TripPrivateFile {
  version: 1
  type: 'trip-private'
  tripId: string
  helpInfo: { cards: HelpCardInfo[]; contacts: Contact[]; docs: DocInfo[] }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isOptionalString = (value: unknown): boolean => value === undefined || isString(value)

function isCard(value: unknown): value is HelpCardInfo {
  return (
    isObject(value) &&
    isString(value.title) &&
    isString(value.sub) &&
    isString(value.cta) &&
    isString(value.phone) &&
    isOptionalString(value.mapQuery)
  )
}

function isContact(value: unknown): value is Contact {
  return (
    isObject(value) && isString(value.name) && isString(value.role) && isOptionalString(value.phone)
  )
}

function isDoc(value: unknown): value is DocInfo {
  return isObject(value) && isString(value.name) && isString(value.where) && isString(value.who)
}

/** Validates a private file (never committed) for the trip the user is looking at. */
export function validatePrivateImport(
  json: unknown,
  expectedTripId: string,
  trips: TripMeta[] = TRIPS
): TripPrivateFile {
  if (!isObject(json) || json.type !== 'trip-private') {
    throw new Error('Formato de archivo no válido')
  }
  if (json.version !== 1) throw new Error('Versión de archivo no soportada')

  const trip = trips.find((t) => t.id === json.tripId)
  if (!trip || trip.engine !== 'v2') {
    throw new Error('El viaje del archivo no existe o no admite importación')
  }
  if (trip.id !== expectedTripId) {
    throw new Error(`Este archivo es del viaje "${trip.name}", no de este viaje`)
  }

  const help = json.helpInfo
  if (
    !isObject(help) ||
    !Array.isArray(help.cards) ||
    !Array.isArray(help.contacts) ||
    !Array.isArray(help.docs) ||
    !help.cards.every(isCard) ||
    !help.contacts.every(isContact) ||
    !help.docs.every(isDoc)
  ) {
    throw new Error('Datos de ayuda incompletos o con formato incorrecto')
  }

  return {
    version: 1,
    type: 'trip-private',
    tripId: trip.id,
    helpInfo: { cards: help.cards, contacts: help.contacts, docs: help.docs },
  }
}

/** Replaces the private help data of a trip. Keeps the emergency info from public content. */
export async function importTripPrivate(
  db: TripsDatabase,
  json: unknown,
  expectedTripId: string,
  trips: TripMeta[] = TRIPS
): Promise<void> {
  const file = validatePrivateImport(json, expectedTripId, trips)
  await db.transaction('rw', db.helpInfo, async () => {
    const existing = await db.helpInfo.get(file.tripId)
    await db.helpInfo.put({
      tripId: file.tripId,
      emergency: existing?.emergency ?? null,
      ...file.helpInfo,
    })
  })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx prettier --write src/trips/import && npm test`
Expected: PASS — all files green.

- [ ] **Step 5: Run the project checks**

Run: `npm run lint && npm run format:check && npm run build`
Expected: clean, `✓ built in`.

- [ ] **Step 6: Commit**

```bash
git add src/trips/import/privateImport.ts src/trips/import/privateImport.test.ts
git commit -m "feat(trips): add private trip data import"
```

---

### Task T08: Checklist summary and data hooks

**Files:**

- Create: `src/trips/domain/checklist.ts`, `src/trips/hooks/toError.ts`, `src/trips/hooks/useTripDays.ts`, `src/trips/hooks/useChecklist.ts`, `src/trips/hooks/useNotes.ts`, `src/trips/hooks/useHelpInfo.ts`
- Test: `src/trips/domain/checklist.test.ts`

**Interfaces:**

- Consumes: `tripsDb` (T05), `importTripPrivate` (T07), `readJsonFile` from `src/utils/export.ts` (existing, read-only reuse), types (T01).
- Produces:
  - `checklist.ts`: `CHECKLIST_GROUP_TITLE: Record<ChecklistGroupId, string>`; `interface ChecklistGroupView { group: ChecklistGroupId; title: string; items: ChecklistItem[]; done: number; total: number }`; `interface ChecklistSummary { groups: ChecklistGroupView[]; done: number; total: number; percent: number }`; `summarizeChecklist(items: ChecklistItem[]): ChecklistSummary`.
  - `toError(err: unknown): Error`.
  - `useTripDays(tripId): { days: TripDay[]; loading: boolean }` (sorted by date).
  - `useChecklist(tripId): { items: ChecklistItem[]; loading: boolean; error: Error | null; toggle: (id: string) => Promise<void> }`.
  - `useNotes(tripId): { text: string; loading: boolean; error: Error | null; save: (text: string) => Promise<void> }`.
  - `useHelpInfo(tripId): { helpInfo: HelpInfo | null; loading: boolean; error: Error | null; importFromFile: (file: File) => Promise<void> }`.

- [ ] **Step 1: Write the failing test**

`src/trips/domain/checklist.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { ChecklistItem } from '../types'
import { summarizeChecklist } from './checklist'

const item = (
  key: string,
  group: ChecklistItem['group'],
  order: number,
  done = false
): ChecklistItem => ({
  id: `peru-2026:${key}`,
  tripId: 'peru-2026',
  group,
  label: key,
  order,
  done,
})

describe('summarizeChecklist', () => {
  it('groups shared first, then private, each sorted by order', () => {
    const summary = summarizeChecklist([
      item('p2', 'private', 4),
      item('g2', 'shared', 2, true),
      item('p1', 'private', 3, true),
      item('g1', 'shared', 1),
    ])
    expect(summary.groups.map((g) => [g.title, g.items.map((i) => i.label)])).toEqual([
      ['Del grupo', ['g1', 'g2']],
      ['Personal', ['p1', 'p2']],
    ])
    expect(summary.groups.map((g) => [g.done, g.total])).toEqual([
      [1, 2],
      [1, 2],
    ])
    expect(summary).toMatchObject({ done: 2, total: 4, percent: 50 })
  })

  it('omits empty groups', () => {
    const summary = summarizeChecklist([item('g1', 'shared', 1)])
    expect(summary.groups.map((g) => g.group)).toEqual(['shared'])
  })

  it('reports 0 % for an empty checklist instead of NaN', () => {
    expect(summarizeChecklist([])).toEqual({ groups: [], done: 0, total: 0, percent: 0 })
  })

  it('rounds the percentage', () => {
    const summary = summarizeChecklist([
      item('a', 'shared', 1, true),
      item('b', 'shared', 2),
      item('c', 'shared', 3),
    ])
    expect(summary.percent).toBe(33)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/trips/domain/checklist.test.ts`
Expected: FAIL — `Failed to resolve import "./checklist"`.

- [ ] **Step 3: Write the implementation**

`src/trips/domain/checklist.ts`:

```ts
import type { ChecklistGroupId, ChecklistItem } from '../types'

// No sync between devices: titles make no claim about who can see the items.
export const CHECKLIST_GROUP_TITLE: Record<ChecklistGroupId, string> = {
  shared: 'Del grupo',
  private: 'Personal',
}

const GROUP_ORDER: ChecklistGroupId[] = ['shared', 'private']

export interface ChecklistGroupView {
  group: ChecklistGroupId
  title: string
  items: ChecklistItem[]
  done: number
  total: number
}

export interface ChecklistSummary {
  groups: ChecklistGroupView[]
  done: number
  total: number
  percent: number
}

export function summarizeChecklist(items: ChecklistItem[]): ChecklistSummary {
  const groups = GROUP_ORDER.map((group) => {
    const groupItems = items.filter((i) => i.group === group).sort((a, b) => a.order - b.order)
    return {
      group,
      title: CHECKLIST_GROUP_TITLE[group],
      items: groupItems,
      done: groupItems.filter((i) => i.done).length,
      total: groupItems.length,
    }
  }).filter((group) => group.total > 0)

  const done = groups.reduce((sum, g) => sum + g.done, 0)
  const total = groups.reduce((sum, g) => sum + g.total, 0)
  return { groups, done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}
```

`src/trips/hooks/toError.ts`:

```ts
export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err))
}
```

`src/trips/hooks/useTripDays.ts`:

```ts
import { useLiveQuery } from 'dexie-react-hooks'
import { tripsDb } from '../db'
import type { TripDay } from '../types'

const NO_DAYS: TripDay[] = []

export interface UseTripDaysResult {
  days: TripDay[]
  loading: boolean
}

export function useTripDays(tripId: string): UseTripDaysResult {
  const days = useLiveQuery(
    () => tripsDb.days.where('tripId').equals(tripId).sortBy('date'),
    [tripId]
  )
  return { days: days ?? NO_DAYS, loading: days === undefined }
}
```

`src/trips/hooks/useChecklist.ts`:

```ts
import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { tripsDb } from '../db'
import type { ChecklistItem } from '../types'
import { toError } from './toError'

const NO_ITEMS: ChecklistItem[] = []

export interface UseChecklistResult {
  items: ChecklistItem[]
  loading: boolean
  error: Error | null
  toggle: (id: string) => Promise<void>
}

export function useChecklist(tripId: string): UseChecklistResult {
  const [error, setError] = useState<Error | null>(null)
  const items = useLiveQuery(
    () => tripsDb.checklistItems.where('tripId').equals(tripId).toArray(),
    [tripId]
  )

  const toggle = useCallback(async (id: string) => {
    try {
      setError(null)
      const item = await tripsDb.checklistItems.get(id)
      if (!item) return
      await tripsDb.checklistItems.update(id, { done: !item.done })
    } catch (err) {
      const wrapped = toError(err)
      setError(wrapped)
      throw wrapped
    }
  }, [])

  return { items: items ?? NO_ITEMS, loading: items === undefined, error, toggle }
}
```

`src/trips/hooks/useNotes.ts`:

```ts
import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { tripsDb } from '../db'
import { toError } from './toError'

export interface UseNotesResult {
  text: string
  loading: boolean
  error: Error | null
  save: (text: string) => Promise<void>
}

export function useNotes(tripId: string): UseNotesResult {
  const [error, setError] = useState<Error | null>(null)
  // null = loaded but empty; undefined = still loading.
  const note = useLiveQuery(
    () => tripsDb.notes.get(tripId).then((found) => found ?? null),
    [tripId]
  )

  const save = useCallback(
    async (text: string) => {
      try {
        setError(null)
        await tripsDb.notes.put({ tripId, text, updatedAt: new Date() })
      } catch (err) {
        const wrapped = toError(err)
        setError(wrapped)
        throw wrapped
      }
    },
    [tripId]
  )

  return { text: note?.text ?? '', loading: note === undefined, error, save }
}
```

`src/trips/hooks/useHelpInfo.ts`:

```ts
import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { readJsonFile } from '../../utils/export'
import { tripsDb } from '../db'
import { importTripPrivate } from '../import/privateImport'
import type { HelpInfo } from '../types'
import { toError } from './toError'

export interface UseHelpInfoResult {
  helpInfo: HelpInfo | null
  loading: boolean
  error: Error | null
  importFromFile: (file: File) => Promise<void>
}

export function useHelpInfo(tripId: string): UseHelpInfoResult {
  const [error, setError] = useState<Error | null>(null)
  const helpInfo = useLiveQuery(
    () => tripsDb.helpInfo.get(tripId).then((found) => found ?? null),
    [tripId]
  )

  const importFromFile = useCallback(
    async (file: File) => {
      try {
        setError(null)
        const json = await readJsonFile(file)
        await importTripPrivate(tripsDb, json, tripId)
      } catch (err) {
        const wrapped = toError(err)
        setError(wrapped)
        throw wrapped
      }
    },
    [tripId]
  )

  return { helpInfo: helpInfo ?? null, loading: helpInfo === undefined, error, importFromFile }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx prettier --write src/trips/domain/checklist.test.ts && npm test`
Expected: PASS — all files green.

- [ ] **Step 5: Run the project checks**

Run: `npm run lint && npm run format:check && npm run build`
Expected: clean, `✓ built in` (the hooks are not used yet; `noUnusedLocals` does not flag exported symbols).

- [ ] **Step 6: Commit**

```bash
git add src/trips/domain/checklist.ts src/trips/domain/checklist.test.ts src/trips/hooks/toError.ts src/trips/hooks/useTripDays.ts src/trips/hooks/useChecklist.ts src/trips/hooks/useNotes.ts src/trips/hooks/useHelpInfo.ts
git commit -m "feat(trips): add checklist summary and trip data hooks"
```

---

### Task T09: Trip switcher, landing redirect, per-trip URLs and GitHub Pages deep links

**Files:**

- Modify: `package.json` (dependency `@fontsource-variable/geist`)
- Modify: `tailwind.config.js` (colors `trip.*`, font families)
- Modify: `src/index.css` (palette variables)
- Modify: `vite.config.ts` (`globPatterns` + `woff2`)
- Modify: `src/trips/domain/dates.ts` (`formatDateRange`), `src/trips/domain/dates.test.ts`
- Create: `src/trips/components/TripScreen.tsx`, `src/trips/components/TripCard.tsx`, `src/trips/components/LegacyTripLayout.tsx`, `src/trips/hooks/useRecordLastTrip.ts`, `src/trips/pages/TripSwitcher.tsx`, `src/trips/pages/LandingRedirect.tsx`
- Create: `public/404.html`; Modify: `index.html`
- Modify: `src/App.tsx`, `src/components/layout/BottomNav.tsx`, `src/pages/MorePage.tsx`
- Test: `src/trips/spaRedirect.test.ts`

**Interfaces:**

- Consumes: `TRIPS`, `VIETNAM_HOME_PATH` (T01), `sortTripsForSwitcher`, `getTripStatus`, `TRIP_STATUS_LABEL` (T01), `tripHomePath`, `resolveLandingTarget` (T02), `readLastTripId`, `writeLastTripId`, `getBrowserStorage` (T02), `toLocalIsoDate`, `MONTHS` (T01/T03).
- Produces: `formatDateRange(start: string, end: string): string`; `TripScreen` (wraps v2 screens: `.trip-app`, palette, Geist); `useRecordLastTrip(tripId: string): void`; Tailwind tokens `bg-trip-bg`, `bg-trip-card`, `text-trip-ink`, `text-trip-ink2`, `text-trip-muted`, `border-trip-line`, `bg-trip-soft`, `bg-trip-action`, `text-trip-action-ink`, `bg-trip-action-soft`, `text-trip-action`, `bg-trip-done`, `text-trip-done-ink`, `bg-trip-urgent`, `text-trip-urgent-ink`, `bg-trip-urgent-soft`, `border-trip-urgent`, `font-trip`, `font-trip-mono`.

- [ ] **Step 1: Write the failing tests**

Append to `src/trips/domain/dates.test.ts` (add `formatDateRange` to the import):

```ts
describe('formatDateRange', () => {
  it('collapses a range inside one month', () => {
    expect(formatDateRange('2026-10-17', '2026-10-28')).toBe('17–28 oct 2026')
  })

  it('shows both months inside one year', () => {
    expect(formatDateRange('2026-11-28', '2026-12-03')).toBe('28 nov – 3 dic 2026')
  })

  it('shows both years across New Year', () => {
    expect(formatDateRange('2026-12-28', '2027-01-03')).toBe('28 dic 2026 – 3 ene 2027')
  })

  it('shows a single day once', () => {
    expect(formatDateRange('2026-10-17', '2026-10-17')).toBe('17 oct 2026')
  })
})
```

`src/trips/spaRedirect.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Runs the inline scripts of public/404.html and index.html against a fake window,
// pinning the GitHub Pages deep-link round trip under the /travel-planner-pwa/ base.
function inlineScript(file: string): string {
  const html = readFileSync(resolve(process.cwd(), file), 'utf8')
  const match = html.match(/<script>([\s\S]*?)<\/script>/)
  if (!match) throw new Error(`No inline <script> in ${file}`)
  return match[1]
}

function run404(pathname: string, search = '', hash = ''): string {
  let replaced = ''
  const location = {
    protocol: 'https:',
    hostname: 'bmkaio.github.io',
    port: '',
    pathname,
    search,
    hash,
    replace: (url: string) => {
      replaced = url
    },
  }
  new Function('window', inlineScript('public/404.html'))({ location })
  return replaced
}

function runDecoder(search: string, hash = ''): string | null {
  let restored: string | null = null
  const fakeWindow = {
    location: { pathname: '/travel-planner-pwa/', search, hash },
    history: {
      replaceState: (_state: unknown, _title: unknown, url: string) => {
        restored = url
      },
    },
  }
  new Function('window', inlineScript('index.html'))(fakeWindow)
  return restored
}

describe('GitHub Pages SPA redirect', () => {
  it('404.html encodes a deep link with its query under the project base path', () => {
    expect(run404('/travel-planner-pwa/trips/peru-2026/itinerary/2026-10-24', '?tab=eat')).toBe(
      'https://bmkaio.github.io/travel-planner-pwa/?/trips/peru-2026/itinerary/2026-10-24&tab=eat'
    )
  })

  it('index.html restores the original deep link', () => {
    expect(runDecoder('?/trips/peru-2026/itinerary/2026-10-24&tab=eat')).toBe(
      '/travel-planner-pwa/trips/peru-2026/itinerary/2026-10-24?tab=eat'
    )
  })

  it('round-trips a path without query and keeps the hash', () => {
    const encoded = new URL(run404('/travel-planner-pwa/trips', '', '#top'))
    expect(runDecoder(encoded.search, encoded.hash)).toBe('/travel-planner-pwa/trips#top')
  })

  it('index.html leaves normal URLs alone', () => {
    expect(runDecoder('')).toBeNull()
    expect(runDecoder('?tab=eat')).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/trips/spaRedirect.test.ts src/trips/domain/dates.test.ts`
Expected: FAIL — `ENOENT: no such file or directory, open '.../public/404.html'`; `No inline <script> in index.html`; `formatDateRange is not a function`.

- [ ] **Step 3: Add the SPA redirect shim and the decoder**

`public/404.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Travel Planner</title>
    <script>
      // GitHub Pages SPA fallback (rafgraph/spa-github-pages). Keeps the project base
      // (/travel-planner-pwa) and moves the rest of the path into the query string;
      // index.html restores it before the router starts.
      var pathSegmentsToKeep = 1
      var l = window.location
      l.replace(
        l.protocol +
          '//' +
          l.hostname +
          (l.port ? ':' + l.port : '') +
          l.pathname
            .split('/')
            .slice(0, 1 + pathSegmentsToKeep)
            .join('/') +
          '/?/' +
          l.pathname
            .slice(1)
            .split('/')
            .slice(pathSegmentsToKeep)
            .join('/')
            .replace(/&/g, '~and~') +
          (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
          l.hash
      )
    </script>
  </head>
  <body></body>
</html>
```

In `index.html`, inside `<head>` right after the `<title>` line, add:

```html
<script>
  // Restores a deep link encoded by public/404.html (GitHub Pages SPA fallback).
  ;(function (l) {
    if (l.search[1] === '/') {
      var decoded = l.search
        .slice(1)
        .split('&')
        .map(function (s) {
          return s.replace(/~and~/g, '&')
        })
        .join('?')
      window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash)
    }
  })(window.location)
</script>
```

- [ ] **Step 4: Add `formatDateRange`**

Append to `src/trips/domain/dates.ts`:

```ts
/** '17–28 oct 2026' · '28 nov – 3 dic 2026' · '28 dic 2026 – 3 ene 2027' */
export function formatDateRange(start: string, end: string): string {
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  if (start === end) return `${sd} ${MONTHS[sm - 1]} ${sy}`
  if (sy === ey && sm === em) return `${sd}–${ed} ${MONTHS[sm - 1]} ${sy}`
  if (sy === ey) return `${sd} ${MONTHS[sm - 1]} – ${ed} ${MONTHS[em - 1]} ${sy}`
  return `${sd} ${MONTHS[sm - 1]} ${sy} – ${ed} ${MONTHS[em - 1]} ${ey}`
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all files green, including 4 `GitHub Pages SPA redirect` tests.

- [ ] **Step 6: Add the palette, the font and precaching**

Run: `npm install --save-exact @fontsource-variable/geist@5.3.0`

In `tailwind.config.js`, inside `theme.extend.colors` (after `'travel-sand'`), add:

```js
        // v2 trip engine palette (values in src/index.css, light + .dark)
        trip: {
          bg: 'var(--trip-bg)',
          card: 'var(--trip-card)',
          ink: 'var(--trip-ink)',
          ink2: 'var(--trip-ink2)',
          muted: 'var(--trip-muted)',
          line: 'var(--trip-line)',
          soft: 'var(--trip-soft)',
          action: 'var(--trip-action)',
          'action-ink': 'var(--trip-action-ink)',
          'action-soft': 'var(--trip-action-soft)',
          done: 'var(--trip-done)',
          'done-ink': 'var(--trip-done-ink)',
          urgent: 'var(--trip-urgent)',
          'urgent-ink': 'var(--trip-urgent-ink)',
          'urgent-soft': 'var(--trip-urgent-soft)',
        },
```

and inside `theme.extend.fontFamily` (after `sans`):

```js
        trip: ['"Geist Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'trip-mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
```

Append to `src/index.css`:

```css
/* v2 trip engine palette (mockup "App de viaje"); dark mode via the existing .dark class */
@layer base {
  .trip-app {
    --trip-bg: #f6f6f3;
    --trip-card: #ffffff;
    --trip-ink: #121417;
    --trip-ink2: #33373d;
    --trip-muted: #5a5e66;
    --trip-line: #dcddd8;
    --trip-soft: #ecede8;
    --trip-action: #1f4fd1;
    --trip-action-ink: #ffffff;
    --trip-action-soft: #e5ebfa;
    --trip-done: #1b7543;
    --trip-done-ink: #ffffff;
    --trip-urgent: #c42525;
    --trip-urgent-ink: #ffffff;
    --trip-urgent-soft: #fbeaea;
  }

  .dark .trip-app {
    --trip-bg: #0e1013;
    --trip-card: #1a1d21;
    --trip-ink: #f2f3f5;
    --trip-ink2: #d3d6db;
    --trip-muted: #a6abb3;
    --trip-line: #30343a;
    --trip-soft: #24282d;
    --trip-action: #86a8ff;
    --trip-action-ink: #0e1013;
    --trip-action-soft: #1f2a45;
    --trip-done: #5fcb8c;
    --trip-done-ink: #0e1013;
    --trip-urgent: #ff7a7a;
    --trip-urgent-ink: #1a0b0b;
    --trip-urgent-soft: #3a1c1c;
  }
}
```

In `vite.config.ts`, change the workbox `globPatterns` line to:

```ts
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
```

- [ ] **Step 7: Add the switcher, the landing redirect and the legacy layout**

`src/trips/components/TripScreen.tsx`:

```tsx
import '@fontsource-variable/geist'
import type { ReactNode } from 'react'

/** Root of every v2 screen: scopes the trip palette and the Geist font. */
function TripScreen({ children }: { children: ReactNode }) {
  return (
    <div className="trip-app min-h-screen-safe bg-trip-bg font-trip text-trip-ink">{children}</div>
  )
}

export default TripScreen
```

`src/trips/components/TripCard.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { TripMeta } from '../types'
import { getTripStatus, TRIP_STATUS_LABEL } from '../domain/tripStatus'
import { tripHomePath } from '../domain/landing'
import { formatDateRange } from '../domain/dates'

interface TripCardProps {
  trip: TripMeta
  today: string
}

function TripCard({ trip, today }: TripCardProps) {
  const status = getTripStatus(trip, today)
  return (
    <Link
      to={tripHomePath(trip)}
      className="flex items-center gap-4 rounded-[20px] border border-trip-line bg-trip-card p-[18px] text-trip-ink no-underline hover:border-trip-ink"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={`self-start rounded-lg px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider ${
            status === 'current' ? 'bg-trip-ink text-trip-bg' : 'bg-trip-soft text-trip-ink2'
          }`}
        >
          {TRIP_STATUS_LABEL[status]}
        </span>
        <span className="text-lg font-semibold">{trip.name}</span>
        <span className="text-base text-trip-muted">
          {formatDateRange(trip.startDate, trip.endDate)} · {trip.countries.join(', ')}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-trip-muted" aria-hidden="true" />
    </Link>
  )
}

export default TripCard
```

`src/trips/pages/TripSwitcher.tsx`:

```tsx
import { useMemo } from 'react'
import { TRIPS } from '../registry'
import { sortTripsForSwitcher } from '../domain/tripStatus'
import { toLocalIsoDate } from '../domain/dates'
import TripScreen from '../components/TripScreen'
import TripCard from '../components/TripCard'

function TripSwitcher() {
  const today = toLocalIsoDate(new Date())
  const { active, past } = useMemo(() => sortTripsForSwitcher(TRIPS, today), [today])

  return (
    <TripScreen>
      <main className="mx-auto flex max-w-md flex-col gap-6 px-5 pb-10 pt-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight">Mis viajes</h1>
          <p className="text-[17px] font-medium text-trip-ink2">Elige un viaje para abrirlo</p>
        </header>

        {active.length > 0 && (
          <section aria-labelledby="trips-active" className="flex flex-col gap-3">
            <h2 id="trips-active" className="text-xl font-bold">
              Próximos y en curso
            </h2>
            {active.map((trip) => (
              <TripCard key={trip.id} trip={trip} today={today} />
            ))}
          </section>
        )}

        {past.length > 0 && (
          <section aria-labelledby="trips-past" className="flex flex-col gap-3">
            <h2 id="trips-past" className="text-xl font-bold">
              Historial
            </h2>
            {past.map((trip) => (
              <TripCard key={trip.id} trip={trip} today={today} />
            ))}
          </section>
        )}
      </main>
    </TripScreen>
  )
}

export default TripSwitcher
```

`src/trips/pages/LandingRedirect.tsx`:

```tsx
import { Navigate } from 'react-router-dom'
import { TRIPS } from '../registry'
import { resolveLandingTarget } from '../domain/landing'
import { getBrowserStorage, readLastTripId } from '../domain/lastTrip'
import { toLocalIsoDate } from '../domain/dates'

/** `/` (the PWA start_url): opens the most relevant trip. */
function LandingRedirect() {
  const target = resolveLandingTarget(
    TRIPS,
    readLastTripId(getBrowserStorage()),
    toLocalIsoDate(new Date())
  )
  return <Navigate to={target} replace />
}

export default LandingRedirect
```

`src/trips/hooks/useRecordLastTrip.ts`:

```ts
import { useEffect } from 'react'
import { getBrowserStorage, writeLastTripId } from '../domain/lastTrip'

export function useRecordLastTrip(tripId: string): void {
  useEffect(() => {
    writeLastTripId(getBrowserStorage(), tripId)
  }, [tripId])
}
```

`src/trips/components/LegacyTripLayout.tsx`:

```tsx
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Loading from '../../components/common/Loading'
import { useRecordLastTrip } from '../hooks/useRecordLastTrip'

/** Wraps the frozen Vietnam routes: legacy header/nav, and records the trip as last opened. */
function LegacyTripLayout({ tripId }: { tripId: string }) {
  useRecordLastTrip(tripId)
  return (
    <Layout>
      <Suspense fallback={<Loading fullScreen label="Cargando..." />}>
        <Outlet />
      </Suspense>
    </Layout>
  )
}

export default LegacyTripLayout
```

- [ ] **Step 8: Rewire the routes and the legacy entry points**

Replace `src/App.tsx` with:

```tsx
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Loading from './components/common/Loading'
import LegacyTripLayout from './trips/components/LegacyTripLayout'
import LandingRedirect from './trips/pages/LandingRedirect'
import { VIETNAM_HOME_PATH } from './trips/registry'

function DailyPlanRedirect() {
  const { date } = useParams<{ date: string }>()
  return <Navigate to={`/schedule/${date}`} replace />
}

const Dashboard = lazy(() => import('./pages/Dashboard'))
const PreTravel = lazy(() => import('./pages/PreTravel'))
const Documents = lazy(() => import('./pages/Documents'))
const Schedule = lazy(() => import('./pages/Schedule'))
const DayDetail = lazy(() => import('./pages/DayDetail'))
const Places = lazy(() => import('./pages/Places'))
const PlaceDetail = lazy(() => import('./pages/PlaceDetail'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const RecommendationDetail = lazy(() => import('./pages/RecommendationDetail'))
const CountryInfo = lazy(() => import('./pages/CountryInfo'))
const DocumentDetail = lazy(() => import('./pages/DocumentDetail'))
const Accommodations = lazy(() => import('./pages/Accommodations'))
const MorePage = lazy(() => import('./pages/MorePage'))
const Coffee = lazy(() => import('./pages/Coffee'))
const Food = lazy(() => import('./pages/Food'))
const Diary = lazy(() => import('./pages/Diary'))
const DiaryDetail = lazy(() => import('./pages/DiaryDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))
const TripSwitcher = lazy(() => import('./trips/pages/TripSwitcher'))

const BASE_NAME = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <BrowserRouter basename={BASE_NAME}>
      <Suspense fallback={<Loading fullScreen label="Cargando..." />}>
        <Routes>
          <Route path="/" element={<LandingRedirect />} />
          <Route path="/trips" element={<TripSwitcher />} />

          {/* Legacy Vietnam trip: frozen pages, paths unchanged except its home. */}
          <Route element={<LegacyTripLayout tripId="vietnam-2026" />}>
            <Route path={VIETNAM_HOME_PATH} element={<Dashboard />} />
            <Route path="/pre-travel" element={<PreTravel />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/:date" element={<DayDetail />} />
            <Route path="/daily/:date" element={<DailyPlanRedirect />} />
            <Route path="/places" element={<Places />} />
            <Route path="/map" element={<Places />} />
            <Route path="/places/:id" element={<PlaceDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/recommendations/:id" element={<RecommendationDetail />} />
            <Route path="/countries/:id" element={<CountryInfo />} />
            <Route path="/accommodations" element={<Accommodations />} />
            <Route path="/settings" element={<Navigate to="/more" replace />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/coffee" element={<Coffee />} />
            <Route path="/food" element={<Food />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/diary/:date" element={<DiaryDetail />} />
          </Route>

          <Route
            path="/404"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
```

In `src/components/layout/BottomNav.tsx`:

- add `import { VIETNAM_HOME_PATH } from '../../trips/registry'` after the lucide import;
- change `{ to: '/', label: 'Inicio', icon: Home },` to `{ to: VIETNAM_HOME_PATH, label: 'Inicio', icon: Home },`;
- change `end={to === '/'}` to `end={to === VIETNAM_HOME_PATH}`.

In `src/pages/MorePage.tsx`:

- add `ArrowLeftRight,` to the lucide import list;
- insert this section right after the closing `</div>` of the page header block (before `<section aria-labelledby="pretravel-heading">`):

```tsx
<section aria-labelledby="trips-heading">
  <h2
    id="trips-heading"
    className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
  >
    Viajes
  </h2>
  <SectionLink
    to="/trips"
    icon={<ArrowLeftRight className="h-6 w-6" aria-hidden="true" />}
    title="Cambiar de viaje"
    description="Abre otro viaje o consulta el historial."
    onClick={() => navigate('/trips')}
  />
</section>
```

- [ ] **Step 9: Run all checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: tests green, lint clean, format clean, build `✓ built in`; `dist/404.html` exists (`ls dist/404.html`).

- [ ] **Step 10: Manual check**

Run: `npm run dev`, then in a browser:

1. `http://localhost:5173/travel-planner-pwa/trips` → "Mis viajes"; "Próximos y en curso" shows **Perú** ("Próximo", "17–28 oct 2026 · Perú"); "Historial" shows **Vietnam y Camboya** ("Terminado").
2. Click Vietnam → `/travel-planner-pwa/trips/vietnam-2026` shows the existing Vietnam dashboard with its header and bottom nav; "Inicio" is highlighted.
3. `…/schedule`, `…/map`, `…/diary`, `…/daily/2026-07-05` (redirects to `/schedule/2026-07-05`) and `…/settings` (redirects to `/more`) all work as before.
4. Más → "Cambiar de viaje" opens `/trips`.
5. `http://localhost:5173/travel-planner-pwa/` → redirects to `/trips/vietnam-2026` (last opened = Vietnam after step 2). In devtools run `localStorage.removeItem('travel-planner-last-trip')` and reload `/` → redirects to `/trips/peru-2026/today` (renders `/404` until T10; expected).
6. Toggle dark mode in Más → Ajustes, open `/trips`: dark palette applied.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json tailwind.config.js src/index.css vite.config.ts public/404.html index.html src/App.tsx src/components/layout/BottomNav.tsx src/pages/MorePage.tsx src/trips/domain/dates.ts src/trips/domain/dates.test.ts src/trips/spaRedirect.test.ts src/trips/components/TripScreen.tsx src/trips/components/TripCard.tsx src/trips/components/LegacyTripLayout.tsx src/trips/hooks/useRecordLastTrip.ts src/trips/pages/TripSwitcher.tsx src/trips/pages/LandingRedirect.tsx
git commit -m "feat(trips): add trip switcher, landing and per-trip URLs"
```

---

### Task T10: v2 trip shell and the "Hoy" screen

**Files:**

- Create: `src/trips/hooks/useTrip.ts`, `src/trips/hooks/useNow.ts`
- Create: `src/trips/components/buttonStyles.ts`, `TripLayout.tsx`, `TripNav.tsx`, `PageHeader.tsx`, `TripStatusMessage.tsx`, `NowCard.tsx`, `PlanList.tsx`, `StayCard.tsx`, `LegList.tsx` (all under `src/trips/components/`)
- Create: `src/trips/pages/TripShell.tsx`, `V2TripShell.tsx`, `TripHomeRedirect.tsx`, `TodayPage.tsx` (under `src/trips/pages/`)
- Modify: `src/App.tsx` (v2 routes)

**Interfaces:**

- Consumes: `resolveTripRoute` (T02), `useTripContent` (T06), `useTripDays` (T08), `useRecordLastTrip`, `TripScreen` (T09), `computeNow`, `resolveTodayView`, `formatBanner` (T03), `formatDayHeading` (T03), `directionsUrl`, `legUrl` (T04).
- Produces:
  - `interface TripOutletContext { trip: TripMeta }`, `useTrip(): TripMeta`.
  - `useNow(intervalMs?: number): Date`.
  - `tripButtonClass(variant: 'primary' | 'secondary' | 'ghost' | 'urgent', extra?: string): string`.
  - Components: `TripLayout({ tripName, children })`, `TripNav()`, `PageHeader({ title, subtitle })`, `TripStatusMessage({ message, actionLabel?, onAction? })`, `NowCard({ label, range, title, place, url })`, `PlanList({ items: PlanItem[]; emptyText?: string })`, `StayCard({ stay: Stay })`, `LegList({ legs: Leg[] })`.
  - Routes: `/trips/:tripId` (shell), index and `*` → `/trips/:tripId/today`, `today`.

- [ ] **Step 1: Hooks and shared UI pieces**

`src/trips/hooks/useTrip.ts`:

```ts
import { useOutletContext } from 'react-router-dom'
import type { TripMeta } from '../types'

export interface TripOutletContext {
  trip: TripMeta
}

/** The current v2 trip, provided by V2TripShell through the router outlet. */
export function useTrip(): TripMeta {
  return useOutletContext<TripOutletContext>().trip
}
```

`src/trips/hooks/useNow.ts`:

```ts
import { useEffect, useState } from 'react'

/** Current time, refreshed every minute so "Ahora" moves on its own. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
```

`src/trips/components/buttonStyles.ts`:

```ts
export type TripButtonVariant = 'primary' | 'secondary' | 'ghost' | 'urgent'

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] px-4 text-base font-semibold no-underline'

const VARIANTS: Record<TripButtonVariant, string> = {
  primary: 'min-h-[52px] bg-trip-action text-trip-action-ink hover:opacity-90',
  secondary: 'min-h-[44px] bg-trip-action-soft text-trip-action',
  ghost: 'min-h-[44px] border-[1.5px] border-trip-line bg-transparent text-trip-ink',
  urgent: 'min-h-[52px] bg-trip-urgent text-trip-urgent-ink',
}

export function tripButtonClass(variant: TripButtonVariant, extra = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim()
}
```

`src/trips/components/PageHeader.tsx`:

```tsx
interface PageHeaderProps {
  title: string
  subtitle: string
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-[32px] font-bold leading-tight tracking-tight">{title}</h1>
      <p className="text-[17px] font-medium text-trip-ink2">{subtitle}</p>
    </header>
  )
}

export default PageHeader
```

`src/trips/components/TripStatusMessage.tsx`:

```tsx
import { tripButtonClass } from './buttonStyles'

interface TripStatusMessageProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

function TripStatusMessage({ message, actionLabel, onAction }: TripStatusMessageProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-start gap-3 rounded-[20px] border border-trip-line bg-trip-card p-[18px]"
    >
      <p className="text-base text-trip-ink2">{message}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className={tripButtonClass('secondary')}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default TripStatusMessage
```

`src/trips/components/TripNav.tsx`:

```tsx
import { NavLink } from 'react-router-dom'
import { CalendarDays, LifeBuoy, ListChecks, ListOrdered } from 'lucide-react'

// Relative links: TripNav renders inside the /trips/:tripId route.
const ITEMS = [
  { to: 'today', label: 'Hoy', icon: CalendarDays },
  { to: 'itinerary', label: 'Itinerario', icon: ListOrdered },
  { to: 'checklist', label: 'Checklist', icon: ListChecks },
  { to: 'help', label: 'Ayuda', icon: LifeBuoy },
]

function TripNav() {
  return (
    <nav
      aria-label="Secciones del viaje"
      className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-trip-line bg-trip-card"
    >
      <ul className="mx-auto flex max-w-md px-2">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `relative flex min-h-[62px] flex-col items-center justify-center gap-1 text-sm no-underline ${
                  isActive
                    ? 'font-bold text-trip-ink before:absolute before:inset-x-[22%] before:top-0 before:h-[3px] before:rounded-b before:bg-trip-ink'
                    : 'font-medium text-trip-muted'
                }`
              }
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TripNav
```

`src/trips/components/TripLayout.tsx`:

```tsx
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
import TripScreen from './TripScreen'
import TripNav from './TripNav'

interface TripLayoutProps {
  tripName: string
  children: ReactNode
}

function TripLayout({ tripName, children }: TripLayoutProps) {
  return (
    <TripScreen>
      <header className="safe-top sticky top-0 z-20 border-b border-trip-line bg-trip-card">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-3 px-5">
          <p className="truncate text-base font-semibold">{tripName}</p>
          <Link
            to="/trips"
            aria-label="Cambiar de viaje"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-semibold text-trip-action no-underline hover:bg-trip-action-soft"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Viajes
          </Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-md px-5 pb-28 pt-5" tabIndex={-1}>
        {children}
      </main>
      <TripNav />
    </TripScreen>
  )
}

export default TripLayout
```

- [ ] **Step 2: Today components**

`src/trips/components/NowCard.tsx`:

```tsx
import { MapPin, Navigation } from 'lucide-react'
import { tripButtonClass } from './buttonStyles'

interface NowCardProps {
  label: string
  range: string
  title: string
  place: string
  url: string
}

function NowCard({ label, range, title, place, url }: NowCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-[22px] border-[1.5px] border-trip-ink bg-trip-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="rounded-lg bg-trip-ink px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider text-trip-bg">
          {label}
        </span>
        <span className="font-trip-mono text-lg font-semibold">{range}</span>
      </div>
      <h2 className="text-[25px] font-bold leading-tight">{title}</h2>
      <p className="flex items-center gap-2 text-lg font-medium text-trip-ink2">
        <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
        {place}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={tripButtonClass('primary', 'mt-1 w-full')}
      >
        <Navigation className="h-5 w-5" aria-hidden="true" />
        Cómo llegar
      </a>
    </section>
  )
}

export default NowCard
```

`src/trips/components/PlanList.tsx`:

```tsx
import { Navigation } from 'lucide-react'
import type { PlanItem } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import { tripButtonClass } from './buttonStyles'

interface PlanListProps {
  items: PlanItem[]
  emptyText?: string
}

function PlanList({ items, emptyText }: PlanListProps) {
  if (items.length === 0) {
    return emptyText ? <p className="text-base text-trip-muted">{emptyText}</p> : null
  }
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {items.map((item) => (
        <li
          key={`${item.t}-${item.title}`}
          className="flex gap-3.5 border-t border-trip-line py-4 first:border-t-0"
        >
          <span className="w-[58px] shrink-0 pt-px font-trip-mono text-lg font-semibold">
            {item.t}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-lg font-semibold leading-snug">{item.title}</p>
            <p className="text-base text-trip-muted">{item.place}</p>
            <a
              href={directionsUrl(item.q)}
              target="_blank"
              rel="noopener noreferrer"
              className={tripButtonClass('secondary', 'mt-2 self-start')}
            >
              <Navigation className="h-[18px] w-[18px]" aria-hidden="true" />
              Cómo llegar
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default PlanList
```

`src/trips/components/StayCard.tsx`:

```tsx
import { BedDouble, Navigation, Phone } from 'lucide-react'
import type { Stay } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import { tripButtonClass } from './buttonStyles'

function StayCard({ stay }: { stay: Stay }) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-trip-line bg-trip-card p-[18px]">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-trip-soft">
          <BedDouble className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-lg font-semibold">{stay.name}</p>
          <p className="text-base text-trip-muted">{stay.meta}</p>
        </div>
      </div>
      <a
        href={directionsUrl(stay.q)}
        target="_blank"
        rel="noopener noreferrer"
        className={tripButtonClass('primary', 'w-full')}
      >
        <Navigation className="h-5 w-5" aria-hidden="true" />
        Cómo llegar al alojamiento
      </a>
      {stay.phone && (
        <a href={`tel:${stay.phone}`} className={tripButtonClass('ghost', 'w-full')}>
          <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
          Llamar
        </a>
      )}
    </div>
  )
}

export default StayCard
```

`src/trips/components/LegList.tsx`:

```tsx
import {
  Bus,
  CableCar,
  Car,
  Footprints,
  Plane,
  Ship,
  TrainFront,
  type LucideIcon,
} from 'lucide-react'
import type { Leg, LegMode } from '../types'
import { legUrl } from '../domain/mapsUrl'
import { tripButtonClass } from './buttonStyles'

const MODE_ICON: Record<LegMode, LucideIcon> = {
  car: Car,
  cable: CableCar,
  walk: Footprints,
  plane: Plane,
  bus: Bus,
  train: TrainFront,
  boat: Ship,
}

function LegList({ legs }: { legs: Leg[] }) {
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {legs.map((leg) => {
        const Icon = MODE_ICON[leg.mode]
        return (
          <li
            key={leg.title}
            className="flex items-center gap-3.5 border-t border-trip-line py-3.5 first:border-t-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trip-soft">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[17px] font-semibold">{leg.title}</p>
              <p className="text-[15px] text-trip-muted">{leg.meta}</p>
            </div>
            <a
              href={legUrl(leg)}
              target="_blank"
              rel="noopener noreferrer"
              className={tripButtonClass('secondary', 'px-3')}
            >
              Ver ruta
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default LegList
```

- [ ] **Step 3: Shell and Today page**

`src/trips/pages/TripHomeRedirect.tsx`:

```tsx
import { Navigate, useParams } from 'react-router-dom'

/** Index and unknown sub-routes of a v2 trip go to its "Hoy" screen (absolute, no loops). */
function TripHomeRedirect() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  return <Navigate to={`/trips/${tripId}/today`} replace />
}

export default TripHomeRedirect
```

`src/trips/pages/V2TripShell.tsx`:

```tsx
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import type { TripMeta } from '../types'
import type { TripOutletContext } from '../hooks/useTrip'
import { useTripContent } from '../hooks/useTripContent'
import { useRecordLastTrip } from '../hooks/useRecordLastTrip'
import TripLayout from '../components/TripLayout'
import TripStatusMessage from '../components/TripStatusMessage'

function V2TripShell({ trip }: { trip: TripMeta }) {
  useRecordLastTrip(trip.id)
  const { ready, error, retry } = useTripContent(trip.id)
  const context: TripOutletContext = { trip }

  return (
    <TripLayout tripName={trip.name}>
      {error ? (
        <TripStatusMessage
          message="No se pudieron cargar los datos del viaje."
          actionLabel="Reintentar"
          onAction={retry}
        />
      ) : !ready ? (
        <TripStatusMessage message="Cargando el viaje…" />
      ) : (
        <Suspense fallback={<TripStatusMessage message="Cargando…" />}>
          <Outlet context={context} />
        </Suspense>
      )}
    </TripLayout>
  )
}

export default V2TripShell
```

`src/trips/pages/TripShell.tsx`:

```tsx
import { Navigate, useParams } from 'react-router-dom'
import { TRIPS } from '../registry'
import { resolveTripRoute } from '../domain/landing'
import V2TripShell from './V2TripShell'

/** `/trips/:tripId/*`: unknown ids → switcher, legacy ids → their legacy home. */
function TripShell() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  const route = resolveTripRoute(TRIPS, tripId)
  if (route.kind === 'redirect') return <Navigate to={route.to} replace />
  return <V2TripShell key={route.trip.id} trip={route.trip} />
}

export default TripShell
```

`src/trips/pages/TodayPage.tsx`:

```tsx
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useTrip } from '../hooks/useTrip'
import { useTripDays } from '../hooks/useTripDays'
import { useNow } from '../hooks/useNow'
import { computeNow, formatBanner, resolveTodayView } from '../domain/today'
import { formatDayHeading } from '../domain/dates'
import { directionsUrl } from '../domain/mapsUrl'
import PageHeader from '../components/PageHeader'
import NowCard from '../components/NowCard'
import PlanList from '../components/PlanList'
import StayCard from '../components/StayCard'
import LegList from '../components/LegList'
import TripStatusMessage from '../components/TripStatusMessage'
import { tripButtonClass } from '../components/buttonStyles'

function TodayPage() {
  const trip = useTrip()
  const { days, loading } = useTripDays(trip.id)
  const now = useNow()
  const view = useMemo(
    () =>
      resolveTodayView(
        days.map((d) => d.date),
        now
      ),
    [days, now]
  )

  if (loading) return <TripStatusMessage message="Cargando el viaje…" />
  const day = days[view.dayIndex]
  if (!day) return <TripStatusMessage message="Este viaje todavía no tiene días planificados." />

  const banner = formatBanner(view.banner)
  const current = view.nowMinutes === null ? null : computeNow(day.plan, view.nowMinutes)

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Hoy" subtitle={formatDayHeading(view.dayIndex, days.length, day.date)} />
      <p className="-mt-2 flex items-center gap-2 text-[15px] text-trip-muted">
        <Check className="h-[17px] w-[17px]" aria-hidden="true" />
        Itinerario guardado · funciona sin conexión
      </p>

      {banner && (
        <p
          role="status"
          className="rounded-2xl bg-trip-action-soft px-4 py-3 text-base font-semibold text-trip-action"
        >
          {banner}
        </p>
      )}

      {current?.item ? (
        <>
          <NowCard
            label={current.label}
            range={current.item.range}
            title={current.item.title}
            place={current.item.place}
            url={directionsUrl(current.item.q)}
          />
          <section className="flex flex-col gap-2.5">
            <h2 className="text-xl font-bold">Resto del día</h2>
            <PlanList items={current.rest} emptyText="No hay más actividades hoy." />
            <Link
              to={`/trips/${trip.id}/itinerary/${day.date}?tab=eat`}
              className={tripButtonClass('ghost', 'self-start')}
            >
              Ver dónde comer y qué visitar hoy
            </Link>
          </section>
        </>
      ) : (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">Plan del día</h2>
          <PlanList items={day.plan} emptyText="No hay actividades planificadas." />
        </section>
      )}

      {day.stay && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">Esta noche duermes en</h2>
          <StayCard stay={day.stay} />
        </section>
      )}

      {day.legs.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">Transporte de hoy</h2>
          <LegList legs={day.legs} />
        </section>
      )}
    </div>
  )
}

export default TodayPage
```

In `src/App.tsx`, add the lazy imports after `TripSwitcher`:

```tsx
const TripShell = lazy(() => import('./trips/pages/TripShell'))
const TripHomeRedirect = lazy(() => import('./trips/pages/TripHomeRedirect'))
const TodayPage = lazy(() => import('./trips/pages/TodayPage'))
```

and the route block right after `<Route path="/trips" element={<TripSwitcher />} />`:

```tsx
{
  /* v2 trips (new engine). /trips/vietnam-2026 is matched by the static legacy route. */
}
;<Route path="/trips/:tripId" element={<TripShell />}>
  <Route index element={<TripHomeRedirect />} />
  <Route path="today" element={<TodayPage />} />
  <Route path="*" element={<TripHomeRedirect />} />
</Route>
```

- [ ] **Step 4: Run all checks**

Run: `npx prettier --write src/trips src/App.tsx && npm test && npm run lint && npm run format:check && npm run build`
Expected: all green, `✓ built in`.

- [ ] **Step 5: Manual check**

Run: `npm run dev`:

1. `http://localhost:5173/travel-planner-pwa/trips/peru-2026` → redirects to `/trips/peru-2026/today`. Header "Perú" + "Viajes"; bottom nav Hoy / Itinerario / Checklist / Ayuda with "Hoy" active.
2. Before 17 Oct: subtitle "Día 1 de 12 · sáb 17 oct", banner "Faltan N días", "Plan del día" with the 2 day-1 items, "Esta noche duermes en" → "Hotel en Lima", "Transporte de hoy" with plane and car.
3. In devtools Sensors, set the time zone to `America/Lima` and override the date to 2026-10-24 10:15 (or temporarily call `resolveTodayView` with a fixed date): "Ahora" card "Koricancha · 10:00 – 11:30", rest of the day below.
4. `…/trips/peru-2026/whatever` → `/today`; `…/trips/vietnam-2026/today` → Vietnam dashboard; `…/trips/japon-2025` → `/trips`.
5. Click "Viajes" → switcher. Reload `/` → lands on Perú (last opened).
6. Dark mode (set in Vietnam Más → Ajustes) → dark palette on Perú.
7. Devtools → Application → IndexedDB: `TripsDB` exists with `days` (12 rows), `checklistItems` (13), `contentState` `{ tripId: 'peru-2026', seedVersion: 1 }`; `TravelPlannerDB` unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/trips/hooks/useTrip.ts src/trips/hooks/useNow.ts src/trips/components/buttonStyles.ts src/trips/components/TripLayout.tsx src/trips/components/TripNav.tsx src/trips/components/PageHeader.tsx src/trips/components/TripStatusMessage.tsx src/trips/components/NowCard.tsx src/trips/components/PlanList.tsx src/trips/components/StayCard.tsx src/trips/components/LegList.tsx src/trips/pages/TripShell.tsx src/trips/pages/V2TripShell.tsx src/trips/pages/TripHomeRedirect.tsx src/trips/pages/TodayPage.tsx
git commit -m "feat(trips): add v2 trip shell and today screen"
```

---

### Task T11: "Itinerario" screen

**Files:**

- Create: `src/trips/domain/itinerary.ts`, test `src/trips/domain/itinerary.test.ts`
- Create: `src/trips/components/DayStrip.tsx`, `TabBar.tsx`, `StayRow.tsx`, `EatList.tsx`, `SeeList.tsx`
- Create: `src/trips/pages/ItineraryPage.tsx`
- Modify: `src/App.tsx` (routes)

**Interfaces:**

- Consumes: `weekdayShort`, `formatDayLabel`, `formatDayHeading`, `toLocalIsoDate` (T01/T03), `resolveTodayView` (T03), `directionsUrl` (T04), `useTrip`, `useNow`, `PlanList`, `LegList`, `PageHeader`, `TripStatusMessage`, `tripButtonClass` (T10), `useTripDays` (T08).
- Produces: `type ItineraryTab = 'plan' | 'eat' | 'see'`, `ITINERARY_TABS`, `parseItineraryTab(value: string | null): ItineraryTab`, `interface DayStripItem { date; weekday; dayOfMonth; isToday; isSelected; ariaLabel }`, `buildDayStrip(dates, selectedDate, today): DayStripItem[]`, `resolveSelectedDate(dates, requested: string | undefined, fallbackIndex: number): string | null`.

- [ ] **Step 1: Write the failing test**

`src/trips/domain/itinerary.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildDayStrip, parseItineraryTab, resolveSelectedDate } from './itinerary'

describe('parseItineraryTab', () => {
  it('accepts the known tabs and defaults to plan', () => {
    expect(parseItineraryTab('eat')).toBe('eat')
    expect(parseItineraryTab('see')).toBe('see')
    expect(parseItineraryTab('plan')).toBe('plan')
    expect(parseItineraryTab(null)).toBe('plan')
    expect(parseItineraryTab('comer')).toBe('plan')
  })
})

describe('buildDayStrip', () => {
  it('builds labelled pills, marking today and the selected day', () => {
    const strip = buildDayStrip(['2026-10-17', '2026-10-18'], '2026-10-18', '2026-10-17')
    expect(strip).toEqual([
      {
        date: '2026-10-17',
        weekday: 'sáb',
        dayOfMonth: '17',
        isToday: true,
        isSelected: false,
        ariaLabel: 'Día 1, sáb 17 oct, hoy',
      },
      {
        date: '2026-10-18',
        weekday: 'dom',
        dayOfMonth: '18',
        isToday: false,
        isSelected: true,
        ariaLabel: 'Día 2, dom 18 oct',
      },
    ])
  })

  it('drops the leading zero of the day of month', () => {
    expect(buildDayStrip(['2026-11-03'], '2026-11-03', '2026-10-10')[0].dayOfMonth).toBe('3')
  })
})

describe('resolveSelectedDate', () => {
  const dates = ['2026-10-17', '2026-10-18', '2026-10-19']

  it('uses a requested date that exists', () => {
    expect(resolveSelectedDate(dates, '2026-10-18', 0)).toBe('2026-10-18')
  })

  it('returns null for a requested date outside the trip', () => {
    expect(resolveSelectedDate(dates, '2026-12-01', 0)).toBeNull()
  })

  it('falls back to the today index, clamped to the trip', () => {
    expect(resolveSelectedDate(dates, undefined, 2)).toBe('2026-10-19')
    expect(resolveSelectedDate(dates, undefined, -1)).toBe('2026-10-17')
    expect(resolveSelectedDate(dates, undefined, 9)).toBe('2026-10-19')
  })

  it('returns null for a trip without days', () => {
    expect(resolveSelectedDate([], undefined, 0)).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/trips/domain/itinerary.test.ts`
Expected: FAIL — `Failed to resolve import "./itinerary"`.

- [ ] **Step 3: Write the domain implementation**

`src/trips/domain/itinerary.ts`:

```ts
import { formatDayLabel, weekdayShort } from './dates'

export type ItineraryTab = 'plan' | 'eat' | 'see'

export const ITINERARY_TABS: { id: ItineraryTab; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'eat', label: 'Comer' },
  { id: 'see', label: 'Visitar' },
]

export function parseItineraryTab(value: string | null): ItineraryTab {
  return value === 'eat' || value === 'see' ? value : 'plan'
}

export interface DayStripItem {
  date: string
  weekday: string
  dayOfMonth: string
  isToday: boolean
  isSelected: boolean
  ariaLabel: string
}

export function buildDayStrip(
  dates: string[],
  selectedDate: string,
  today: string
): DayStripItem[] {
  return dates.map((date, i) => ({
    date,
    weekday: weekdayShort(date),
    dayOfMonth: String(Number(date.slice(8))),
    isToday: date === today,
    isSelected: date === selectedDate,
    ariaLabel: `Día ${i + 1}, ${formatDayLabel(date)}${date === today ? ', hoy' : ''}`,
  }))
}

/** The requested date if it belongs to the trip; null if it does not (caller redirects). */
export function resolveSelectedDate(
  dates: string[],
  requested: string | undefined,
  fallbackIndex: number
): string | null {
  if (dates.length === 0) return null
  if (requested !== undefined) return dates.includes(requested) ? requested : null
  return dates[Math.min(Math.max(fallbackIndex, 0), dates.length - 1)]
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx prettier --write src/trips/domain/itinerary.test.ts && npm test`
Expected: PASS — all files green.

- [ ] **Step 5: Write the components and the page**

`src/trips/components/DayStrip.tsx`:

```tsx
import type { DayStripItem } from '../domain/itinerary'

interface DayStripProps {
  items: DayStripItem[]
  onSelect: (date: string) => void
}

function DayStrip({ items, onSelect }: DayStripProps) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 py-0.5 [scrollbar-width:none]">
      {items.map((item) => (
        <button
          key={item.date}
          type="button"
          onClick={() => onSelect(item.date)}
          aria-label={item.ariaLabel}
          aria-current={item.isSelected ? 'date' : undefined}
          className={`flex h-[72px] w-[58px] shrink-0 flex-col items-center justify-center gap-px rounded-2xl border-[1.5px] ${
            item.isSelected
              ? 'border-trip-ink bg-trip-ink text-trip-bg'
              : 'border-trip-line bg-trip-card text-trip-ink'
          }`}
        >
          <span className={`text-sm ${item.isSelected ? 'text-trip-bg' : 'text-trip-muted'}`}>
            {item.weekday}
          </span>
          <span className="text-[21px] font-semibold">{item.dayOfMonth}</span>
          {item.isToday && (
            <span
              className={`text-xs font-bold ${item.isSelected ? 'text-trip-bg' : 'text-trip-action'}`}
            >
              Hoy
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default DayStrip
```

`src/trips/components/TabBar.tsx`:

```tsx
import type { ItineraryTab } from '../domain/itinerary'

interface TabBarProps {
  tabs: { id: ItineraryTab; label: string }[]
  active: ItineraryTab
  onChange: (tab: ItineraryTab) => void
}

function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Contenido del día"
      className="flex gap-1 rounded-2xl bg-trip-soft p-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={`min-h-[44px] flex-1 rounded-xl text-base ${
            tab.id === active
              ? 'bg-trip-card font-semibold text-trip-ink shadow-sm'
              : 'font-medium text-trip-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabBar
```

`src/trips/components/StayRow.tsx`:

```tsx
import { BedDouble } from 'lucide-react'
import type { Stay } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import { tripButtonClass } from './buttonStyles'

function StayRow({ stay }: { stay: Stay | null }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] border border-trip-line bg-trip-card p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-trip-soft">
        <BedDouble className="h-[22px] w-[22px]" aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[17px] font-semibold">{stay?.name ?? 'Sin alojamiento'}</p>
        <p className="text-[15px] text-trip-muted">
          {stay?.meta ?? 'Noche a bordo o vuelta a casa'}
        </p>
      </div>
      {stay && (
        <a
          href={directionsUrl(stay.q)}
          target="_blank"
          rel="noopener noreferrer"
          className={tripButtonClass('secondary', 'px-3')}
        >
          Cómo llegar
        </a>
      )}
    </div>
  )
}

export default StayRow
```

`src/trips/components/EatList.tsx`:

```tsx
import { Navigation } from 'lucide-react'
import type { EatItem } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import { tripButtonClass } from './buttonStyles'

function EatList({ items }: { items: EatItem[] }) {
  if (items.length === 0) {
    return <p className="text-base text-trip-muted">No hay comidas previstas para este día.</p>
  }
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {items.map((item) => (
        <li
          key={`${item.when}-${item.name}`}
          className="flex flex-col gap-1 border-t border-trip-line py-4 first:border-t-0"
        >
          <p className="text-sm font-bold uppercase tracking-wider text-trip-muted">{item.when}</p>
          <p className="text-lg font-semibold">{item.name}</p>
          <p className="text-base text-trip-muted">{item.kind}</p>
          <p className="text-base leading-snug text-trip-ink2">{item.tip}</p>
          <a
            href={directionsUrl(item.q)}
            target="_blank"
            rel="noopener noreferrer"
            className={tripButtonClass('secondary', 'mt-2 self-start')}
          >
            <Navigation className="h-[18px] w-[18px]" aria-hidden="true" />
            Cómo llegar
          </a>
        </li>
      ))}
    </ul>
  )
}

export default EatList
```

`src/trips/components/SeeList.tsx`:

```tsx
import { Navigation } from 'lucide-react'
import type { SeeItem } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import { tripButtonClass } from './buttonStyles'

function SeeList({ items }: { items: SeeItem[] }) {
  if (items.length === 0) {
    return <p className="text-base text-trip-muted">No hay visitas previstas para este día.</p>
  }
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {items.map((item) => (
        <li
          key={item.name}
          className="flex flex-col gap-1 border-t border-trip-line py-4 first:border-t-0"
        >
          <p className="text-sm font-bold uppercase tracking-wider text-trip-muted">{item.dur}</p>
          <p className="text-lg font-semibold">{item.name}</p>
          <p className="text-base leading-snug text-trip-ink2">{item.desc}</p>
          <a
            href={directionsUrl(item.q)}
            target="_blank"
            rel="noopener noreferrer"
            className={tripButtonClass('secondary', 'mt-2 self-start')}
          >
            <Navigation className="h-[18px] w-[18px]" aria-hidden="true" />
            Cómo llegar
          </a>
        </li>
      ))}
    </ul>
  )
}

export default SeeList
```

`src/trips/pages/ItineraryPage.tsx`:

```tsx
import { useMemo } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTrip } from '../hooks/useTrip'
import { useTripDays } from '../hooks/useTripDays'
import { useNow } from '../hooks/useNow'
import { resolveTodayView } from '../domain/today'
import { formatDayHeading, toLocalIsoDate } from '../domain/dates'
import {
  buildDayStrip,
  ITINERARY_TABS,
  parseItineraryTab,
  resolveSelectedDate,
} from '../domain/itinerary'
import PageHeader from '../components/PageHeader'
import DayStrip from '../components/DayStrip'
import StayRow from '../components/StayRow'
import TabBar from '../components/TabBar'
import PlanList from '../components/PlanList'
import EatList from '../components/EatList'
import SeeList from '../components/SeeList'
import LegList from '../components/LegList'
import TripStatusMessage from '../components/TripStatusMessage'

function ItineraryPage() {
  const trip = useTrip()
  const { date: requestedDate } = useParams<{ date?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { days, loading } = useTripDays(trip.id)
  const now = useNow()
  const dates = useMemo(() => days.map((d) => d.date), [days])
  const todayView = useMemo(() => resolveTodayView(dates, now), [dates, now])
  const tab = parseItineraryTab(searchParams.get('tab'))

  if (loading) return <TripStatusMessage message="Cargando el viaje…" />
  if (days.length === 0) {
    return <TripStatusMessage message="Este viaje todavía no tiene días planificados." />
  }

  const base = `/trips/${trip.id}/itinerary`
  const selectedDate = resolveSelectedDate(dates, requestedDate, todayView.dayIndex)
  if (selectedDate === null) return <Navigate to={base} replace />

  const index = dates.indexOf(selectedDate)
  const day = days[index]
  const todayIndex = Math.max(todayView.dayIndex, 0)

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Itinerario"
        subtitle={formatDayHeading(todayIndex, days.length, dates[todayIndex])}
      />
      <DayStrip
        items={buildDayStrip(dates, selectedDate, toLocalIsoDate(now))}
        onSelect={(date) => navigate(`${base}/${date}?tab=${tab}`)}
      />

      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-trip-muted">
          {formatDayHeading(index, days.length, day.date)}
        </p>
        <h2 className="text-2xl font-bold leading-tight">{day.title}</h2>
        <p className="text-base text-trip-ink2">{day.cities.join(' → ')}</p>
      </div>

      <StayRow stay={day.stay} />

      <TabBar
        tabs={ITINERARY_TABS}
        active={tab}
        onChange={(next) => setSearchParams({ tab: next }, { replace: true })}
      />
      {tab === 'plan' && <PlanList items={day.plan} emptyText="No hay actividades planificadas." />}
      {tab === 'eat' && <EatList items={day.eat} />}
      {tab === 'see' && <SeeList items={day.see} />}

      {day.legs.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">Transporte</h2>
          <LegList legs={day.legs} />
        </section>
      )}
    </div>
  )
}

export default ItineraryPage
```

In `src/App.tsx` add `const ItineraryPage = lazy(() => import('./trips/pages/ItineraryPage'))` and, inside the `/trips/:tripId` route after `today`:

```tsx
            <Route path="itinerary" element={<ItineraryPage />} />
            <Route path="itinerary/:date" element={<ItineraryPage />} />
```

- [ ] **Step 6: Run all checks**

Run: `npx prettier --write src/trips src/App.tsx && npm test && npm run lint && npm run format:check && npm run build`
Expected: all green.

- [ ] **Step 7: Manual check**

`npm run dev`:

1. `…/trips/peru-2026/itinerary` → 12 day pills (sáb 17 … mié 28), day 1 selected before the trip; "Día 1 de 12 · sáb 17 oct", "Madrid → Lima".
2. Tap "24" → URL `/itinerary/2026-10-24?tab=plan`, title "Cusco", 6 plan items.
3. Tap "Comer" → `?tab=eat`, 2 items; "Visitar" → 4 items. Reload keeps the tab.
4. Day 27: stay row "Sin alojamiento · Noche a bordo o vuelta a casa", 2 flights under "Transporte".
5. `…/itinerary/2026-12-01` → redirects to `…/itinerary`.
6. From Hoy, "Ver dónde comer y qué visitar hoy" opens the itinerary on that day with "Comer" active.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/trips/domain/itinerary.ts src/trips/domain/itinerary.test.ts src/trips/components/DayStrip.tsx src/trips/components/TabBar.tsx src/trips/components/StayRow.tsx src/trips/components/EatList.tsx src/trips/components/SeeList.tsx src/trips/pages/ItineraryPage.tsx
git commit -m "feat(trips): add itinerary screen"
```

---

### Task T12: "Checklist" screen with notes

**Files:**

- Create: `src/trips/components/ChecklistGroup.tsx`, `src/trips/components/NotesEditor.tsx`, `src/trips/pages/ChecklistPage.tsx`
- Modify: `src/App.tsx` (route)

**Interfaces:**

- Consumes: `summarizeChecklist`, `ChecklistGroupView` (T08), `useChecklist`, `useNotes` (T08), `useTrip`, `PageHeader`, `TripStatusMessage`, `tripButtonClass` (T10).
- Produces: `ChecklistGroup({ group, onToggle })`, `NotesEditor({ initialText, onSave })`, route `checklist`.

- [ ] **Step 1: Write the components and the page**

`src/trips/components/ChecklistGroup.tsx`:

```tsx
import { Check, Lock, Users } from 'lucide-react'
import type { ChecklistGroupView } from '../domain/checklist'

interface ChecklistGroupProps {
  group: ChecklistGroupView
  onToggle: (id: string) => void
}

function ChecklistGroup({ group, onToggle }: ChecklistGroupProps) {
  const headingId = `checklist-${group.group}`
  const Icon = group.group === 'shared' ? Users : Lock
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <h2 id={headingId} className="text-xl font-bold">
          {group.title}
        </h2>
        <p className="flex items-center gap-1.5 text-[15px] text-trip-muted">
          <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
          {group.done} de {group.total}
        </p>
      </div>
      <ul className="overflow-hidden rounded-[20px] border border-trip-line bg-trip-card">
        {group.items.map((item) => (
          <li key={item.id} className="border-t border-trip-line first:border-t-0">
            <button
              type="button"
              aria-pressed={item.done}
              onClick={() => onToggle(item.id)}
              className="flex min-h-[60px] w-full items-center gap-3.5 px-4 py-2 text-left"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${
                  item.done
                    ? 'border-trip-done bg-trip-done text-trip-done-ink'
                    : 'border-trip-muted'
                }`}
              >
                {item.done && (
                  <Check className="h-[18px] w-[18px]" strokeWidth={3} aria-hidden="true" />
                )}
              </span>
              <span
                className={`flex-1 text-[17px] leading-snug ${item.done ? 'text-trip-muted line-through' : ''}`}
              >
                {item.label}
              </span>
              {item.done && <span className="text-[15px] font-bold text-trip-done">Hecho</span>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ChecklistGroup
```

`src/trips/components/NotesEditor.tsx`:

```tsx
import { useState } from 'react'
import { Lock } from 'lucide-react'

interface NotesEditorProps {
  initialText: string
  onSave: (text: string) => Promise<void>
}

/** Saves on blur. Mount it once the notes have loaded (initial state comes from props). */
function NotesEditor({ initialText, onSave }: NotesEditorProps) {
  const [text, setText] = useState(initialText)
  const [saved, setSaved] = useState(initialText)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const handleBlur = () => {
    if (text === saved) return
    onSave(text)
      .then(() => {
        setSaved(text)
        setStatus('saved')
      })
      .catch(() => setStatus('error'))
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="trip-notes" className="text-xl font-bold">
        Mis notas
      </label>
      <p className="-mt-1 flex items-center gap-1.5 text-[15px] text-trip-muted">
        <Lock className="h-[17px] w-[17px]" aria-hidden="true" />
        Solo las ves tú
      </p>
      <textarea
        id="trip-notes"
        rows={4}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={handleBlur}
        placeholder="Escribe aquí lo que no quieras olvidar"
        className="resize-y rounded-2xl border-[1.5px] border-trip-line bg-trip-card p-3.5 text-base text-trip-ink"
      />
      <p aria-live="polite" className="text-sm text-trip-muted">
        {status === 'saved' && 'Notas guardadas en este dispositivo.'}
        {status === 'error' && 'No se pudieron guardar las notas. Inténtalo de nuevo.'}
      </p>
    </div>
  )
}

export default NotesEditor
```

`src/trips/pages/ChecklistPage.tsx`:

```tsx
import { useMemo } from 'react'
import { useTrip } from '../hooks/useTrip'
import { useChecklist } from '../hooks/useChecklist'
import { useNotes } from '../hooks/useNotes'
import { summarizeChecklist } from '../domain/checklist'
import PageHeader from '../components/PageHeader'
import ChecklistGroup from '../components/ChecklistGroup'
import NotesEditor from '../components/NotesEditor'
import TripStatusMessage from '../components/TripStatusMessage'

function ChecklistPage() {
  const trip = useTrip()
  const { items, loading, error, toggle } = useChecklist(trip.id)
  const notes = useNotes(trip.id)
  const summary = useMemo(() => summarizeChecklist(items), [items])

  if (loading) return <TripStatusMessage message="Cargando el viaje…" />

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Checklist" subtitle={trip.name} />

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

      {error && (
        <p role="alert" className="text-base font-semibold text-trip-urgent">
          No se pudo guardar el cambio. Inténtalo de nuevo.
        </p>
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

      {!notes.loading && <NotesEditor key={trip.id} initialText={notes.text} onSave={notes.save} />}
    </div>
  )
}

export default ChecklistPage
```

In `src/App.tsx` add `const ChecklistPage = lazy(() => import('./trips/pages/ChecklistPage'))` and inside `/trips/:tripId`:

```tsx
<Route path="checklist" element={<ChecklistPage />} />
```

- [ ] **Step 2: Run all checks**

Run: `npx prettier --write src/trips src/App.tsx && npm test && npm run lint && npm run format:check && npm run build`
Expected: all green.

- [ ] **Step 3: Manual check**

`npm run dev` → `…/trips/peru-2026/checklist`:

1. "0 de 13 hechas", empty bar; "Del grupo · 0 de 7", "Personal · 0 de 6". No "Lo ve todo el grupo" text anywhere.
2. Tap an item → green box, strike-through, "Hecho", counter "1 de 13" and the bar grow; reload keeps it.
3. Type in "Mis notas", tab out → "Notas guardadas en este dispositivo."; reload keeps the text.
4. Screen reader / keyboard: items are buttons with `aria-pressed`; Tab reaches each one.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/trips/components/ChecklistGroup.tsx src/trips/components/NotesEditor.tsx src/trips/pages/ChecklistPage.tsx
git commit -m "feat(trips): add checklist screen with notes"
```

---

### Task T13: "Ayuda" screen with private import

**Files:**

- Create: `src/trips/components/EmergencyCard.tsx`, `HelpCard.tsx`, `ContactList.tsx`, `DocList.tsx`, `src/trips/pages/HelpPage.tsx`
- Modify: `src/App.tsx` (route)
- Local only (never committed): `private/peru-2026-private.json`

**Interfaces:**

- Consumes: `useHelpInfo` (T08), `directionsUrl` (T04), `useTrip`, `PageHeader`, `TripStatusMessage`, `tripButtonClass` (T10), types (T01).
- Produces: `EmergencyCard({ emergency })`, `HelpCard({ card })`, `ContactList({ contacts })`, `DocList({ docs })`, route `help`.

- [ ] **Step 1: Write the components and the page**

`src/trips/components/EmergencyCard.tsx`:

```tsx
import { Phone } from 'lucide-react'
import type { EmergencyInfo } from '../types'
import { tripButtonClass } from './buttonStyles'

function EmergencyCard({ emergency }: { emergency: EmergencyInfo }) {
  return (
    <section className="flex flex-col gap-3 rounded-[22px] border-[1.5px] border-trip-urgent bg-trip-urgent-soft p-[18px]">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-bold uppercase tracking-wider text-trip-urgent">Urgencias</p>
        <h2 className="text-xl font-bold">
          {emergency.label} · {emergency.number}
        </h2>
        <p className="text-base text-trip-ink2">{emergency.description}</p>
      </div>
      <a href={`tel:${emergency.number}`} className={tripButtonClass('urgent', 'w-full')}>
        <Phone className="h-5 w-5" aria-hidden="true" />
        Llamar al {emergency.number}
      </a>
    </section>
  )
}

export default EmergencyCard
```

`src/trips/components/HelpCard.tsx`:

```tsx
import { Phone } from 'lucide-react'
import type { HelpCardInfo } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import { tripButtonClass } from './buttonStyles'

function HelpCard({ card }: { card: HelpCardInfo }) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-trip-line bg-trip-card p-[18px]">
      <div className="flex flex-col gap-0.5">
        <p className="text-lg font-bold">{card.title}</p>
        <p className="text-base text-trip-muted">{card.sub}</p>
      </div>
      <a href={`tel:${card.phone}`} className={tripButtonClass('primary', 'w-full')}>
        <Phone className="h-5 w-5" aria-hidden="true" />
        {card.cta}
      </a>
      {card.mapQuery && (
        <a
          href={directionsUrl(card.mapQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className={tripButtonClass('ghost', 'w-full')}
        >
          Cómo llegar
        </a>
      )}
    </div>
  )
}

export default HelpCard
```

`src/trips/components/ContactList.tsx`:

```tsx
import type { Contact } from '../types'
import { tripButtonClass } from './buttonStyles'

function ContactList({ contacts }: { contacts: Contact[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-xl font-bold">Contactos del grupo</h2>
      <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
        {contacts.map((contact) => (
          <li
            key={`${contact.name}-${contact.role}`}
            className="flex items-center gap-3.5 border-t border-trip-line py-3.5 first:border-t-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[17px] font-semibold">{contact.name}</p>
              <p className="text-[15px] text-trip-muted">{contact.role}</p>
            </div>
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className={tripButtonClass('secondary', 'px-3.5')}>
                Llamar
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ContactList
```

`src/trips/components/DocList.tsx`:

```tsx
import type { DocInfo } from '../types'

function DocList({ docs }: { docs: DocInfo[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-xl font-bold">Documentos</h2>
      <p className="-mt-1 text-[15px] text-trip-muted">
        Dónde están y a quién llamar si se pierden.
      </p>
      <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
        {docs.map((doc) => (
          <li
            key={doc.name}
            className="flex flex-col gap-0.5 border-t border-trip-line py-3.5 first:border-t-0"
          >
            <p className="text-[17px] font-semibold">{doc.name}</p>
            <p className="text-base text-trip-ink2">Dónde: {doc.where}</p>
            <p className="text-[15px] text-trip-muted">Si se pierde: {doc.who}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default DocList
```

`src/trips/pages/HelpPage.tsx`:

```tsx
import { useRef, useState, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { useTrip } from '../hooks/useTrip'
import { useHelpInfo } from '../hooks/useHelpInfo'
import PageHeader from '../components/PageHeader'
import EmergencyCard from '../components/EmergencyCard'
import HelpCard from '../components/HelpCard'
import ContactList from '../components/ContactList'
import DocList from '../components/DocList'
import TripStatusMessage from '../components/TripStatusMessage'
import { tripButtonClass } from '../components/buttonStyles'

function HelpPage() {
  const trip = useTrip()
  const { helpInfo, loading, importFromFile } = useHelpInfo(trip.id)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (loading) return <TripStatusMessage message="Cargando el viaje…" />

  const hasPrivateData =
    !!helpInfo &&
    (helpInfo.cards.length > 0 || helpInfo.contacts.length > 0 || helpInfo.docs.length > 0)

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setImporting(true)
      setMessage(null)
      await importFromFile(file)
      setMessage({ text: 'Datos privados importados en este dispositivo.', type: 'success' })
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'No se pudo importar el archivo.',
        type: 'error',
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Ayuda" subtitle={trip.name} />

      {helpInfo?.emergency && <EmergencyCard emergency={helpInfo.emergency} />}

      {helpInfo?.cards.map((card) => (
        <HelpCard key={card.title} card={card} />
      ))}
      {helpInfo && helpInfo.contacts.length > 0 && <ContactList contacts={helpInfo.contacts} />}
      {helpInfo && helpInfo.docs.length > 0 && <DocList docs={helpInfo.docs} />}

      {!hasPrivateData && (
        <TripStatusMessage message="Importa el archivo privado del viaje para ver el seguro, la agencia, los hoteles, los contactos y los documentos." />
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={tripButtonClass('ghost', 'w-full disabled:opacity-60')}
        >
          <Upload className="h-[18px] w-[18px]" aria-hidden="true" />
          {importing
            ? 'Importando…'
            : hasPrivateData
              ? 'Actualizar datos privados'
              : 'Importar datos privados'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFile}
          aria-label="Seleccionar archivo privado del viaje"
        />
        {message && (
          <p
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`text-base ${message.type === 'error' ? 'text-trip-urgent' : 'text-trip-done'}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}

export default HelpPage
```

In `src/App.tsx` add `const HelpPage = lazy(() => import('./trips/pages/HelpPage'))` and inside `/trips/:tripId`:

```tsx
<Route path="help" element={<HelpPage />} />
```

- [ ] **Step 2: Run all checks**

Run: `npx prettier --write src/trips src/App.tsx && npm test && npm run lint && npm run format:check && npm run build`
Expected: all green.

- [ ] **Step 3: Create the private file (local only, never committed)**

Create `private/peru-2026-private.json` (the folder is gitignored; check with `git check-ignore private/peru-2026-private.json`, which must print the path). Shape:

```json
{
  "version": 1,
  "type": "trip-private",
  "tripId": "peru-2026",
  "helpInfo": {
    "cards": [],
    "contacts": [],
    "docs": []
  }
}
```

Fill `cards` from `docs/peru/itinerario-peru.md` §8 and §4. Each entry has `{ "title", "sub", "cta", "phone", "mapQuery"? }`:

- one card for the TUI 24 h assistance (its phone);
- one card for the local agency's emergency line (its phone);
- one card per hotel, with its phone and its address as `mapQuery`. For Puno and Aguas Calientes, add both options until one is confirmed.

Leave `contacts` and `docs` empty unless the user provides them: they are personal data, and nothing in the repo holds them.

- [ ] **Step 4: Manual check**

`npm run dev` → `…/trips/peru-2026/help`:

1. Red "Urgencias" card: "Emergencias en Perú · 105", the description, "Llamar al 105" (`tel:105`).
2. No private data yet → explanation card + "Importar datos privados".
3. Import `private/peru-2026-private.json` → "Datos privados importados en este dispositivo."; the cards appear with "Llamar…" and "Cómo llegar"; the button reads "Actualizar datos privados".
4. Import a file with `"tripId": "vietnam-2026"` → red message "El viaje del archivo no existe o no admite importación"; the existing data stays.
5. Import a Vietnam diary export (`type: travel-diary`) → "Formato de archivo no válido".

- [ ] **Step 5: Commit (without the private file)**

```bash
git add src/App.tsx src/trips/components/EmergencyCard.tsx src/trips/components/HelpCard.tsx src/trips/components/ContactList.tsx src/trips/components/DocList.tsx src/trips/pages/HelpPage.tsx
git status --short   # private/ and docs/peru/ must NOT appear as staged
git commit -m "feat(trips): add help screen with private import"
```

---

### Task T14: Documentation and close-out

**Files:**

- Modify: `CLAUDE.md`, `openspec/config.yaml`

**Interfaces:**

- Consumes: everything above.
- Produces: up-to-date project docs.

- [ ] **Step 1: Update `CLAUDE.md`**

In "Commands", add after `npm run lint`:

```bash
npm test             # Vitest (src/**/*.test.ts), TZ pinned to America/Lima
```

Replace the sentence "There is **no test runner** configured." with:

```markdown
Tests use **Vitest** (`vitest.config.ts`; `fake-indexeddb` for Dexie) and cover the new trip engine
in `src/trips/` (TDD). Legacy Vietnam code has no tests.
```

and update the CI sentence to `lint` + `format:check` + `test` + `build`.

Add a section after "Architecture":

```markdown
## Multi-trip (two engines)

- **Legacy (Vietnam 2026):** `TravelPlannerDB`, `src/pages`, `src/hooks`, `src/db`. Frozen: do not
  change its schema. Home is `/trips/vietnam-2026`; its other routes (`/schedule`, `/map`, `/more`,
  `/diary`, …) keep their paths.
- **v2 trips (Peru 2026 onwards):** everything in `src/trips/`: static registry (`registry.ts`),
  separate Dexie DB `TripsDB` (`db.ts`), pure logic in `domain/` (tested), hooks in `hooks/`,
  container pages in `pages/`, presentational components in `components/`.
- **Routes:** `/` → landing redirect (last opened trip → current → next → `/trips`); `/trips` →
  switcher; `/trips/:tripId/{today,itinerary[/:date],checklist,help}`.
- **Adding a trip:** add an entry to `TRIPS` and a lazy content file in `src/trips/content/`
  (register it in `content/index.ts`). No schema change.
- **Content updates:** bump `seedVersion` in the content file; devices resync days and checklist
  labels keeping ticks. Notes and imported private data are never overwritten.
- **Private data** (hotels, agency, insurance, contacts, documents): JSON import from the Ayuda
  screen (`type: 'trip-private'`), kept in `private/` (gitignored). Never in the content files.
- **GitHub Pages deep links:** `public/404.html` + the decoder script in `index.html`.
```

- [ ] **Step 2: Update `openspec/config.yaml`**

Change the testing lines so they are truthful:

- the context line `Testing: No test runner configured (strict_tdd: false)` → `Testing: Vitest (npm test) for src/trips; legacy code untested`;
- every `test_command: ""` → `test_command: "npm test"`;
- `tdd: false` → keep `false` for legacy, and add the comment `# TDD applies to src/trips (user decision 2026-10-10)` on the line above it.

- [ ] **Step 3: Full verification**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all green. Record the test count and build time under "Verification evidence".

Run: `npm run preview`. Then, at `http://localhost:4173/travel-planner-pwa/`, confirm that:

- the landing redirect works;
- the four Peru screens work;
- Vietnam's dashboard and diary work;
- with DevTools → Network → Offline and a reload of `/trips/peru-2026/today`, the screen still renders and the Geist font is still used (served from the service worker precache).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md openspec/config.yaml
git commit -m "docs: document multi-trip architecture and test command"
```

- [ ] **Step 5: Hand back to the user**

Report the results and remind the user of the following:

- Pushing `feat/viaje-peru` publishes this on the live site. Push only on request.
- Before the first deploy that creates `TripsDB`, nothing in `TravelPlannerDB` changes, but an export from Vietnam's Más → Ajustes is still a cheap backup.
- When merging to `main`, remove the `feat/viaje-peru` trigger from `.github/workflows/deploy.yml` and the environment branch policy.

---

## Progress

| ID  | Task                                               | Status                    |
| --- | -------------------------------------------------- | ------------------------- |
| T01 | Test infrastructure, types, registry, trip status  | done (8a9371e2)           |
| T02 | Landing, trip route resolution, last-opened trip   | done (f4618c4c)           |
| T03 | Today view logic and date labels                   | done (efa61950)           |
| T04 | Google Maps URL helpers                            | done (d5ed485e)           |
| T05 | TripsDB and versioned content sync                 | done (8315fabf)           |
| T06 | Peru content, loader, offline-safe loading         | done (a1f42112)           |
| T07 | Private trip data import                           | done (cae32a2f)           |
| T08 | Checklist summary and data hooks                   | done (c0086b8d)           |
| T09 | Switcher, landing, per-trip URLs, Pages deep links | done (8fd5837f)           |
| T10 | v2 shell and "Hoy" screen                          | done (a6cc7df6)           |
| T11 | "Itinerario" screen                                | done (fc0d9aa4, 65b381c1) |
| T12 | "Checklist" screen with notes                      | done (10a6ab2d, 420fb27d) |
| T13 | "Ayuda" screen with private import                 | done (244396a3)           |
| T14 | Documentation and close-out                        | done (d49b055b, 9d085a14) |

## Verification evidence

Summary (per-task reports were kept in a temporary, git-ignored SDD workspace and removed after the final review):

- `npm test`: 106 passed (15 files) at 9d085a14 (2026-10-10/11).
- `npm run lint`, `npm run format:check`, `npm run build`: clean at each task commit (reported by implementers, reviewed per task).
- Every task passed an independent spec + quality review; T11, T12, T14 needed one fix round each (empty-stay copy shared; notes flush on unmount/pagehide; stale CLAUDE.md sentences).
- Final whole-branch review (most capable model): "with fixes" → one fix wave (reload-based error recovery + top-level boundary, StayCard PhoneLink, useNow refresh on resume, error role=alert, label-in-name) at 1d21f6e6..89dcb7ad, re-reviewed clean.
- `vite preview` + curl: app HTML served for `/`, `/trips`, all four Peru screens, Vietnam home and diary.
- **Not verified:** real browser checks (landing redirect behaviour, screens rendering, offline reload with Geist, GitHub Pages cold deep link). Pending on the user's device after a push.

## Next step

All tasks T01–T14 implemented and reviewed (subagent-driven). Hotel names kept out of public content (controller ruling; user can revisit). Final review passed after one fix wave. Remaining: the user decides on push (redeploys the live preview), verifies on a phone, imports `private/peru-2026-private.json` on each device, and on merge to `main` removes the `feat/viaje-peru` deploy trigger and environment branch policy. Open user decisions: app name/title still say Vietnam (manifest, index.html); `/404` renders inside the Vietnam layout; `docs/peru/` not gitignored; `public/icon-192.png` missing (pre-existing).
