# Food Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/food` page (Vietnamese national dishes + per-city specialties + ordering vocabulary) mirroring `/coffee`, plus a collapsible "Comida típica" panel inside each city's detail view in `Places.tsx`.

**Architecture:** Pure static reference data (`src/data/food.ts`) consumed by a new lazy-loaded page (`src/pages/Food.tsx`) and a shared presentational component (`src/components/food/DishCard.tsx`), which is also reused inside the existing city-detail view of `src/pages/Places.tsx`. No DB, no new `PlaceCategory`, no new `Place` records.

**Tech Stack:** React 18 + TypeScript 5.6 (strict, `noUnusedLocals`/`noUnusedParameters`), Tailwind CSS 3, lucide-react icons, React Router v7.

## Global Constraints

- No `'food'`/`'comida'` value added to `PlaceCategory` — `'restaurant'` remains the only food-related map category (per approved design spec).
- No new `Place` records, no DB schema change, no `DB_VERSION` bump.
- UI copy is in Spanish (existing project convention); code identifiers/comments in English.
- This repo has **no test runner** (`npm run build` = `tsc -b && vite build`, `npm run lint` = ESLint, `npm run format:check` = Prettier check — these are CI's only gates). Every task's verification step is `npm run build` (typecheck/compile) instead of a unit test run; UI tasks add a manual check via `npm run dev`.
- Follow existing patterns from `src/pages/Coffee.tsx` (already-approved reference implementation for this exact pattern).
- Path aliases (`@data`, `@components`, etc.) are pre-configured in `vite.config.ts` / `tsconfig.app.json` — this plan uses relative imports to match the style already used in `Coffee.tsx` and `Places.tsx`.

---

### Task 1: Dish data

**Files:**

- Create: `src/data/food.ts`

**Interfaces:**

- Produces: `interface Dish { name: string; description: string; exclusive?: boolean }`, `NATIONAL_DISHES: Dish[]`, `CITY_DISHES: Partial<Record<CityId, Dish[]>>` — consumed by Tasks 2, 3, 6.

- [ ] **Step 1: Write the data file**

```ts
import type { CityId } from '../utils/cities'

export interface Dish {
  name: string
  description: string
  exclusive?: boolean
}

export const NATIONAL_DISHES: Dish[] = [
  {
    name: 'Phở',
    description:
      'Sopa de fideos de arroz con carne y verduras. El plato estrella de Vietnam, presente en todo el país.',
  },
  {
    name: 'Gỏi cuốn',
    description:
      'Rollitos frescos (no fritos) de gambas, cerdo, fideos de arroz y hierbas envueltos en papel de arroz.',
  },
  {
    name: 'Bánh mì',
    description:
      'Bocadillo de baguette con carne, paté y verduras encurtidas — herencia de la colonización francesa.',
  },
  {
    name: 'Cơm tấm',
    description: 'Arroz quebrado servido con carne a la parrilla, huevo frito y salsa de pescado.',
  },
  {
    name: 'Nước mắm',
    description: 'Salsa de pescado fermentada que acompaña a casi todos los platos vietnamitas.',
  },
]

export const CITY_DISHES: Partial<Record<CityId, Dish[]>> = {
  hanoi: [
    {
      name: 'Phở gà',
      description: 'Variante de phở con pollo en lugar de ternera, típica de Hanói.',
    },
    {
      name: 'Bún chả',
      description:
        'Carne de cerdo a la parrilla servida con fideos, hierbas y un caldo agridulce para mojar.',
    },
    {
      name: 'Bánh cuốn',
      description:
        'Crepe transparente de arroz al vapor relleno de carne picada y hongos, servido con salsa de pescado.',
    },
  ],
  hue: [
    {
      name: 'Nem lụi',
      description: 'Brochetas de carne marinada asadas sobre un palo de hierba limón (lemongrass).',
    },
    {
      name: 'Bánh bèo',
      description:
        'Pequeñas crepes de arroz al vapor cubiertas de gambas secas y cortezas de cerdo crujientes.',
    },
    {
      name: 'Bún bò Huế',
      description: 'Sopa de fideos picante con hierba limón, especialidad de Huế.',
    },
    {
      name: 'Bánh bột lọc',
      description: 'Dumplings translúcidos de tapioca rellenos de cerdo o gambas.',
    },
  ],
  'hoi-an': [
    {
      name: 'Cao lầu',
      description: 'Fideos gruesos con cerdo y arroz tostado crujiente.',
      exclusive: true,
    },
    {
      name: 'Mì Quảng',
      description: 'Sopa de fideos amarillos con cerdo, gambas y cacahuetes.',
    },
    {
      name: 'Bánh bao vạc',
      description: "Dumplings conocidos como 'rosa blanca', rellenos de gambas.",
    },
    {
      name: 'Cơm gà',
      description: 'Arroz cocinado en caldo de pollo, servido con pollo desmenuzado.',
    },
  ],
  'ninh-binh': [
    {
      name: 'Cơm cháy',
      description: 'Arroz tostado crujiente, especialidad local servida con distintas salsas.',
    },
    {
      name: 'Thịt dê',
      description: 'Carne de cabra, plato típico de la región montañosa de Ninh Bình.',
    },
  ],
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors (confirms `Dish`/`CityId` types line up).

- [ ] **Step 3: Commit**

```bash
git add src/data/food.ts
git commit -m "feat(food): add national and per-city dish data"
```

---

### Task 2: DishCard component

**Files:**

- Create: `src/components/food/DishCard.tsx`

**Interfaces:**

- Consumes: `Dish` from `src/data/food.ts` (Task 1).
- Produces: `DishCard` default export, props `{ dish: Dish }` — consumed by Tasks 3 and 6.

- [ ] **Step 1: Write the component**

```tsx
import type { Dish } from '../../data/food'

interface DishCardProps {
  dish: Dish
}

function DishCard({ dish }: DishCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">{dish.name}</h4>
        {dish.exclusive && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Exclusivo
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">{dish.description}</p>
    </div>
  )
}

export default DishCard
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/food/DishCard.tsx
git commit -m "feat(food): add DishCard component"
```

---

### Task 3: Food page

**Files:**

- Create: `src/pages/Food.tsx`

**Interfaces:**

- Consumes: `NATIONAL_DISHES`, `CITY_DISHES` from `src/data/food.ts` (Task 1); `DishCard` from `src/components/food/DishCard.tsx` (Task 2); `CITIES` from `src/utils/cities.ts` (existing); `Button` from `src/components/common/Button.tsx` (existing).
- Produces: default export `FoodPage`, no route wired yet (Task 4).

- [ ] **Step 1: Write the page**

```tsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Utensils } from 'lucide-react'
import Button from '../components/common/Button'
import DishCard from '../components/food/DishCard'
import { NATIONAL_DISHES, CITY_DISHES } from '../data/food'
import { CITIES } from '../utils/cities'

