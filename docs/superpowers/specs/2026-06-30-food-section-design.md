# Food Section — Design Spec

**Date:** 2026-06-30
**Status:** Approved
**Route:** `/food`

---

## Overview

A dedicated page for Vietnamese food culture, mirroring `/coffee` (see
`2026-06-23-coffee-section-design.md`), plus a "typical food" panel inside each city's
detail view in `Places.tsx`. Unlike Coffee, this content is **purely static reference
data** — no new `PlaceCategory` and no new `Place` records. `'restaurant'` remains the
category used to mark real food places on the map; `'food'` is not added to
`PlaceCategory`.

---

## Data Layer

### `src/data/food.ts` (new)

```ts
export interface Dish {
  name: string
  description: string
  exclusive?: boolean // true = exclusive to this city (shows a badge)
}

export const NATIONAL_DISHES: Dish[] = [
  /* Pho, Goi Cuon, Banh Mi, Com Tam, Nuoc Mam (salsa de pescado) */
]

export const CITY_DISHES: Partial<Record<CityId, Dish[]>> = {
  hanoi: [
    /* Pho Ga, Bun Cha, Banh Cuon */
  ],
  hue: [
    /* Nem Lui, Banh Beo, Bun Bo, Banh Bot Loc */
  ],
  'hoi-an': [
    /* Cao Lau (exclusive: true), Mi Quang, Banh Bao Vac, Com Ga */
  ],
  'ninh-binh': [
    /* Com Chay, Cabra (Thit De) */
  ],
}
```

`CityId` is imported from `../utils/cities`. No entries for `pu-luong`, `cat-ba`,
`siem-reap` (no data) — sections for those cities simply don't render, same pattern as
Coffee's "only render city subsection if it has items."

**Excluded by decision:**

- Ho Chi Minh dishes (Pho, Goi Cuon, Banh Mi, Com Tam) — not a separate group; they're
  already covered by `NATIONAL_DISHES` and HCMC isn't an itinerary stop in `CITIES`.
- "Café con huevo" for Hanoi — stays exclusive to `/coffee`, not duplicated here.

---

## Component: `src/components/food/DishCard.tsx`

```ts
interface DishCardProps {
  dish: Dish
}
```

Renders: dish name (bold), "Exclusivo" badge when `dish.exclusive`, description
paragraph. Plain card style matching `CafeCard`/list cards elsewhere (rounded-2xl,
border, shadow-sm, dark mode variants) — no per-dish accent color (unlike
`CoffeeTypeCard`, dishes don't need a color-coded visual taxonomy).

Reused in both `Food.tsx` and the `Places.tsx` city-detail panel.

---

## Page: `src/pages/Food.tsx`

Lazy-loaded, calcado de `Coffee.tsx`. Added to `App.tsx` as
`<Route path="/food" element={<Food />} />`.

### Layout (top to bottom)

```
[ Back button ]

[ Hero header ]
  Icon: Utensils (lucide-react)
  Title: "Comida de Vietnam"
  Subtitle: "Platos típicos, especialidades por ciudad y cómo pedirlos"

[ Section A: Platos nacionales ]
  NATIONAL_DISHES.map(DishCard)

[ Section B: Comida por ciudad ]
  Iterate CITIES (itinerary order, from utils/cities.ts)
  For each city with an entry in CITY_DISHES:
    Subsection "🇻🇳 {city.name}" → DishCard list
  (cities without dish data are skipped entirely)

[ Section C: Vocabulario y cómo pedir ]
  Vocabulary grid (standard set, proposed below)
  Pro tip banner
```

### Section C — vocabulary (standard set, proposed)

| Palabra   | Pronunciación | Significado                  |
| --------- | ------------- | ---------------------------- |
| Cay       | "cai"         | Picante                      |
| Không cay | "khôm cai"    | No picante                   |
| Chay      | "chai"        | Vegetariano                  |
| Ngon      | "ngon"        | Delicioso                    |
| Tính tiền | "tính tiền"   | La cuenta, por favor         |
| Không có  | "khôm có"     | Sin (p.ej. "sin cacahuetes") |

Pro tip banner: practical note about peanuts/allergies being common in Vietnamese
dishes and how to ask for a dish without an ingredient using "Không có + ingrediente".

This is curated-but-generic content (not trip-specific facts), flagged for the user to
spot-check before relying on it during the trip — same caveat as any new Vietnamese
phrasing introduced without a native-speaker source.

---

## Integration in `src/pages/Places.tsx` — city detail panel

When `selectedCity` is a real `CityId` (not `'all'`, not `OTHER_CITY_ID`, not the grid
view) **and** `CITY_DISHES[selectedCity]` has entries, render a collapsible block right
below the header row (above the search/filter row):

- Collapsed by default. Trigger: a chip/button "Comida típica ({n})" with a chevron.
- Expanding reveals the `DishCard` list for that city in a stacked panel.
- Not rendered for `'all'`, `OTHER_CITY_ID`, or cities with no `CITY_DISHES` entry
  (pu-luong, cat-ba, siem-reap) — matches the "only show what has data" pattern from
  Coffee.
- Local component state (`useState<boolean>`) in `Places.tsx`, reset implicitly by city
  change (key on `selectedCity` or reset in `handleSelectCity`/`handleBackToCities`).

---

## Navigation

### `src/App.tsx`

```tsx
const Food = lazy(() => import('./pages/Food'))
// ...
<Route path="/food" element={<Food />} />
```

### `src/pages/MorePage.tsx`

Add a second `SectionLink` inside the existing "Vietnam" section, below "Guía del
Café":

```tsx
<SectionLink
  to="/food"
  icon={<Utensils className="h-6 w-6" />}
  title="Guía de Comida"
  description="Platos típicos de Vietnam y especialidades por ciudad."
  onClick={() => navigate('/food')}
/>
```

---

## Files changed

| File                               | Change                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| `src/data/food.ts`                 | CREATE — `Dish`, `NATIONAL_DISHES`, `CITY_DISHES`          |
| `src/components/food/DishCard.tsx` | CREATE — shared dish card component                        |
| `src/pages/Food.tsx`               | CREATE — new page                                          |
| `src/App.tsx`                      | Add lazy import + route `/food`                            |
| `src/pages/MorePage.tsx`           | Add "Guía de Comida" link under existing "Vietnam" section |
| `src/pages/Places.tsx`             | Add collapsible "Comida típica" panel in city-detail view  |

No new `PlaceCategory` value. No new `Place` records. No DB schema change, no
`DB_VERSION` bump.

---

## Out of scope

- New `PlaceCategory` for marking real food places on the map (`'restaurant'` already
  covers this; explicitly rejected during design)
- Ho Chi Minh as its own city group (not an itinerary stop)
- Dish data for Pu Luong, Cat Ba, Siem Reap (no data provided)
- User-editable dishes or vocabulary (content is curated/static)
- Cambodian food (not covered by user-provided data; trip itinerary includes Siem
  Reap/Phnom Penh but no dish list was given for them)
