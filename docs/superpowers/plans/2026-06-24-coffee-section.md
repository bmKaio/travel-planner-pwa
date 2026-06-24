# Coffee Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/coffee` page covering Vietnamese coffee types, curated café locations (seeded into the existing places DB so they appear on the main map), and an ordering guide — accessible from MorePage.

**Architecture:** Static React page with three content sections. The five cafés are added to `seed.ts` as `Place` records with a new `cafe` PlaceCategory so they appear on the existing map with an amber marker. The page reads café data reactively via `usePlaces().getByCategory('cafe')`. All guide content (coffee types, vocabulary, combinations) is hardcoded — it is curated content that will not change.

**Tech Stack:** React 18, TypeScript strict, Tailwind 3, Dexie/IndexedDB, React Router 6, lucide-react icons.

## Global Constraints

- UI copy in Spanish (existing project convention); code identifiers, types, and comments in English.
- TypeScript strict mode + `noUnusedLocals` / `noUnusedParameters` — unused imports/vars fail the build.
- No new DB tables, no `DB_VERSION` bump.
- All new components follow the existing file-per-component pattern under `src/components/<feature>/`.
- Pages are lazy-loaded via `React.lazy` + `Suspense` in `App.tsx`.
- No test runner is configured — verification gate is `npm run lint` + `npm run build` after each task.

---

## File Map

| File                                       | Action | Responsibility                                                                                |
| ------------------------------------------ | ------ | --------------------------------------------------------------------------------------------- |
| `src/types/index.ts`                       | Modify | Add `'cafe'` to `PlaceCategory` union                                                         |
| `src/utils/places.ts`                      | Modify | Add `cafe` config to `CATEGORY_CONFIG` and `FILTER_CATEGORIES`                                |
| `src/db/seed.ts`                           | Modify | Add 5 café Place records                                                                      |
| `src/components/coffee/CoffeeTypeCard.tsx` | Create | Card for one coffee type (Vietnamese name, pronunciation, description, color accent)          |
| `src/pages/Coffee.tsx`                     | Create | Full `/coffee` page with three sections                                                       |
| `src/App.tsx`                              | Modify | Lazy-import `Coffee` page + add `/coffee` route                                               |
| `src/pages/MorePage.tsx`                   | Modify | Add "Vietnam" section with link to `/coffee`                                                  |
| `src/pages/Places.tsx`                     | Modify | Read initial `categoryFilter` from route state so "Ver en mapa" lands with cafés pre-filtered |

---

### Task 1: Add `cafe` PlaceCategory and its visual config

**Files:**

- Modify: `src/types/index.ts`
- Modify: `src/utils/places.ts`

**Interfaces:**

- Produces: `PlaceCategory` now includes `'cafe'`; `CATEGORY_CONFIG['cafe']` and updated `FILTER_CATEGORIES` available to all consumers

- [ ] **Step 1: Add `'cafe'` to `PlaceCategory` in `src/types/index.ts`**

  Current union (line ~9):

  ```ts
  export type PlaceCategory =
    | 'temple'
    | 'nature'
    | 'city'
    | 'restaurant'
    | 'market'
    | 'beach'
    | 'museum'
    | 'hotel'
    | 'other'
  ```

  Replace with:

  ```ts
  export type PlaceCategory =
    | 'temple'
    | 'nature'
    | 'city'
    | 'restaurant'
    | 'market'
    | 'beach'
    | 'museum'
    | 'hotel'
    | 'cafe'
    | 'other'
  ```

- [ ] **Step 2: Add `Coffee` to the lucide-react import in `src/utils/places.ts`**

  Current import (line 1):

  ```ts
  import {
    Church,
    TreePine,
    Building2,
    Utensils,
    ShoppingBag,
    MapPin,
    Landmark,
    Hotel,
    type LucideIcon,
  } from 'lucide-react'
  ```

  Replace with:

  ```ts
  import {
    Church,
    TreePine,
    Building2,
    Utensils,
    ShoppingBag,
    MapPin,
    Landmark,
    Hotel,
    Coffee,
    type LucideIcon,
  } from 'lucide-react'
  ```

- [ ] **Step 3: Add `cafe` entry to `CATEGORY_CONFIG` in `src/utils/places.ts`**

  Insert before the `other` entry:

  ```ts
  cafe: {
    label: 'Café',
    icon: Coffee,
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-100 dark:bg-amber-900/40',
    markerColor: '#b45309',
  },
  ```