const VOCABULARY = [
  { word: 'Cay', pronunciation: '"cai"', meaning: 'Picante' },
  { word: 'Không cay', pronunciation: '"khôm cai"', meaning: 'No picante' },
  { word: 'Chay', pronunciation: '"chai"', meaning: 'Vegetariano' },
  { word: 'Ngon', pronunciation: '"ngon"', meaning: 'Delicioso' },
  { word: 'Tính tiền', pronunciation: '"tính tiền"', meaning: 'La cuenta, por favor' },
  { word: 'Không có', pronunciation: '"khôm có"', meaning: 'Sin (p.ej. "sin cacahuetes")' },
]

function FoodPage() {
  const navigate = useNavigate()

  const cityDishGroups = CITIES.filter((city) => (CITY_DISHES[city.id]?.length ?? 0) > 0)

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <Button variant="secondary" onClick={() => navigate(-1)} className="px-3 py-2 text-xs">
        <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Volver
      </Button>

      {/* Hero */}
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <Utensils className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comida de Vietnam</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Platos típicos, especialidades por ciudad y cómo pedirlos
          </p>
        </div>
      </div>

      {/* Section A: National dishes */}
      <section aria-labelledby="national-dishes-heading">
        <h2
          id="national-dishes-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Platos nacionales
        </h2>
        <div className="space-y-3">
          {NATIONAL_DISHES.map((dish) => (
            <DishCard key={dish.name} dish={dish} />
          ))}
        </div>
      </section>

      {/* Section B: Dishes by city */}
      {cityDishGroups.length > 0 && (
        <section aria-labelledby="city-dishes-heading">
          <h2
            id="city-dishes-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Comida por ciudad
          </h2>
          <div className="space-y-4">
            {cityDishGroups.map((city) => (
              <div key={city.id}>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <span role="img" aria-label="Vietnam">
                    🇻🇳
                  </span>{' '}
                  {city.name}
                </h3>
                <div className="space-y-2.5">
                  {CITY_DISHES[city.id]!.map((dish) => (
                    <DishCard key={dish.name} dish={dish} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section C: Ordering guide */}
      <section aria-labelledby="food-ordering-heading">
        <h2
          id="food-ordering-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Vocabulario y cómo pedir
        </h2>

        <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Vocabulario esencial
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {VOCABULARY.map((v) => (
              <div key={v.word} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{v.word}</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {v.pronunciation}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
            <span className="font-semibold">Tip:</span> Muchos platos vietnamitas llevan cacahuetes
            (maní) como guarnición. Si tienes alergia, di claramente{' '}
            <span className="font-semibold italic">Không có đậu phộng</span> ("khôm có đậu phộng",
            sin cacahuetes) al pedir.
          </p>
        </div>
      </section>
    </div>
  )
}

export default FoodPage
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Food.tsx
git commit -m "feat(food): add Food page"
```

---

### Task 4: Wire `/food` route

**Files:**

- Modify: `src/App.tsx:24` (add lazy import after the `Coffee` import), `src/App.tsx:51` (add route after the `/coffee` route)

**Interfaces:**

- Consumes: default export from `src/pages/Food.tsx` (Task 3).

- [ ] **Step 1: Add the lazy import**

In `src/App.tsx`, change line 24 from:

```tsx
const Coffee = lazy(() => import('./pages/Coffee'))
const NotFound = lazy(() => import('./pages/NotFound'))
```

to:

```tsx
const Coffee = lazy(() => import('./pages/Coffee'))
const Food = lazy(() => import('./pages/Food'))
const NotFound = lazy(() => import('./pages/NotFound'))
```

- [ ] **Step 2: Add the route**

Change line 51 from:

```tsx
            <Route path="/coffee" element={<Coffee />} />
            <Route path="/404" element={<NotFound />} />
```

to:

```tsx
            <Route path="/coffee" element={<Coffee />} />
            <Route path="/food" element={<Food />} />
            <Route path="/404" element={<NotFound />} />
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 4: Manual check**

Run: `npm run dev`
Visit: `http://localhost:5173/travel-planner-pwa/food`
Expected: page renders with hero "Comida de Vietnam", 5 national dish cards, 4 city subsections (Hanói, Huế, Hội An, Ninh Bình — in that itinerary order), Cao Lầu shows an "Exclusivo" badge, and the vocabulary table + tip banner render at the bottom. Stop the dev server (Ctrl+C) when done.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat(food): wire /food route"
```

---

### Task 5: Link from MorePage

**Files:**

- Modify: `src/pages/MorePage.tsx:2` (import `Utensils`), `src/pages/MorePage.tsx:73-79` (add second `SectionLink` inside the existing "Vietnam" section)

**Interfaces:**

- Consumes: existing `SectionLink` component defined in the same file (lines 15-36); route `/food` (Task 4).

- [ ] **Step 1: Add the icon import**

Change line 2 from:

```tsx
import { FileText, Shield, MapPin, ChevronRight, Backpack, Coffee, Map } from 'lucide-react'
```

to:

```tsx
import {
  FileText,
  Shield,
  MapPin,
  ChevronRight,
  Backpack,
  Coffee,
  Map,
  Utensils,
} from 'lucide-react'
```

- [ ] **Step 2: Add the second SectionLink**

Change the "Vietnam" section (lines 66-80) from:

```tsx
<section aria-labelledby="vietnam-heading">
  <h2
    id="vietnam-heading"
    className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
  >
    Vietnam
  </h2>
  <SectionLink
    to="/coffee"
    icon={<Coffee className="h-6 w-6" aria-hidden="true" />}
    title="Guía del Café"
    description="Tipos de café vietnamita, dónde tomarlo y cómo pedirlo."
    onClick={() => navigate('/coffee')}
  />
</section>
```

to:

```tsx
<section aria-labelledby="vietnam-heading">
  <h2
    id="vietnam-heading"
    className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
  >
    Vietnam
  </h2>
  <div className="space-y-3">
    <SectionLink
      to="/coffee"
      icon={<Coffee className="h-6 w-6" aria-hidden="true" />}
      title="Guía del Café"
      description="Tipos de café vietnamita, dónde tomarlo y cómo pedirlo."
      onClick={() => navigate('/coffee')}
    />
    <SectionLink
      to="/food"
      icon={<Utensils className="h-6 w-6" aria-hidden="true" />}
      title="Guía de Comida"
      description="Platos típicos de Vietnam y especialidades por ciudad."
      onClick={() => navigate('/food')}
    />
  </div>
</section>
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 4: Manual check**

Run: `npm run dev`
Visit: `http://localhost:5173/travel-planner-pwa/more`
Expected: "Vietnam" section shows both "Guía del Café" and "Guía de Comida" links; clicking "Guía de Comida" navigates to `/food`. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add src/pages/MorePage.tsx
git commit -m "feat(food): link Guía de Comida from MorePage"
```

---

### Task 6: City-detail "Comida típica" panel in Places.tsx

**Files:**

- Modify: `src/pages/Places.tsx:1-20` (imports), `src/pages/Places.tsx:44` (state), `src/pages/Places.tsx:65` (derived data), `src/pages/Places.tsx:90-94` (reset on city change), `src/pages/Places.tsx:273-275` (insert panel JSX)

**Interfaces:**

- Consumes: `CITY_DISHES` from `src/data/food.ts` (Task 1); `DishCard` from `src/components/food/DishCard.tsx` (Task 2); existing `selectedCity` state, `CityGroupId`, `OTHER_CITY_ID` (all already in this file).

- [ ] **Step 1: Add imports**

Change line 3 from:

```tsx
import { Map, List, Plus, Search, X, ExternalLink, ArrowLeft, LayoutGrid } from 'lucide-react'
```

to:

```tsx
import {
  Map,
  List,
  Plus,
  Search,
  X,
  ExternalLink,
  ArrowLeft,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Utensils,
} from 'lucide-react'
```

Then, immediately after the existing import block (after line 20, the closing `} from '../utils/cities'`), add:

```tsx
import DishCard from '../components/food/DishCard'
import { CITY_DISHES } from '../data/food'
```

- [ ] **Step 2: Add collapse state**

Change line 44 from:

```tsx
const [toasts, setToasts] = useState<Toast[]>([])
```

to:

```tsx
const [toasts, setToasts] = useState<Toast[]>([])
const [showCityFood, setShowCityFood] = useState(false)
```

- [ ] **Step 3: Derive the current city's dishes**

Immediately after the `filteredPlaces` `useMemo` block (ends at line 65 with `}, [places, search, categoryFilter, selectedCity])`), add:

```tsx
const cityDishes = useMemo(() => {
  if (!selectedCity || selectedCity === 'all' || selectedCity === OTHER_CITY_ID) return []
  return CITY_DISHES[selectedCity] ?? []
}, [selectedCity])
```

- [ ] **Step 4: Reset the panel when switching cities**

Change `handleSelectCity` (lines 90-94) from:

```tsx
const handleSelectCity = (cityId: CityGroupId) => {
  setSelectedCity(cityId)
  setSearch('')
  setFocusedPlaceId(null)
}
```

to:

```tsx
const handleSelectCity = (cityId: CityGroupId) => {
  setSelectedCity(cityId)
  setSearch('')
  setFocusedPlaceId(null)
  setShowCityFood(false)
}
```

- [ ] **Step 5: Render the collapsible panel**

Find the closing of the header row — line 273 is the `</div>` that closes the `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` container (opened at line 185), immediately followed by line 275 `{!isCityGridView && (` (the search/filter block). Insert this block between them, leaving the existing search/filter block untouched right after it:

```tsx
{
  !isCityGridView && cityDishes.length > 0 && (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setShowCityFood((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        aria-expanded={showCityFood}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
          <Utensils className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          Comida típica ({cityDishes.length})
        </span>
        {showCityFood ? (
          <ChevronUp className="h-4 w-4 text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        )}
      </button>
      {showCityFood && (
        <div className="space-y-2.5 border-t border-gray-100 px-4 py-3 dark:border-slate-800">
          {cityDishes.map((dish) => (
            <DishCard key={dish.name} dish={dish} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verify it compiles**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 7: Manual check**

Run: `npm run dev`
Visit: `http://localhost:5173/travel-planner-pwa/places`, open the Cities grid, tap "Hanói".
Expected: a collapsed "Comida típica (3)" chip appears below the header, above the search bar. Tapping it expands 3 `DishCard`s (Phở gà, Bún chả, Bánh cuốn) with the chevron flipping to "up"; tapping again collapses it. Go back to Cities and open "Pu Luong" (no dish data) — confirm the panel does not render at all. Stop the dev server when done.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Places.tsx
git commit -m "feat(food): add collapsible typical-food panel to city detail"
```

---

### Task 7: Full CI-parity verification

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Format check**

Run: `npm run format:check`
Expected: no errors (the Husky pre-commit hook already ran Prettier on each commit in Tasks 1–6, so this should already be clean).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `tsc -b` and `vite build` both succeed, `dist/` is produced.

- [ ] **Step 4: Confirm clean tree**

Run: `git status --porcelain`
Expected: empty (everything from Tasks 1–6 was committed; this task makes no code changes).
