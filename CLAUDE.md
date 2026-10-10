# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Offline-first PWA to plan a family trip to Vietnam & Cambodia (4–20 July 2026). **No backend** — all
data lives in the browser via IndexedDB (Dexie). Cross-device sync is manual JSON export/import.
Deployed to GitHub Pages under the base path `/travel-planner-pwa/`.

## Commands

```bash
npm run dev          # Vite dev server → http://localhost:5173/travel-planner-pwa/
npm run build        # tsc -b (typecheck) && vite build → dist/
npm run lint         # ESLint over the repo
npm test             # Vitest (src/**/*.test.ts), TZ pinned to America/Lima
npm run format       # Prettier write
npm run format:check # Prettier check (run in CI)
npm run preview      # Serve the production build locally
```

Tests use **Vitest** (`vitest.config.ts`; `fake-indexeddb` for Dexie) and cover the new trip engine
in `src/trips/` (TDD). Legacy Vietnam code has no tests.
CI (`.github/workflows/deploy.yml`) runs `lint` + `format:check` + `test` + `build`, then deploys
`dist/` to GitHub Pages on push to `main`/`master`.
**Temporary:** the workflow also triggers on `feat/viaje-peru` (preview deploy). When merging to
`main`, remove that branch from the `push` trigger and from the `github-pages` environment branch
policy (repo Settings → Environments), otherwise deploys keep running from the feature branch.
A Husky pre-commit hook runs `lint-staged` (eslint --fix + prettier) on staged files.

## Architecture

**Data layer (the core).** Everything flows through one Dexie database (`src/db/index.ts`):

- `src/db/schema.ts` — table definitions and `DB_VERSION`. The exported `db` singleton (`src/db/index.ts`)
  extends `Dexie` with typed `EntityTable`s.
- **Changing a table's indexed fields requires bumping `DB_VERSION`** and adding a Dexie version
  migration — Dexie will otherwise throw on existing clients. The `stores()` string lists only
  indexed fields, not the full record shape.
- **Seeding:** on first load `main.tsx` calls `initializeDatabase()`. If the DB is empty it bulk-loads
  `src/db/seed.ts`; a `localStorage` flag (`travel-planner-seeded`) tracks that seeding happened.
  `resetDatabase()` / `clearDatabase()` (used by Settings) wipe and re-seed. Seed data is real trip
  data (traveler names, passport numbers, flights) — treat it as production content, not fixtures.

**Hooks are the data API.** Each domain has a `use*` hook in `src/hooks/` (e.g. `usePlaces`,
`useDocuments`, `useItinerary`). They follow one consistent pattern: read with `useLiveQuery`
(reactive, auto-updates the UI on any DB write), and expose `create` / `update` / `remove` callbacks
that set timestamps, generate IDs with `crypto.randomUUID()`, and surface errors via local state.
**Components and pages never touch `db` directly — go through a hook.**

**Routing.** `src/App.tsx` — `BrowserRouter` with `basename` derived from `import.meta.env.BASE_URL`
(so links work under the GitHub Pages subpath). All pages are `React.lazy` + `Suspense`. Some routes
are redirects kept for backwards compatibility (`/daily/:date` → `/schedule/:date`, `/settings` →
`/more`); preserve them when refactoring routes.

**UI.** React 18 + Tailwind 3 (dark mode via `.dark` class on `<html>`, set pre-render in `main.tsx`
to avoid flash). Icons from `lucide-react`. Map via Leaflet / react-leaflet. Components organized by
feature under `src/components/<feature>/`, shared primitives in `src/components/common/`. Pure
per-domain helpers live in `src/utils/`; shared domain types in `src/types/index.ts`.

**Path aliases** (configured in both `vite.config.ts` and `tsconfig.app.json` — keep them in sync):
`@/`, `@components/`, `@pages/`, `@hooks/`, `@db/`, `@data/`, `@utils/`, `@types/`.

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
  screen, kept in `private/` (gitignored, never committed). Never put it in the content files or
  in docs. Shape (`src/trips/import/privateImport.ts` validates it; import replaces
  cards/contacts/docs, the public `emergency` entry is preserved):

  ```json
  {
    "version": 1,
    "type": "trip-private",
    "tripId": "peru-2026",
    "helpInfo": {
      "cards": [{ "title": "", "sub": "", "cta": "", "phone": "", "mapQuery": "(optional)" }],
      "contacts": [{ "name": "", "role": "", "phone": "(optional)" }],
      "docs": [{ "name": "", "where": "", "who": "" }]
    }
  }
  ```

- **GitHub Pages deep links:** `public/404.html` + the decoder script in `index.html`.

## Conventions

- **UI copy and user-facing strings are in Spanish** (existing project convention); match it when
  adding UI. Code identifiers, types, and comments are English.
- TypeScript strict mode, plus `noUnusedLocals` / `noUnusedParameters` — unused code fails the build.
- PWA service worker is registered automatically by `vite-plugin-pwa`; do not add a manual
  registration. The manifest is hand-maintained at `public/manifest.json` (`manifest: false` in the
  plugin config).

## SDD / OpenSpec

This repo uses spec-driven development; active changes live under `openspec/changes/` with project
context and rules in `openspec/config.yaml`. Consult it before large changes.