- [ ] **Step 4: Add `'cafe'` to `FILTER_CATEGORIES` in `src/utils/places.ts`**

  Current array:

  ```ts
  export const FILTER_CATEGORIES: PlaceCategory[] = [
    'temple',
    'nature',
    'city',
    'restaurant',
    'market',
    'beach',
    'museum',
    'hotel',
    'other',
  ]
  ```

  Replace with:

  ```ts
  export const FILTER_CATEGORIES: PlaceCategory[] = [
    'temple',
    'nature',
    'city',
    'restaurant',
    'market',
    'beach',
    'museum',
    'hotel',
    'cafe',
    'other',
  ]
  ```

- [ ] **Step 5: Verify**

  ```bash
  cd /srv/data/proyectos/personal_github/travel-planner-pwa
  npm run lint && npm run build
  ```

  Expected: no errors. TypeScript will catch any `PlaceCategory` switch/exhaustive check mismatches.

- [ ] **Step 6: Commit**

  ```bash
  git add src/types/index.ts src/utils/places.ts
  git commit -m "feat(places): add cafe PlaceCategory with amber config"
  ```

---

### Task 2: Seed 5 café Place records

**Files:**

- Modify: `src/db/seed.ts` (append to the `places` array, before the closing `])` at line 1010)

**Interfaces:**

- Consumes: `PlaceCategory` includes `'cafe'` (Task 1)
- Produces: 5 Place records with `category: 'cafe'` visible to `usePlaces().getByCategory('cafe')`

- [ ] **Step 1: Append the 5 café records to the `places` array in `src/db/seed.ts`**

  Insert before the closing `])` of the `places` array (currently at line 1010), after the last existing record:

  ```ts
  // --- Cafés ---
  {
    id: uuid(),
    name: 'Cafe Giảng',
    description:
      'Emblemático rincón del casco antiguo de Hanói, venerado como el lugar de nacimiento del café de huevo, creado por el chef Nguyen Van Giang en 1946. Conserva una atmósfera nostálgica y bulliciosa perfecta para vivir el ambiente local auténtico.',
    category: 'cafe',
    location: {
      name: 'Hanói',
      lat: 21.03408,
      lng: 105.85082,
      address: '39 Nguyen Huu Huan, Hoan Kiem, Hanói',
    },
    openingHours: 'Abre a las 07:00',
    tips: [
      'Especialidad: café de huevo caliente, servido en un tazón de agua tibia para mantener su temperatura.',
      'Ambiente: mesas y taburetes diminutos a pie de suelo, llenos de historia.',
    ],
  },
  {
    id: uuid(),
    name: 'Loading T Café',
    description:
      'Escondida en el primer piso de un precioso edificio de arquitectura colonial francesa, combina el aire retro con bebidas artesanales impecables. El café se saboriza con canela durante el filtrado.',
    category: 'cafe',
    location: {
      name: 'Hanói',
      lat: 21.02861,
      lng: 105.84153,
      address: 'Cao Bá Quát, Ba Đình, Hanói',
    },
    openingHours: 'Abre a las 08:00',
    tips: [
      'Especialidad: café vietnamita saborizado con canela durante el filtrado.',
      'Ambiente: íntimo, acogedor, con suelos de baldosas antiguas y paredes de ladrillo visto.',
    ],
  },
  {
    id: uuid(),
    name: 'C.O.C Legacy Specialty Coffee',
    description:
      'Para quienes buscan una transición entre los sabores hiper-dulces tradicionales y el café de especialidad moderno, en pleno Old Quarter de Hanói. Considerado por muchos viajeros como el mejor balance de café de coco y café de sal de la ciudad.',
    category: 'cafe',
    location: {
      name: 'Hanói',
      lat: 21.03371,
      lng: 105.84952,
      address: 'Hàng Bông, Hoan Kiem, Hanói',
    },
    openingHours: 'Abre a las 08:30',
    tips: [
      'Especialidad: el mejor balance de café de coco y café de sal de Hanói.',
      'Ambiente: moderno, cuidado y con un enfoque muy artesanal.',
    ],
  },
  {
    id: uuid(),
    name: 'The Workshop Coffee',
    description:
      'Situado en la planta alta de un antiguo edificio industrial, es considerado el pionero del movimiento de café de especialidad en Saigón. Ofrece granos locales de Da Lat y métodos de extracción manual.',
    category: 'cafe',
    location: {
      name: 'Ho Chi Minh',
      lat: 10.77411,
      lng: 106.70141,
      address: '27 Ngô Đức Kế, Bến Nghé, Quận 1, Ho Chi Minh',
    },
    openingHours: 'Abre a las 08:00',
    tips: [
      'Especialidad: métodos de extracción manual (V60, Siphon, Chemex) con granos de Da Lat.',
      'Ambiente: estilo loft urbano, muy amplio y con una barra central espectacular.',
    ],
  },
  {
    id: uuid(),
    name: '96B Cafe & Roastery',
    description:
      'Cafetería de diseño contemporáneo que funciona como tostadero propio, dedicada a educar el paladar y experimentar con granos de robusta y arábica producidos de forma sostenible en Vietnam.',
    category: 'cafe',
    location: {
      name: 'Ho Chi Minh',
      lat: 10.78226,
      lng: 106.68779,
      address: '96B Võ Thị Sáu, Quận 3, Ho Chi Minh',
    },
    openingHours: 'Abre a las 08:00',
    tips: [
      'Especialidad: cafés de filtro con perfiles de tueste ligero y bebidas experimentales de autor.',
      'Ambiente: minimalista, moderno y muy enfocado en la cultura del café científico.',
    ],
  },
  ```

