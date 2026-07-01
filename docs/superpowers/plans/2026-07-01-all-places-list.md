# All Places List (below city cards) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full, category-filterable list of all places (no city filter) below the city cards on `/places` and `/map`, without touching the existing per-city filtered views.

**Architecture:** One new presentational component, `AllPlacesList`, owns its own category-filter state and renders a compact, clickable row list. `Places.tsx` renders it below `<CitiesGrid />` only when `isCityGridView && homeView === 'cards'`, passing the full unfiltered `places` array and a navigation callback to `/places/:id`.

**Tech Stack:** React 18 + TypeScript (strict), Tailwind 3 (dark mode via `.dark` class), `lucide-react` icons, `react-router-dom` v6.

## Global Constraints

- No backend — all data comes from the existing `usePlaces()` hook (Dexie/IndexedDB), already wired in `Places.tsx`.
- UI copy is in Spanish (existing project convention). Code identifiers/comments stay in English.
- TypeScript strict mode, `noUnusedLocals` / `noUnusedParameters` — unused code fails the build.
- This repo has **no test runner** (see `CLAUDE.md`). Verification for each task is: `npm run lint`, `npx tsc -b --noEmit` (or `npm run build`), and manual check in the dev server — not automated tests.
- Path aliases exist (`@/`, `@components/`, etc.) but the existing files in `src/pages/Places.tsx` and `src/components/places/*` use relative imports (`../hooks/usePlaces`, `../../utils/cities`) — follow that existing relative-import convention in this area of the codebase, don't switch to aliases.
- Do not change the per-city filtered view, the Map/List toggle, or the Cards/Map home toggle — this plan is additive only.

---

### Task 1: `AllPlacesList` component

**Files:**

- Create: `src/components/places/AllPlacesList.tsx`

**Interfaces:**

- Consumes: `Place`, `PlaceCategory` from `../../types`; `FILTER_CATEGORIES`, `getCategoryConfig` from `../../utils/places`; `CITIES`, `nearestCityId` from `../../utils/cities`.
- Produces: default export `AllPlacesList(props: { places: Place[]; onSelect: (place: Place) => void }): JSX.Element` — later consumed by `Places.tsx` in Task 2.

- [ ] **Step 1: Create the component file**

