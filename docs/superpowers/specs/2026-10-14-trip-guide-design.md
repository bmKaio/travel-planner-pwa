# Trip guide ("Guía") for v2 trips — Design

- **Date:** 2026-10-14
- **Branch:** `feat/viaje-peru`
- **Status:** approved in conversation (parts 1–3); pending written-spec review
- **Builds on:** `2026-10-10-multi-trip-design.md` (v2 trip engine), `odd/tasks/peru-free-time.md` (done)

## 1. Intent

The Peru trip needs a place to read about the country while travelling: history, the cities on
the route, food and drinks, curiosities and a few tips. Some of that content belongs to specific
days, so the itinerary's day detail links to it.

### Success criteria

1. The bottom nav reads **Hoy · Itinerario · Guía · Ayuda**; "Checklist" is gone from the nav.
2. `/trips/peru-2026/guide` lists the guide by section; each entry opens its own page.
3. The itinerary day detail shows a "Para saber más" block with the entries linked to that day,
   each opening its entry page. Days without entries show no block.
4. The checklist (progress, shared/private groups, `done` state) and the notes live at the end of
   "Ayuda"; nothing stored on devices is lost. `/trips/:tripId/checklist` still works (redirect).
5. Every guide entry has at least one source; content is reviewed by the user before it ships.
6. Works offline like the rest of the trip (content synced to IndexedDB).

### Decisions taken (with rationale)

| Decision                                                                                                      | Rationale                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guide content is authored in the trip content file and **synced to a new `guideEntries` table** (TripsDB v2). | Same path as days and help: screens only read from the DB, updates ship via `seedVersion`. (Rejected: reading the lazy content chunk directly — simpler, but a second data path.)                 |
| "Guía" **replaces** "Checklist" in the nav; checklist + notes **move to "Ayuda"**.                            | User choice. Keeps four nav items on a phone.                                                                                                                                                     |
| Entries link to days **only through explicit `dates`**.                                                       | Checked against the content: Cusco appears on 5 days and Lima on 4 (incl. transit/departure days); matching by city would attach entries to days where they are noise. The author picks the days. |
| The guide holds **reading content only, never places to go** (no maps button).                                | "Visitar" (incl. "Si os sobra tiempo") and "Comer" already own places with directions; the guide must not duplicate them.                                                                         |
| `guide` is optional in `TripContent`.                                                                         | Other trips need no guide; the page shows an empty state.                                                                                                                                         |
| Restaurant "Maymanta" from the user's food notes is left out.                                                 | It is in Barcelona, not on the trip.                                                                                                                                                              |
| Out of scope: guide cards on "Hoy", search, category filters.                                                 | YAGNI; can be added later.                                                                                                                                                                        |

## 2. Data model

```ts
// src/trips/types.ts
export type GuideCategory = 'history' | 'city' | 'food' | 'drink' | 'curiosity' | 'tip'

export interface ContentGuideEntry {
  /** Unique within the trip; URL segment of the entry page. Lowercase kebab-case. */
  key: string
  category: GuideCategory
  title: string
  /** One or two lines, shown on cards. */
  summary: string
  /** Short paragraphs, rendered in order. */
  body: string[]
  /** Trip days this entry belongs to (ISO dates present in `days`). */
  dates?: string[]
  /** Source URLs, shown small at the end of the entry page. At least one. */
  sources: string[]
}

export interface GuideEntry extends ContentGuideEntry {
  tripId: string
  /** Index in the authored `guide` array; Dexie returns rows by primary key, not authored order. */
  order: number
}

export interface TripContent {
  // …existing fields
  guide?: ContentGuideEntry[]
}
```

- `TripsDatabase` adds `version(2).stores({ guideEntries: '[tripId+key], tripId' })`. Additive:
  existing tables and data are untouched.
- Content order within a category is the authored order, except cities (see §4).

## 3. Sync

`syncTripContent` adds `db.guideEntries` to its transaction. On a newer `seedVersion` it deletes
the trip's guide entries and bulk-puts the new ones (same as days). Checklist `done`, notes and
imported help data keep their current behaviour.

## 4. Domain functions (pure, TDD)

`src/trips/domain/guide.ts`:

- `GUIDE_SECTIONS`: ordered `{ category, label }` — Historia, Ciudades, Gastronomía, Bebidas,
  Curiosidades, Consejos.
- `groupGuide(entries)`: sections in `GUIDE_SECTIONS` order, empty sections dropped. Within
  `city`, entries are sorted by their earliest date (route order); entries without dates go
  last in authored order. Other categories keep authored order.
