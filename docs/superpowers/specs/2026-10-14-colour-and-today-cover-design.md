# Colour across v2 trips and a photo cover on "Hoy" — Design

- **Date:** 2026-10-14
- **Branch:** `feat/viaje-peru`
- **Status:** approved in conversation (parts 1–2); pending written-spec review
- **Builds on:** `2026-10-14-responsive-guide-topics-design.md` (guide topic colours)

## 1. Intent

The Guide hub's per-topic colours (stripe + soft icon circle) are liked. The rest of the v2 app is
almost all white and grey. Carry the same colour language across Hoy, Itinerario, Ayuda, the nav
and the trip switcher. On "Hoy", replace the bare "Hoy" heading with a cover card: a photo of the
day's place, with "Hoy", the place and the date on top.

### Success criteria

1. Every content type has one fixed colour, used the same way everywhere (table in §2).
2. Cards follow the Guide entry pattern: coloured left edge + icon in a soft circle of the same hue.
3. The active Itinerario tab and the active nav item take their section colour.
4. "Hoy" opens with a cover card showing the day's photo, "Hoy · Día N de M", the place and the
   date; the photo credit (author, licence, link) is visible on the card.
5. Photos ship inside the app and show offline from the first launch.
6. Light and dark mode both keep the existing contrast rule (strong tone ≥ 3:1 against soft and
   card); text on the photo stays readable (gradient overlay).
7. A day without a cover shows the same card on a plain turquoise background.

### Decisions taken (with rationale)

| Decision                                                                                     | Rationale                                                                                          |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Reuse the six guide topic tokens; no new palette.                                            | Contrast and dark values already checked; one visual language.                                     |
| Add only `--trip-done-soft` (green soft) for the checklist circle.                           | Every other soft tone exists (`action-soft`, `urgent-soft`, topic softs).                          |
| Photos bundled (WebP, ~100 KB each) and precached.                                           | User choice (option A): offline from day one. Cost ≈ 1.1 MB more install size.                     |
| Photos from Wikimedia Commons, free licences only (CC0, PD, CC BY, CC BY-SA).                | Reusable with attribution; credit shown on the card as the licences require.                       |
| The place on the card is authored per day (`cover.place`), not derived from `cities`.        | Many days pass through several places (20 Oct: Arequipa → Yanque reads best as "Valle del Colca"). |
| `cover` is optional on a day.                                                                | Other trips may have no photos; the card falls back to a plain colour.                             |
| Out of scope: per-city colours, photos elsewhere (Itinerario, Guía), legacy Vietnam screens. | YAGNI; legacy app is frozen.                                                                       |

## 2. Colour map

One shared style map, `src/trips/components/sectionStyle.ts`, holds literal class strings per
section (Tailwind only generates classes it finds verbatim), with the same shape as
`GUIDE_TOPIC_STYLE`: `{ icon, edge, stripe, ink, soft }`.

| Section   | Token (strong / soft)          | Used in                                                               |
| --------- | ------------------------------ | --------------------------------------------------------------------- |
| plan      | `trip-topic-city` (turquoise)  | PlanList, Itinerario "Plan" tab, NowCard when the item is a plan item |
| eat       | `trip-topic-food` (terracotta) | EatList, "Comer" tab                                                  |
| see       | `trip-topic-history` (amber)   | SeeList, FreeTimeIdeas, "Visitar" tab                                 |
| leg       | `trip-topic-tip` (indigo)      | LegList / "Transporte"                                                |
| stay      | `trip-topic-drink` (purple)    | StayCard, StayRow                                                     |
| emergency | `trip-urgent` (red)            | EmergencyCard (unchanged look)                                        |
| consular  | `trip-topic-tip` (indigo)      | "Embajada y consulados" cards                                         |
| health    | `trip-topic-food` (terracotta) | "Salud y precauciones"                                                |
| private   | `trip-topic-drink` (purple)    | Imported help cards, contacts, documents                              |
| checklist | `trip-done` (green)            | ChecklistSection heading icon, groups                                 |
| notes     | `trip-topic-history` (amber)   | NotesEditor                                                           |

