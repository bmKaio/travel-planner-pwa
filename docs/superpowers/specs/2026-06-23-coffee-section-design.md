# Coffee Section — Design Spec

**Date:** 2026-06-23  
**Status:** Approved  
**Route:** `/coffee`

---

## Overview

A dedicated page for Vietnamese coffee culture accessible from `MorePage`. Covers four classic coffee types, five curated café locations (seeded into the existing `places` DB so they appear on the main map), and a practical ordering guide. No new DB table; no DB version bump.

---

## Data Layer

### New `PlaceCategory` value: `cafe`

Add `'cafe'` to the `PlaceCategory` union in `src/types/index.ts`.

Category config in `src/utils/places.ts`:

```
label:       'Café'
icon:        Coffee (lucide-react)
textClass:   'text-amber-700 dark:text-amber-300'
bgClass:     'bg-amber-100 dark:bg-amber-900/40'
markerColor: '#b45309'
```

Add `cafe` to `FILTER_CATEGORIES` so it appears as a filter option in the Places page.

### Seed data — 5 new Place records (category: `cafe`)

| id (uuid) | name                          | city        | lat      | lng       | speciality                                         |
| --------- | ----------------------------- | ----------- | -------- | --------- | -------------------------------------------------- |
| —         | Cafe Giảng                    | Hanói       | 21.03408 | 105.85082 | Café de huevo (cà phê trứng)                       |
| —         | Loading T Café                | Hanói       | 21.02861 | 105.84153 | Café con canela durante el filtrado                |
| —         | C.O.C Legacy Specialty Coffee | Hanói       | 21.03371 | 105.84952 | Café de coco y café de sal                         |
| —         | The Workshop Coffee           | Ho Chi Minh | 10.77411 | 106.70141 | Métodos de extracción manual (V60, Siphon, Chemex) |
| —         | 96B Cafe & Roastery           | Ho Chi Minh | 10.78226 | 106.68779 | Tueste propio, perfiles ligeros                    |

Each record includes:

- `description`: one paragraph combining specialty + ambiance (from user-provided content)
- `openingHours`: from user-provided data
- `tips`: specialty + ambiance as array items
- `location.address`: street address

---

## Page: `src/pages/Coffee.tsx`

Lazy-loaded, added to `App.tsx` as `<Route path="/coffee" element={<Coffee />} />`.

### Layout (top to bottom)

```
[ Back button ]

[ Hero header ]
  Title: "Café de Vietnam"
  Subtitle: brief intro line

[ Section A: Tipos de café ]
  4 × CoffeeTypeCard

[ Section B: Dónde tomarlo ]
  Subsection "Hanói" → 3 café cards
  Subsection "Ho Chi Minh" → 2 café cards
  [ "Ver todos en el mapa" button → /places filtered to cafe ]

[ Section C: Cómo pedirlo ]
  Vocabulary grid (6 words)
  Combinations list (5 phrases)
  Pro tip banner (yellow)
```

### Component: `src/components/coffee/CoffeeTypeCard.tsx`

Props:

```ts
interface CoffeeTypeCardProps {
  nameVi: string // e.g. "Cà phê sữa đá"
  namePronunciation: string // e.g. "cá-fé súa da"
  nameEs: string // e.g. "Café con leche condensada y hielo"
  description: string
  accentColor: 'blue' | 'cream' | 'gray' | 'green' // one per type
  badge?: string // e.g. "El clásico nacional"
}
```

Renders a card with: colored left border accent, Vietnamese name + pronunciation chip, Spanish subtitle, description paragraph, optional badge.

Accent color mapping (Tailwind):

- `blue` → `border-sky-400`, `bg-sky-50 dark:bg-sky-900/20` (sữa đá — hielo)
- `cream` → `border-amber-300`, `bg-amber-50 dark:bg-amber-900/20` (trứng — huevo)
- `gray` → `border-slate-400`, `bg-slate-50 dark:bg-slate-800/40` (muối — sal)
- `green` → `border-emerald-400`, `bg-emerald-50 dark:bg-emerald-900/20` (cốt dừa — coco)

### Section B — Café location cards

Read from DB: `const { getByCategory } = usePlaces()` → `getByCategory('cafe')`. Cards are inline (no separate component). Each card shows:

- Name (bold)
- City badge
- Specialty line
- Ambiance line
- "Ver en mapa" button → `navigate('/places')` (map view shows all places including cafés; user can filter by Café category)

Since `usePlaces` returns a reactive live query, the cards stay in sync with the seed data automatically.

### Section C — Ordering guide

Static content. Two subsections:

**Vocabulario esencial** — 2-column grid:

| Palabra     | Pronunciación | Significado      |
| ----------- | ------------- | ---------------- |
| Sữa         | "súa"         | Leche condensada |
| Đen         | "den"         | Negro (solo)     |
| Đá          | "da"          | Con hielo        |
| Nóng        | "nóng"        | Caliente         |
| Đường       | "duong"       | Azúcar           |
| Không đường | "jóng duong"  | Sin azúcar       |

**Combinaciones** — list of 5 full phrases with pronunciation.

**Pro tip banner** — yellow background card: "Si quieres tu café sin nada de azúcar, di claramente 'Không đường'. De lo contrario, casi cualquier café negro vendrá ligeramente endulzado."

---

## Navigation

### `src/App.tsx`

```tsx
const Coffee = lazy(() => import('./pages/Coffee'))
// ...
<Route path="/coffee" element={<Coffee />} />
```

### `src/pages/MorePage.tsx`

Add new section "Vietnam" above "Ayuda y recursos":

```tsx
<section aria-labelledby="vietnam-heading">
  <h2 id="vietnam-heading" ...>Vietnam</h2>
  <SectionLink
    to="/coffee"
    icon={<Coffee className="h-6 w-6" />}
    title="Guía del Café"
    description="Tipos de café vietnamita, dónde tomarlo y cómo pedirlo."
    onClick={() => navigate('/coffee')}
  />
</section>
```

---

## Files changed

| File                                       | Change                                                            |
| ------------------------------------------ | ----------------------------------------------------------------- |
| `src/types/index.ts`                       | Add `'cafe'` to `PlaceCategory` union                             |
| `src/utils/places.ts`                      | Add `cafe` entry to `CATEGORY_CONFIG`; add to `FILTER_CATEGORIES` |
| `src/db/seed.ts`                           | Add 5 Place records with category `cafe`                          |
| `src/pages/Coffee.tsx`                     | CREATE — new page                                                 |
| `src/components/coffee/CoffeeTypeCard.tsx` | CREATE — coffee type card component                               |
| `src/App.tsx`                              | Add lazy import + route `/coffee`                                 |
| `src/pages/MorePage.tsx`                   | Add "Vietnam" section with coffee link                            |

No new DB tables. No `DB_VERSION` bump required (adding records to existing `places` table, no schema change).

---

## Out of scope

- User-editable coffee types or phrases (content is curated/static)
- Coffee section for Cambodia (not relevant to the trip)
- Rating or review system for cafés
- Photo gallery