- [ ] **Step 2: Verify**

  ```bash
  npm run lint && npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Manual DB test**

  Run `npm run dev`, open the app, navigate to **Más → Ajustes → Reset de la base de datos**, then go to **Mapa**. You should see 5 amber markers in Vietnam (3 in Hanói, 2 in the south). The "Café" filter option should appear in the category dropdown.

- [ ] **Step 4: Commit**

  ```bash
  git add src/db/seed.ts
  git commit -m "feat(seed): add 5 Vietnamese café locations"
  ```

---

### Task 3: CoffeeTypeCard component

**Files:**

- Create: `src/components/coffee/CoffeeTypeCard.tsx`

**Interfaces:**

- Produces:

  ```ts
  interface CoffeeTypeCardProps {
    nameVi: string // Vietnamese name, e.g. "Cà phê sữa đá"
    namePronunciation: string // e.g. "cá-fé súa da"
    nameEs: string // Spanish subtitle, e.g. "Café con leche condensada y hielo"
    description: string
    accentColor: 'blue' | 'cream' | 'gray' | 'green'
    badge?: string // optional label, e.g. "El clásico nacional"
  }
  export default CoffeeTypeCard // default export
  ```

- [ ] **Step 1: Create `src/components/coffee/CoffeeTypeCard.tsx`**

  ```tsx
  interface CoffeeTypeCardProps {
    nameVi: string
    namePronunciation: string
    nameEs: string
    description: string
    accentColor: 'blue' | 'cream' | 'gray' | 'green'
    badge?: string
  }

  const ACCENT: Record<CoffeeTypeCardProps['accentColor'], { bar: string; bg: string }> = {
    blue: { bar: 'bg-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    cream: { bar: 'bg-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    gray: { bar: 'bg-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/40' },
    green: { bar: 'bg-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  }

  function CoffeeTypeCard({
    nameVi,
    namePronunciation,
    nameEs,
    description,
    accentColor,
    badge,
  }: CoffeeTypeCardProps) {
    const { bar, bg } = ACCENT[accentColor]

    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-slate-700 ${bg}`}
      >
        <div className={`absolute bottom-0 left-0 top-0 w-1 ${bar}`} aria-hidden="true" />
        <div className="py-4 pl-5 pr-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{nameVi}</h3>
              <span className="mt-0.5 inline-block text-[11px] text-gray-500 dark:text-gray-400">
                /{namePronunciation}/
              </span>
            </div>
            {badge && (
              <span className="rounded-full bg-travel-blue-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{nameEs}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    )
  }

  export default CoffeeTypeCard
  ```

- [ ] **Step 2: Verify**

  ```bash
  npm run lint && npm run build
  ```

  Expected: no errors. The component is not yet imported anywhere — that is fine.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/coffee/CoffeeTypeCard.tsx
  git commit -m "feat(coffee): add CoffeeTypeCard component"
  ```

---

### Task 4: Coffee page

**Files:**

- Create: `src/pages/Coffee.tsx`

**Interfaces:**

- Consumes:
  - `CoffeeTypeCard` default export from `../components/coffee/CoffeeTypeCard`
  - `usePlaces` from `../hooks/usePlaces` — specifically `getByCategory('cafe')`
  - `Button` from `../components/common/Button`
  - `Place` type from `../types`
  - React Router: `useNavigate`
  - lucide-react: `ArrowLeft`, `Coffee`, `MapPin`

- [ ] **Step 1: Create `src/pages/Coffee.tsx`**

  ```tsx
  import { useMemo } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { ArrowLeft, Coffee, MapPin } from 'lucide-react'
  import { usePlaces } from '../hooks/usePlaces'
  import Button from '../components/common/Button'
  import CoffeeTypeCard from '../components/coffee/CoffeeTypeCard'
  import type { Place } from '../types'

  const COFFEE_TYPES = [
    {
      nameVi: 'Cà phê sữa đá',
      namePronunciation: 'cá-fé súa da',
      nameEs: 'Café con leche condensada y hielo',
      description:
        'El gran clásico vietnamita. Un café robusta intensamente oscuro y amargo que gotea lentamente a través de un filtro metálico (phin) directamente sobre una generosa capa de leche condensada, para luego mezclarse con abundante hielo picado.',
      accentColor: 'blue' as const,
      badge: 'El clásico nacional',
    },
    {
      nameVi: 'Cà phê trứng',
      namePronunciation: 'cá-fé trung',
      nameEs: 'Café de huevo',
      description:
        'Originario de Hanói. Base de café negro fuerte coronada por una crema densa, dulce y aterciopelada hecha de yemas de huevo batidas con azúcar y leche condensada. Sabe a un tiramisú líquido.',
      accentColor: 'cream' as const,
    },
    {
      nameVi: 'Cà phê muối',
      namePronunciation: 'cá-fé muói',
      nameEs: 'Café de sal',
      description:
        'Una combinación sorprendente nacida en Hue. La mezcla de café negro y leche condensada se cubre con una crema salada. La sal mitiga el amargor del grano robusta y resalta su dulzor caramelizado.',
      accentColor: 'gray' as const,
    },
    {
      nameVi: 'Cà phê cốt dừa',
      namePronunciation: 'cá-fé cot zua',
      nameEs: 'Café de coco',
      description:
        'Prácticamente un postre frappé. Café vietnamita mezclado con hielo granizado de crema de coco y leche condensada. Refrescante e ideal para los días más calurosos.',
      accentColor: 'green' as const,
    },
  ]

  const VOCABULARY = [
    { word: 'Sữa', pronunciation: '"súa"', meaning: 'Leche condensada' },
    { word: 'Đen', pronunciation: '"den"', meaning: 'Negro (solo)' },
    { word: 'Đá', pronunciation: '"da"', meaning: 'Con hielo' },
    { word: 'Nóng', pronunciation: '"nóng"', meaning: 'Caliente' },
    { word: 'Đường', pronunciation: '"duong"', meaning: 'Azúcar' },
    { word: 'Không đường', pronunciation: '"jóng duong"', meaning: 'Sin azúcar' },
  ]

  const COMBINATIONS = [
    {
      phrase: 'Cà phê sữa đá',
      pronunciation: 'cá-fé súa da',
      meaning: 'Café con leche condensada y hielo',
    },
    {
      phrase: 'Cà phê sữa nóng',
      pronunciation: 'cá-fé súa nóng',
      meaning: 'Café con leche condensada caliente',
    },
    {
      phrase: 'Cà phê đen đá',
      pronunciation: 'cá-fé den da',
      meaning: 'Café negro con hielo (puede venir ligeramente endulzado)',
    },
    {
      phrase: 'Cà phê trứng',
      pronunciation: 'cá-fé trung',
      meaning: 'Café de huevo',
    },
    {
      phrase: 'Cà phê muối',
      pronunciation: 'cá-fé muói',
      meaning: 'Café de sal',
    },
  ]

  interface CafeCardProps {
    cafe: Place
    onMapClick: () => void
  }

  function CafeCard({ cafe, onMapClick }: CafeCardProps) {
    const specialty = cafe.tips?.[0]
    const ambiance = cafe.tips?.[1]

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">{cafe.name}</h4>
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {cafe.location.name}
          </span>
        </div>
        {specialty && (
          <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">{specialty}</p>
        )}
        {ambiance && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{ambiance}</p>}
        <button
          type="button"
          onClick={onMapClick}
          className="mt-2.5 flex items-center gap-1 text-xs font-medium text-travel-blue-600 hover:underline dark:text-travel-blue-400"
        >
          <MapPin className="h-3 w-3" aria-hidden="true" />
          Ver en mapa
        </button>
      </div>
    )
  }

  function CoffeePage() {
    const navigate = useNavigate()
    const { getByCategory, loading } = usePlaces()

    const cafePlaces = useMemo(() => getByCategory('cafe'), [getByCategory])
    const hanoiCafes = useMemo(
      () => cafePlaces.filter((p) => p.location.name === 'Hanói'),
      [cafePlaces]
    )
    const hcmCafes = useMemo(
      () => cafePlaces.filter((p) => p.location.name === 'Ho Chi Minh'),
      [cafePlaces]
    )

    const goToMap = () => navigate('/places', { state: { category: 'cafe' } })

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
            <Coffee className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Café de Vietnam</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tipos, dónde tomarlo y cómo pedirlo
            </p>
          </div>
        </div>

        {/* Section A: Coffee types */}
        <section aria-labelledby="coffee-types-heading">
          <h2
            id="coffee-types-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Tipos de café
          </h2>
          <div className="space-y-3">
            {COFFEE_TYPES.map((type) => (
              <CoffeeTypeCard key={type.nameVi} {...type} />
            ))}
          </div>
        </section>

        {/* Section B: Café locations */}
        {!loading && cafePlaces.length > 0 && (
          <section aria-labelledby="cafes-heading">
            <h2
              id="cafes-heading"
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Dónde tomarlo
            </h2>
            <div className="space-y-4">
              {hanoiCafes.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span role="img" aria-label="Vietnam">
                      🇻🇳
                    </span>{' '}
                    Hanói
                  </h3>
                  <div className="space-y-2.5">
                    {hanoiCafes.map((cafe) => (
                      <CafeCard key={cafe.id} cafe={cafe} onMapClick={goToMap} />
                    ))}
                  </div>
                </div>
              )}
              {hcmCafes.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span role="img" aria-label="Vietnam">
                      🇻🇳
                    </span>{' '}
                    Ho Chi Minh
                  </h3>
                  <div className="space-y-2.5">
                    {hcmCafes.map((cafe) => (
                      <CafeCard key={cafe.id} cafe={cafe} onMapClick={goToMap} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button variant="secondary" onClick={goToMap} className="mt-3 w-full py-2.5 text-sm">
              <MapPin className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Ver todos en el mapa
            </Button>
          </section>
        )}

        {/* Section C: Ordering guide */}
        <section aria-labelledby="ordering-heading">
          <h2
            id="ordering-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Cómo pedirlo
          </h2>

          {/* Vocabulary */}
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

          {/* Combinations */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Cómo ordenar</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {COMBINATIONS.map((c) => (
                <div key={c.phrase} className="px-4 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{c.phrase}</span>
                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      /{c.pronunciation}/
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{c.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tip */}
          <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
              <span className="font-semibold">Tip:</span> Si quieres tu café sin azúcar, di
              claramente <span className="font-semibold italic">Không đường</span> ("jóng duong").
              De lo contrario, casi cualquier café negro vendrá ligeramente endulzado para
              equilibrar su potente amargor.
            </p>
          </div>
        </section>
      </div>
    )
  }

  export default CoffeePage
  ```

- [ ] **Step 2: Verify**

  ```bash
  npm run lint && npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/Coffee.tsx src/components/coffee/CoffeeTypeCard.tsx
  git commit -m "feat(coffee): add Coffee page with types, cafes and ordering guide"
  ```

---

### Task 5: Wire routing, navigation, and Places pre-filter

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/pages/MorePage.tsx`
- Modify: `src/pages/Places.tsx`

**Interfaces:**

- Consumes: `CoffeePage` default export from `./pages/Coffee`
- Produces: `/coffee` route active; MorePage "Vietnam" section links to it; Places reads `location.state.category` on mount to pre-apply the café filter

- [ ] **Step 1: Add lazy import and route in `src/App.tsx`**

  After the existing `const MorePage = lazy(...)` line, add:

  ```tsx
  const Coffee = lazy(() => import('./pages/Coffee'))
  ```

  Inside `<Routes>`, after the `/more` route, add:

  ```tsx
  <Route path="/coffee" element={<Coffee />} />
  ```

- [ ] **Step 2: Add "Vietnam" section in `src/pages/MorePage.tsx`**

  Add `Coffee` to the lucide-react import at the top of the file:

  ```tsx
  import { FileText, Shield, MapPin, ChevronRight, Backpack, Coffee } from 'lucide-react'
  ```

  Insert the new section **before** the existing `<section aria-labelledby="help-heading">` block:

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

- [ ] **Step 3: Pre-apply category filter in `src/pages/Places.tsx`**

  Add `useLocation` to the react-router-dom import:

  ```tsx
  import { useLocation } from 'react-router-dom'
  ```

  Add inside `function Places()`, before the existing `useState` declarations:

  ```tsx
  const location = useLocation()
  ```

  Replace the existing `categoryFilter` state initialization:

  ```tsx
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | 'all'>('all')
  ```

  with:

  ```tsx
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | 'all'>(
    (location.state as { category?: PlaceCategory } | null)?.category ?? 'all'
  )
  ```

  This reads the category from router state on mount, so navigating from the coffee page with `{ state: { category: 'cafe' } }` pre-selects the Café filter.

- [ ] **Step 4: Verify**

  ```bash
  npm run lint && npm run build
  ```

  Expected: no errors.

- [ ] **Step 5: Manual end-to-end test**

  Run `npm run dev`. Reset the DB first (Más → Ajustes → Reset). Then:

  1. Go to **Más** — confirm "Vietnam" section appears above "Ayuda y recursos" with coffee icon.
  2. Tap **Guía del Café** — confirm `/coffee` loads with all three sections.
  3. Scroll to "Dónde tomarlo" — 3 Hanói cafés and 2 Ho Chi Minh cafés visible.
  4. Tap **Ver en mapa** — confirm Places page opens in map view with the Café filter pre-selected (amber markers visible, other categories hidden).
  5. Go back, scroll to "Tipos de café" — 4 cards with colored left accent and correct text.
  6. Scroll to "Cómo pedirlo" — vocabulary grid, combinations, amber pro-tip banner.
  7. Go to **Mapa** directly — confirm 5 amber markers appear across Vietnam and the Café option is in the filter dropdown.

- [ ] **Step 6: Commit**

  ```bash
  git add src/App.tsx src/pages/MorePage.tsx src/pages/Places.tsx
  git commit -m "feat(coffee): add /coffee route, MorePage entry, and Places pre-filter"
  ```

---

## Self-Review

**Spec coverage check:**

| Spec requirement                                      | Covered by                                        |
| ----------------------------------------------------- | ------------------------------------------------- |
| New `cafe` PlaceCategory with amber config            | Task 1                                            |
| 5 cafés seeded into `places` DB                       | Task 2                                            |
| Café markers on main map                              | Task 2 (auto via seed) + Task 1 (category config) |
| `CoffeeTypeCard` with 4 accent colors                 | Task 3                                            |
| `/coffee` page with 3 sections                        | Task 4                                            |
| Section A: 4 coffee type cards                        | Task 4                                            |
| Section B: café cards grouped by city, DB-driven      | Task 4                                            |
| Section B: "Ver en mapa" CTA                          | Task 4 + Task 5                                   |
| Section C: vocabulary grid                            | Task 4                                            |
| Section C: combinations list                          | Task 4                                            |
| Section C: pro-tip amber banner                       | Task 4                                            |
| `/coffee` route in App.tsx                            | Task 5                                            |
| MorePage "Vietnam" section with link                  | Task 5                                            |
| Places page pre-filtered when coming from coffee page | Task 5                                            |
| `cafe` filter option in Places dropdown               | Task 1 (FILTER_CATEGORIES)                        |

**Placeholder scan:** No TBDs, TODOs, or "similar to Task N" references. All code blocks are complete.

**Type consistency:**

- `getByCategory('cafe')` — `'cafe'` is valid after Task 1 adds it to `PlaceCategory`. ✓
- `CoffeeTypeCard` props used in Task 4 match the interface defined in Task 3. ✓
- `location.state` cast matches the shape passed in Task 4's `navigate('/places', { state: { category: 'cafe' } })`. ✓
- `CoffeePage` exported as default in Task 4, imported as `Coffee` (default import) in Task 5. ✓
