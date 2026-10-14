# Multi-trip support with a new trip engine — Design

- **Date:** 2026-10-10
- **Branch:** `feat/viaje-peru`
- **Status:** approved in conversation (sections 1–4); pending written-spec review
- **Mockup:** https://claude.ai/artifact/8F75EfvtjMcjUFJYQSymzS (artboards: Hoy, Itinerario, Checklist, Ayuda, Hoy · modo oscuro)

## 1. Intent

The app currently models exactly one trip (Vietnam & Cambodia, 4–20 July 2026). We want a
history of trips inside the same PWA:

- A direct URL to open the Vietnam trip.
- A direct URL to open the new Peru trip.
- A view to switch between trips.
- The Peru trip is previewed live on GitHub Pages from `feat/viaje-peru` while it is built
  (already in place: commit `18a2cf4e`), before merging to `main`.

### Success criteria

1. `…/trips/vietnam-2026` opens the existing Vietnam dashboard; every existing Vietnam route
   keeps working and Vietnam data on devices is untouched.
2. `…/trips/peru-2026` opens the Peru trip in the new UI from the mockup, including on a
   cold load (no service worker yet) on GitHub Pages.
3. `…/trips` lists trips: upcoming/current first, then past trips under "Historial".
4. Opening the installed PWA (`start_url` = root) lands on the most relevant trip.
5. Adding a future trip requires a registry entry plus a content file, with no schema migration.

### Decisions taken (with rationale)

| Decision                                                                                     | Rationale                                                                                                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| The mockup UI applies **only to new trips**; Vietnam is frozen with its current UI.          | Vietnam is finished; migrating it adds risk with no user value.                                               |
| **Two engines**: Vietnam stays on `TravelPlannerDB` (legacy); new trips use a new `TripsDB`. | Zero migration of real Vietnam data; the new model follows the mockup instead of the legacy schema.           |
| Static trip **registry** in code.                                                            | The switcher must work before any data loads and must include the legacy trip, which is not in `TripsDB`.     |
| No in-app itinerary editing in v1.                                                           | The mockup has none; content is authored in code. Checklist toggles and notes are editable.                   |
| No weather chip.                                                                             | Offline-first with no backend; a static value would be false.                                                 |
| "Now/next" uses the device clock.                                                            | On the trip the device is on local time (Peru: UTC−5).                                                        |
| Checklist copy says "Del grupo" / "Personal" without visibility claims.                      | There is no sync; "Lo ve todo el grupo" would be false. "Solo las ves tú" on notes is kept (true).            |
| Geist self-hosted via `@fontsource-variable/geist`.                                          | Google Fonts does not work offline.                                                                           |
| Vitest + `fake-indexeddb`; TDD for all new code under `src/trips/`.                          | The user resolved the conflict between global Strict TDD and repo `tdd: false` in favour of TDD for new code. |

## 2. Routes and navigation

| URL                                                                         | Behaviour                                                                                                        |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --- | -------------------- |
| `/`                                                                         | Landing redirect: last opened trip (localStorage) → else current trip → else next upcoming trip → else `/trips`. |
| `/trips`                                                                    | Trip switcher (mockup styling). Cards show name, dates, countries, status (Próximo / En curso / Terminado).      |
| `/trips/vietnam-2026`                                                       | Vietnam dashboard (moved from `/`).                                                                              |
| `/schedule`, `/schedule/:date`, `/map`, `/places/*`, `/more`, `/diary/*`, … | Legacy Vietnam routes, **unchanged**. Existing redirects (`/daily/:date`, `/settings`) preserved.                |
| `/trips/:tripId` (engine `v2`)                                              | Redirects to `/trips/:tripId/today`.                                                                             |
| `/trips/:tripId/today`                                                      | "Hoy" screen.                                                                                                    |
| `/trips/:tripId/itinerary` and `/trips/:tripId/itinerary/:date`             | "Itinerario" screen; selected tab as `?tab=plan                                                                  | eat | see`(default`plan`). |
| `/trips/:tripId/checklist`                                                  | "Checklist" screen.                                                                                              |
| `/trips/:tripId/help`                                                       | "Ayuda" screen.                                                                                                  |
| `/trips/<unknown>/*`                                                        | Redirect to `/trips`.                                                                                            |
| `/trips/<legacy-id>/<v2 sub-route>`                                         | Redirect to that trip's legacy dashboard.                                                                        |

Legacy changes (the only edits to Vietnam code):

- `BottomNav.tsx` "Inicio" → `/trips/vietnam-2026` (keep `end` matching).
- `NotFound.tsx` home button → `/` (landing decides).
- MorePage: add a "Cambiar de viaje" entry → `/trips`.
- Opening any Vietnam route records `vietnam-2026` as last opened trip.

Path segments are English (consistent with existing routes); UI copy is Spanish.

**GitHub Pages deep links:** add `public/404.html` with the standard SPA redirect shim
(encodes the path into a query string and redirects to `index.html`), plus the matching
decoder script in `index.html`. Without it a cold load of `/trips/peru-2026` returns a
GitHub 404.

## 3. Data model (new engine)

### Registry — `src/trips/registry.ts`

```ts
type TripEngine = 'legacy' | 'v2'
interface TripMeta {
  id: string // 'vietnam-2026', 'peru-2026'
  name: string // 'Vietnam y Camboya', 'Perú'
  startDate: string // ISO date
  endDate: string // ISO date
  countries: string[]
  engine: TripEngine
  legacyHomePath?: string // '/trips/vietnam-2026' for legacy trips
}
```

### `TripsDB` (Dexie, name `TripsDB`, version 1) — `src/trips/db.ts`