```tsx
import { useMemo, useState } from 'react'
import { List } from 'lucide-react'
import type { Place, PlaceCategory } from '../../types'
import { FILTER_CATEGORIES, getCategoryConfig } from '../../utils/places'
import { CITIES, nearestCityId } from '../../utils/cities'

interface AllPlacesListProps {
  places: Place[]
  onSelect: (place: Place) => void
}

function cityLabel(place: Place): string {
  const cityId = nearestCityId(place)
  if (!cityId) return 'Otros'
  return CITIES.find((city) => city.id === cityId)?.name ?? 'Otros'
}

function AllPlacesList({ places, onSelect }: AllPlacesListProps) {
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | 'all'>('all')

  const filteredPlaces = useMemo(() => {
    if (categoryFilter === 'all') return places
    return places.filter((place) => place.category === categoryFilter)
  }, [places, categoryFilter])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <List className="h-4 w-4 text-gray-400" aria-hidden="true" />
          Todos los lugares
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-gray-300">
            {filteredPlaces.length}
          </span>
        </h2>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PlaceCategory | 'all')}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          aria-label="Filtrar todos los lugares por categoria"
        >
          <option value="all">Todas las categorias</option>
          {FILTER_CATEGORIES.map((cat) => {
            const config = getCategoryConfig(cat)
            return (
              <option key={cat} value={cat}>
                {config.label}
              </option>
            )
          })}
        </select>
      </div>

      {filteredPlaces.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:text-gray-400">
          No hay lugares con esta categoria.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
          {filteredPlaces.map((place) => {
            const config = getCategoryConfig(place.category)
            const Icon = config.icon
            return (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onSelect(place)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bgClass}`}
                  >
                    <Icon className={`h-4 w-4 ${config.textClass}`} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                      {place.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {cityLabel(place)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AllPlacesList
```

- [ ] **Step 2: Typecheck the new file in isolation**

Run: `npx tsc -b --noEmit`
Expected: no errors referencing `AllPlacesList.tsx` (the file isn't imported anywhere yet, so this mainly checks it parses and types clean — full integration is verified in Task 2).

- [ ] **Step 3: Lint the new file**

Run: `npx eslint src/components/places/AllPlacesList.tsx`
Expected: no errors or warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/places/AllPlacesList.tsx
git commit -m "feat(places): add AllPlacesList component"
```

---

### Task 2: Wire `AllPlacesList` into the Places page

**Files:**

- Modify: `src/pages/Places.tsx`

**Interfaces:**

- Consumes: `AllPlacesList` from Task 1 (`../components/places/AllPlacesList`), default export, props `{ places, onSelect }`.
- Consumes: `places` (already available in scope from `usePlaces()`, line 42) and `useNavigate` from `react-router-dom` (not yet imported in this file — only `useLocation` is imported at line 2).

- [ ] **Step 1: Add the `useNavigate` import and hook**

In `src/pages/Places.tsx`, change line 2:

```tsx
import { useLocation } from 'react-router-dom'
```

to:

```tsx
import { useLocation, useNavigate } from 'react-router-dom'
```

Then, right after the existing `const location = useLocation()` (line 43), add:

```tsx
const navigate = useNavigate()
```

- [ ] **Step 2: Import `AllPlacesList`**

Add this import next to the other `../components/places/*` imports (after the `CitiesGrid` import, line 21):

```tsx
import AllPlacesList from '../components/places/AllPlacesList'
```

- [ ] **Step 3: Render it below the city cards, cards-view only**

Find this block (lines 371-377):

```tsx
      {isCityGridView ? (
        homeView === 'cards' ? (
          <CitiesGrid groups={cityGroups} onSelect={handleSelectCity} />
        ) : (
          renderMapPanel(places, null)
        )
      ) : view === 'map' ? (
```

Replace it with:

```tsx
      {isCityGridView ? (
        homeView === 'cards' ? (
          <div className="space-y-6">
            <CitiesGrid groups={cityGroups} onSelect={handleSelectCity} />
            <AllPlacesList places={places} onSelect={(place) => navigate(`/places/${place.id}`)} />
          </div>
        ) : (
          renderMapPanel(places, null)
        )
      ) : view === 'map' ? (
```

- [ ] **Step 4: Typecheck the whole app**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 5: Lint the whole repo**

Run: `npm run lint`
Expected: no errors or warnings.

- [ ] **Step 6: Manual verification in the dev server**

Run: `npm run dev`

Open `http://localhost:5173/travel-planner-pwa/map`, confirm:

1. City cards grid still renders at the top (Cards view, default `homeView`).
2. Below it, a new "Todos los lugares" section appears listing every place across all cities, with a category `<select>` and a result count badge.
3. Changing the category filter narrows the list to just that category (e.g. pick "Restaurant" and confirm every row shows a restaurant from a different city).
4. Clicking a row navigates to `/places/:id` (the `PlaceDetail` page for that place) — confirm with browser back button that it returns cleanly.
5. Switch the home toggle to "Map" — confirm the new list disappears (it should only show in Cards view, per the approved design).
6. Click into a city card (e.g. "Hanoi") — confirm the existing per-city filtered view (with its own category filter, Map/List toggle) behaves exactly as before, unaffected by this change.
7. Toggle dark mode (if there's a way to test it in this session, e.g. via OS/browser dark mode preference) and confirm the new section's colors/contrast look correct.

Expected: all 7 checks pass with no console errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Places.tsx
git commit -m "feat(places): show full places list with category filter below city cards"
```

---

## Self-Review Notes

- **Spec coverage:** category filter with no city filter (Task 1) ✓; placed below city cards (Task 2, Step 3) ✓; per-city filtering untouched (Task 2, Step 6 verifies) ✓; cards-view-only per user's answer (Task 2, Step 5 verifies) ✓; compact row format per user's answer (Task 1 uses `<li><button>` rows, no `PlaceCard`) ✓.
- **No placeholders:** all steps contain full code/commands.
- **Type consistency:** `AllPlacesListProps` matches the call site in Task 2 (`places`, `onSelect: (place: Place) => void`); `getCategoryConfig`/`FILTER_CATEGORIES` signatures match their existing usage elsewhere in `Places.tsx` (lines 25, 359-366).