- **Nav (`TripNav`)**: the active item gets a 3px top bar and icon in its colour — Hoy `trip-action`,
  Itinerario `trip-topic-city`, Guía `trip-topic-curiosity`, Ayuda `trip-urgent`. Inactive items
  stay muted.
- **Itinerario `TabBar`**: the active tab uses its section's soft background and strong text.
- **Section headings** on Hoy and Ayuda get a small icon in a soft circle of their colour.
- **Trip switcher (`TripCard`)**: a coloured top stripe per trip, cycling through the topic tokens
  in registry order.
- Unchanged: page background, action buttons (blue), done/urgent semantics.

## 3. Data model

```ts
// src/trips/types.ts
export interface DayCover {
  /** Place shown on the card, e.g. "Valle del Colca". */
  place: string
  /** Bundled image URL (Vite asset import from the content file). */
  image: string
  /** Describes the photo for screen readers. */
  alt: string
  /** "Autor · CC BY-SA 4.0" */
  credit: string
  /** Wikimedia Commons file page (https). */
  creditUrl: string
}

export interface TripDay {
  // …existing fields
  cover?: DayCover
}
```

- Not indexed: no `TripsDB` version bump. Synced with the day as today.
- Images live in `src/trips/content/images/<tripId>/<slug>.webp` and are imported by the content
  file, so they are hashed and emitted by Vite and only loaded with that trip's content chunk.
- `vite.config.ts` workbox `globPatterns` adds `webp`, so the photos are precached.

## 4. Today cover card

`src/trips/components/DayCoverCard.tsx`, rendered by `TodayPage` in place of `PageHeader`:

- `rounded-[20px]`, `overflow-hidden`, height ~200px on phones, ~260px from `sm`.
- `<img>` with `object-cover`, `alt`, `loading="eager"`, `decoding="async"`; a bottom-to-top dark
  gradient overlay for legibility.
- Text (white): small caps line "Hoy · Día N de M" (existing `formatDayHeading` parts), the place
  as the `h1` (`text-[32px] font-bold`), the date line; credit in `text-xs` at the bottom right as
  a link to `creditUrl` (`target="_blank" rel="noopener noreferrer"`).
- No cover: same layout on `bg-trip-topic-city` with white text (contrast checked in light and dark); the
  place falls back to the trip name.
- The "Faltan N días" / "Viaje terminado" banner stays below the card.

## 5. Content (Peru)

Eleven photos (one reused):

| Day | Place           | Photo              |
| --- | --------------- | ------------------ |
| 17  | Lima            | Miraflores coast   |
| 18  | Lima            | Plaza de Armas     |
| 19  | Arequipa        | city with El Misti |
| 20  | Valle del Colca | terraces           |
| 21  | Puno            | Titicaca bay       |
| 22  | Lago Titicaca   | Uros islands       |
| 23  | Cusco           | Plaza de Armas     |
| 24  | Cusco           | San Blas           |
| 25  | Valle Sagrado   | Ollantaytambo      |
| 26  | Machu Picchu    | Machu Picchu       |
| 27  | Cusco           | reuse 23           |
| 28  | Madrid          | Madrid             |

Process: pick each file on Wikimedia Commons, record author, licence and file page; download the
original, convert with `ffmpeg` (libwebp) to 1200px wide, quality ~70, target ≤ 150 KB; list the
credits in the content file. `seedVersion` +1.

## 6. Testing

TDD with Vitest (`npm test`):

- `content.test.ts`: for every day with a `cover` — non-empty `place`, `alt`, `credit`;
  `creditUrl` matches `^https://commons\.wikimedia\.org/`; `image` non-empty. Peru has a cover on
  every day.
- Pure helper (if any logic is extracted, e.g. the cover heading parts or the switcher stripe
  cycling) gets unit tests.
- Existing tests stay green; then `npm run lint`, `npm run format:check`, `npm run build`.
- Manual pass by the owner: each screen in light and dark, cover legibility on every photo,
  offline reload of "Hoy" after first load.