| Table            | Primary key / indexes           | Shape                                                                           |
| ---------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| `days`           | `[tripId+date]`, index `tripId` | `{ tripId, date, title, cities[], stay \| null, legs[], plan[], eat[], see[] }` |
| `checklistItems` | `id`, index `tripId`            | `{ id, tripId, group: 'shared' \| 'private', label, done, order }`              |
| `notes`          | `tripId`                        | `{ tripId, text, updatedAt }`                                                   |
| `helpInfo`       | `tripId`                        | `{ tripId, emergency: { label, number }, cards[], contacts[], docs[] }`         |
| `contentState`   | `tripId`                        | `{ tripId, seedVersion }`                                                       |

Embedded day shapes mirror the mockup: `plan: { t, title, place, q }`,
`eat: { when, name, kind, tip, q }`, `see: { name, desc, dur, q }`,
`legs: { mode: 'car'|'cable'|'walk'|'plane'|'bus', title, meta, q? , from?, to?, travel? }`,
`stay: { name, meta, q, phone? }`.

Adding a trip never changes indexes, so no Dexie version bump is needed per trip.

### Content sources

- **Public content** — `src/trips/content/<tripId>.ts`, loaded lazily through a loader map
  (`content/index.ts`). Contains `seedVersion`, days, base checklist, and the country
  emergency number. No personal data.
- **Private content** — JSON import only, never committed (same rule as the diary):
  `{ version: 1, type: 'trip-private', tripId, helpInfo: { cards, contacts, docs } }`.

### Seed sync — `src/trips/domain/seedSync.ts`

On opening a v2 trip, if `content.seedVersion > contentState.seedVersion` (or no state):

- `days` for the trip are replaced.
- `checklistItems` are upserted by `id`, **preserving `done`**; items removed from content are deleted.
- `helpInfo.emergency` is set from content; `cards`, `contacts`, `docs` are never overwritten.
- `notes` are never touched.
- `contentState.seedVersion` is updated — all in one transaction.

## 4. Code structure

```
src/trips/
  registry.ts · types.ts · db.ts
  content/index.ts · content/peru-2026.ts
  domain/   today.ts · tripStatus.ts · landing.ts · mapsUrl.ts · seedSync.ts   (pure / testable)
  hooks/    useTripContent · useTripDays · useChecklist · useNotes · useHelpInfo
  pages/    TripSwitcher · TodayPage · ItineraryPage · ChecklistPage · HelpPage   (containers)
  components/ TripLayout · TripNav · DayStrip · PlanList · EatList · SeeList · LegList ·
              StayCard · NowCard · ChecklistGroup · EmergencyCard · HelpCard · ContactList · DocList
  import/   privateImport.ts
```

Rules:

- Pages use hooks only; components receive props only (container / presentational).
- Nothing in `src/trips/` touches `TravelPlannerDB`; legacy code never imports `src/trips/`
  except the registry (switcher entry) and the landing helper for `/`.
- Components stay under 300 lines (`openspec/config.yaml`).
- `TripLayout` is the v2 shell: header (trip name + switch-trip button) and the 4-tab bottom
  nav from the mockup. It does not reuse the legacy `Layout`.
- Styling: Tailwind with the mockup palette as CSS variables; dark mode through the existing
  `.dark` class on `<html>`. Icons: `lucide-react` equivalents of the mockup icons.
- All pages `React.lazy` + `Suspense`, like the existing routes.

### Domain functions

- `today.ts` — given a day's `plan` and a clock: `nowItem`, `nowLabel` ("Ahora" / "Siguiente"),
  `rest`; given trip dates and today: which day to show and the banner ("Faltan N días" before
  the trip, "Viaje terminado" after it, showing day 1 / last day respectively).
- `tripStatus.ts` — `upcoming | current | past` from dates and today; sort order for the switcher.
- `landing.ts` — resolve the `/` target from registry, last-opened id and today.
- `mapsUrl.ts` — Google Maps search/directions URLs exactly as in the mockup.

## 5. Error handling

- Unknown trip id → `/trips`; legacy id on a v2 sub-route → legacy home.
- Hooks expose `error`; pages render "No se pudieron cargar los datos del viaje" with a retry
  button. Same for lazy content load failures.
- Private import validates `type`, `version` and that `tripId` exists in the registry with
  engine `v2`; writes in one transaction; rejection message explains why.
- `localStorage` access wrapped in `try/catch`; landing falls back to date-based resolution.
- Empty states from the mockup: "No hay más actividades hoy", "Sin alojamiento · vuelta a casa".

## 6. Testing

- Add `vitest`, `fake-indexeddb`; `npm test` script; CI runs `npm test` after lint/format.
- TDD (RED → GREEN → REFACTOR) for everything under `src/trips/domain/` and
  `src/trips/import/`, plus `seedSync` against `fake-indexeddb`.
- Legacy Vietnam code is not tested (frozen).
- Per-task checks: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.

## 7. Out of scope (v1)

- Export/import of v2 checklist and notes (backup); planned next.
- In-app editing of itinerary content.
- Weather.
- Migrating Vietnam to the new engine/UI.
- Map, places, recommendations, diary, coffee and food screens for v2 trips.

## 8. Content input required from the user

The Peru content file needs real data from the user: trip dates, cities per day, plan / eat /
see items, transport legs, stays, and the base checklist. Until it is provided, the
implementation ships a minimal Peru registry entry and content with clearly marked sample
days so the UI can be built and previewed.

## 9. Rollback

- Frontend-only and additive: reverting the merge restores the previous app.
- `TripsDB` is a separate IndexedDB database; `TravelPlannerDB` is never migrated, so a
  rollback leaves Vietnam data intact.
- Remove the `feat/viaje-peru` deploy trigger and environment branch policy when merging.
