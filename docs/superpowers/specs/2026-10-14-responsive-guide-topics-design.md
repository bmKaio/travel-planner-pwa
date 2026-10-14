# Responsive layout and guide topics for v2 trips — Design

- **Date:** 2026-10-14
- **Branch:** `feat/viaje-peru`
- **Status:** approved in conversation (parts 1–3); pending written-spec review
- **Builds on:** `2026-10-14-trip-guide-design.md` (guide), `2026-10-10-multi-trip-design.md` (v2 engine)

## 1. Intent

The app is used by travellers around 65 years old, on phones and tablets. Today every v2 screen is
a fixed ~448 px column (`max-w-md`), so a tablet shows a narrow strip in the middle. The guide
(`/trips/:tripId/guide`) renders all 41 Peru entries on one page, grouped in six sections — a long
scroll where it is easy to get lost.

Goal: use the tablet width, and turn the guide into a small, predictable navigation: pick a topic,
read a short list, open an entry, always one clear way back.

### Success criteria

1. On a phone (< 768 px) every v2 screen looks as it does today, except the guide.
2. On a tablet (≥ 768 px, portrait and landscape) the header, content and bottom nav widen to
   `max-w-3xl`; card lists show 2 columns; long reading text stays at a readable line length.
3. `/trips/:tripId/guide` shows a **topic hub**: one card per non-empty topic, 2 columns on a
   phone and 3 on a tablet, each with its colour, icon, name and entry count. No entry is listed
   on the hub.
4. Tapping a topic opens `/trips/:tripId/guide/topic/:category` with only that topic's entries
   (Ciudades keeps route order). Unknown or empty topics redirect to the hub.
5. An entry page has **one** back button: to the itinerary day when it was opened from that day's
   "Para saber más", otherwise to its topic. The topic label on the entry also links to the topic.
6. Topic colours work in light and dark mode; colour is never the only cue (icon + name always).
7. Touch targets ≥ 48 px; body text stays 17–18 px; nothing gets smaller.
8. Existing deep links keep working: `/guide/:entryKey`, `/itinerary/:date`, `/checklist` redirect.

### Decisions taken (with rationale)

| Decision                                                                                 | Rationale                                                                                                                         |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Targets are **phone and tablet** only.                                                   | Owner's answer. No desktop-specific layout.                                                                                       |
| Keep the **bottom nav** on tablets.                                                      | Same four buttons in the same place on every device; the users already know it. (Rejected: side rail on tablets.)                 |
| Guide becomes **topic hub → topic list → entry** (approach A).                           | One decision per screen, lists of ≤ 14, predictable back. (Rejected: tabs — 6 tabs overflow a phone; accordions — content jumps.) |
| Hub is **2 columns on phone**, 3 on tablet, with **per-topic colours**.                  | Owner's choice: all six topics visible at once, colour helps recognise them.                                                      |
| Topic colours are **new tokens**, never `action` (blue), `done` (green), `urgent` (red). | Avoids reading a topic as "done" or "urgent".                                                                                     |
| **One** back button on the entry page (day if opened from a day, else topic).            | Two back buttons side by side confuse; the topic stays reachable through the topic label link. Refines conversation part 2.       |
| "Opened from a day" travels as **router location state**, not browser history.           | Predictable target; a reload or a shared link falls back to the topic.                                                            |
| Route segment `topic` and category ids stay **English**.                                 | Matches existing routes (`guide`, `itinerary`, `help`).                                                                           |
| Out of scope: legacy Vietnam screens, desktop layout, search, content changes.           | YAGNI. No content change, so no `seedVersion` bump and no schema change.                                                          |

## 2. Responsive layout

Breakpoint: Tailwind `md` (768 px). Phone layout is unchanged below it.

| Unit                    | Change                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TripLayout`            | Header inner row and `<main>`: `max-w-md md:max-w-3xl`.                                                                                                         |
| `TripNav`               | `<ul>`: `max-w-md md:max-w-3xl`. Items keep size and order.                                                                                                     |
| `TripSwitcher`          | `<main>`: `max-w-md md:max-w-3xl`; each section's cards in `md:grid md:grid-cols-2 md:gap-3`.                                                                   |
| `TripErrorBoundary`     | `<main>`: `max-w-md md:max-w-3xl`.                                                                                                                              |
| `HelpPage`              | `HelpCard`s wrapped in a container that is 1 column on phone, `md:grid-cols-2` on tablet. Emergency card, contacts, docs, import and checklist stay full width. |
| `GuideEntryPage`        | Body paragraphs inside `max-w-prose`.                                                                                                                           |
| Today / Itinerary pages | No markup change; they just get the wider container.                                                                                                            |

Card components must render correctly inside a grid cell (no fixed widths, `h-full` where a row of
cards should align).

## 3. Guide topics

### 3.1 Routes (`src/App.tsx`, inside `/trips/:tripId`)

```
guide                     → GuidePage        (topic hub)
guide/topic/:category     → GuideTopicPage   (new)
guide/:entryKey           → GuideEntryPage   (unchanged path)
```

`guide/topic/:category` has two segments, so it never collides with `guide/:entryKey`.

### 3.2 Domain (`src/trips/domain/guide.ts`, pure, tested)

```ts
export interface GuideTopic {
  category: GuideCategory
  label: string
  count: number
}

/** Non-empty topics in reading order (GUIDE_SECTIONS order) with their entry count. */
export function guideTopics(entries: GuideEntry[]): GuideTopic[]

/** Type guard for the `:category` route param. */
export function isGuideCategory(value: string | undefined): value is GuideCategory

/** Entries of one topic, same order as groupGuide (Ciudades in route order); [] if none. */
export function guideTopicEntries(entries: GuideEntry[], category: GuideCategory): GuideEntry[]