- `guideForDay(entries, date)`: entries whose `dates` include `date`, in section order, then
  authored order.

## 5. Routes and screens

| URL                              | Behaviour                                                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/trips/:tripId/guide`           | `GuidePage`: `PageHeader` "Guía" + trip name; one section per group; each entry a card (title + summary) linking to its page. Empty state: "Este viaje todavía no tiene guía."                    |
| `/trips/:tripId/guide/:entryKey` | `GuideEntryPage`: category label, title, body paragraphs, "Días del viaje" chips (e.g. "jue 22 · Puno", linking to `/itinerary/:date`), then sources. Unknown key → `Navigate` to the guide list. |
| `/trips/:tripId/checklist`       | `Navigate` (replace) to `/trips/:tripId/help#checklist`.                                                                                                                                          |

- **Nav** (`TripNav`): `{ to: 'guide', label: 'Guía', icon: BookOpen }` replaces the checklist item.
- **Itinerary** (`ItineraryPage`): a "Para saber más" section between the tab panel and
  "Transporte", listing `guideForDay(entries, day.date)` as compact cards; hidden when empty.
- **Help** (`HelpPage`): appends a `ChecklistSection` (`id="checklist"`; progress bar + groups,
  extracted unchanged from `ChecklistPage`) and the notes editor (same latch logic). On mount,
  if `location.hash === '#checklist'`, scroll that section into view. `ChecklistPage` is deleted.
- **Hook**: `useGuide(tripId)` via `useTripQuery` over `tripsDb.guideEntries.where('tripId')`.
- UI copy in Spanish; code and comments in English. Day chip labels reuse `dates.ts` helpers.
- **Docs**: update the routes line in `CLAUDE.md` ("Multi-trip") to `{today,itinerary[/:date],guide[/:entryKey],help}` and note the `/checklist` redirect.

## 6. Content (Peru)

About 40 entries, written short for reading on a phone, each with sources (official tourism,
UNESCO, museums, reputable references). Planned set:

| Section           | Entries                                                                                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Historia (4)      | Pre-Inca cultures · Inca empire · Conquest and Viceroyalty · Independence and Republic                                                                                                                                                  |
| Ciudades (7)      | Lima · Arequipa · Colca Canyon · Puno and Titicaca · Cusco · Sacred Valley · Machu Picchu                                                                                                                                               |
| Gastronomía (~14) | From the user's notes (ceviche, lomo saltado, causa, ají de gallina, anticuchos, papa a la huancaína, papa rellena, street food) + regional dishes (rocoto relleno, chupe de camarones, adobo arequipeño, Titicaca trout, cuy, quinoa…) |
| Bebidas (~5)      | Pisco sour · chicha morada · emoliente · mate de coca · chicha de jora                                                                                                                                                                  |
| Curiosidades (~8) | Potato varieties · Uros and totora · Taquile knitting men · condor · Quechua words · quipus · Machu Picchu's 1911 rediscovery…                                                                                                          |
| Consejos (~3)     | User's food tips (spice level, ceviche at lunch, chifa/nikkei, busy street stalls) + altitude                                                                                                                                           |

Process: research → draft in `docs/peru/guia-borrador.md` (Spanish, with sources and proposed
`dates`) → user review → content moved to `peru-2026.ts` with `seedVersion` bumped by one (6 → 7 at the time of writing). Before adding an
entry, check it against each day's `see`/`eat` so the guide does not repeat places.

## 7. Testing

TDD with Vitest (`npm test`), `fake-indexeddb` via `setupTestTripsDb`:

- `guide.test.ts`: `groupGuide` (section order, empty sections dropped, cities by route order,
  undated last) and `guideForDay` (date match, no match, order).
- `seedSync.test.ts`: guide entries written on first sync, replaced on a newer version, untouched
  on the same version; checklist `done` still preserved.
- `content.test.ts`: for every trip with a guide — unique keys, kebab-case keys, every `date`
  exists in `days`, `sources` non-empty, non-empty `title`/`summary`/`body`.
- Existing 110 tests stay green. Then `npm run lint`, `npm run format:check`, `npm run build`,
  and a manual pass in the dev server (nav, guide list, entry, day block, Help checklist,
  `/checklist` redirect, offline reload).

## 8. Order of work

1. Research and write the content draft (user review is the slow step).
2. While the user reviews: types + DB v2 + sync, domain functions, hook, Guide pages, day block,
   checklist move + redirect, nav — with 2–3 placeholder-free sample entries taken from the draft.
3. After the user approves the draft: full content into `peru-2026.ts`, `seedVersion` +1.