/** Reads `{ fromDay: 'YYYY-MM-DD' }` from router location state; anything else → undefined. */
export function readFromDay(state: unknown): string | undefined
```

All four reuse `GUIDE_SECTIONS` / `groupGuide`; no new ordering rules.

### 3.3 Topic colours (`src/index.css`, `tailwind.config.*`)

Each topic gets a strong tone (stripe, icon) and a soft tone (icon circle background), as CSS
variables in `.trip-app` with `.dark .trip-app` overrides, exposed as Tailwind colours
`trip-topic-<category>` and `trip-topic-<category>-soft`.

| Topic        | Category    | Tone       | Light strong / soft   | Dark strong / soft    | Icon (lucide)     |
| ------------ | ----------- | ---------- | --------------------- | --------------------- | ----------------- |
| Historia     | `history`   | ochre      | `#9a5b00` / `#fbeed6` | `#f0b85a` / `#3a2c14` | `Landmark`        |
| Ciudades     | `city`      | teal       | `#0f766e` / `#dcf3f0` | `#5fd3c4` / `#143430` | `MapPin`          |
| Gastronomía  | `food`      | terracotta | `#b3431c` / `#fbe6dc` | `#ff9b73` / `#3d2117` | `UtensilsCrossed` |
| Bebidas      | `drink`     | purple     | `#7a3fd0` / `#efe7fc` | `#c4a3ff` / `#2c2245` | `CupSoda`         |
| Curiosidades | `curiosity` | magenta    | `#b8326f` / `#fbe4ee` | `#ff8fbf` / `#3d1a2a` | `Lightbulb`       |
| Consejos     | `tip`       | indigo     | `#3f46b8` / `#e6e7fa` | `#a3a9ff` / `#22254a` | `ThumbsUp`        |

Constraint: strong tone vs. its soft tone and vs. `--trip-card` must reach ≥ 3:1 (non-text
graphics). Values may be adjusted during implementation to meet it; text always uses ink tokens.

A presentational map `src/trips/components/guideTopicStyle.ts` holds, per category, the icon and
the **literal** Tailwind class strings (stripe, icon colour, circle background). Literal strings so
Tailwind's content scan keeps them; no class names built from variables.

### 3.4 Screens and components

**`GuidePage` (hub, container).** `PageHeader` "Guía" + trip name; then a grid of
`GuideTopicCard`s: `grid grid-cols-2 gap-3 md:grid-cols-3`. Empty guide → existing
"Este viaje todavía no tiene guía." message.

**`GuideTopicCard` (new, presentational).** A `Link` to `guide/topic/<category>`, full card
tappable, `min-h-[150px]`, rounded card with a 6 px top stripe in the strong tone; a ~56 px circle
in the soft tone with the icon (28 px) in the strong tone; topic name 20 px bold (`text-trip-ink`,
wraps if needed); "N lecturas" (singular "1 lectura") in `text-trip-ink2`. Accessible name =
visible text.

**`GuideTopicPage` (new, container).** Reads `:category`; invalid or empty → `<Navigate>` to the
hub (`replace`). Shows a back link "‹ Guía" styled as a button (`tripButtonClass('ghost')`,
≥ 48 px), a header with the icon circle + topic name (`h1`), and `GuideTopicList`.

**`GuideTopicList` (new, presentational).** Entries as separate cards (title + summary + chevron),
each with a 4 px left stripe in the topic's strong tone; `grid gap-3 md:grid-cols-2`. Links to
`guide/<entryKey>` without day state.

**`GuideCardList` (existing, itinerary "Para saber más").** Gains an optional `fromDay?: string`
prop; when set, each link passes `state={{ fromDay }}`. `ItineraryPage` passes the selected date.
Row-list look unchanged.

**`GuideEntryPage` (existing).** One back button, styled like the topic page's:

- `readFromDay(location.state)` returns a date that is a trip day → "‹ Volver al día" →
  `/trips/:tripId/itinerary/<date>`.
- Otherwise → "‹ <Topic label>" → `/trips/:tripId/guide/topic/<category>`.

The topic label above the title becomes a coloured chip (soft background, strong-tone icon) that
links to the topic. Body in `max-w-prose`. "Días del viaje" and "Fuentes" unchanged.

### 3.5 Errors and edge cases

- Loading / read error: existing `TripStatusMessage` texts ("Cargando la guía…",
  "No se pudo cargar la guía.") on hub, topic and entry pages.
- Unknown entry key: still redirects to the hub.
- Unknown or empty topic: redirects to the hub.
- `fromDay` missing, malformed, or not a day of this trip: back goes to the topic.

## 4. Testing

- **TDD (Vitest, `npm test`, node env):** `guideTopics` (order, counts, empty topics dropped,
  empty input), `isGuideCategory` (valid ids, unknown, `undefined`), `guideTopicEntries`
  (filtering, Ciudades in route order, empty topic → `[]`), `readFromDay` (valid object, wrong
  shape, malformed date, `null`/`undefined`).
- The project has no component tests; screens are covered by `npm run build` (strict TS),
  `npm run lint`, `npm run format:check`, and the owner's manual pass.
- **Manual pass (owner):** phone and tablet, portrait and landscape; hub 2/3 columns; colours in
  light and dark; topic → entry → back to topic; day → "Para saber más" → entry → back to day;
  reload on an entry opened from a day (back goes to topic); unknown topic URL; Ayuda and
  "Mis viajes" grids on tablet; offline reload.

## 5. Out of scope

Legacy Vietnam screens; desktop-specific layout or side navigation; search or filters inside a
topic; guide content or schema changes; showing guide cards on "Hoy".
