## Exploration: App-Wide UI/UX Redesign

### Current State

**Tech stack**: React 18.3 + TypeScript 5.6 + Vite 5.4 + Tailwind CSS 3.4 + Dexie 4 (IndexedDB) + React Router v7 + Leaflet + lucide-react icons. PWA with workbox. No test runner.

**Architecture**: SPA with lazy-loaded pages wrapped in a `<Layout>` shell (Header + main content + BottomNav). All data lives in IndexedDB via Dexie, seeded on first load from `src/db/seed.ts`. The trip is hardcoded: Vietnam + Cambodia, July 4-20 2026, 5 travelers.

---

### 1. Navigation Structure

**BottomNav** (`src/components/layout/BottomNav.tsx`) — 5 fixed tabs:

| Tab       | Route         | Icon (lucide)     | Label     |
| --------- | ------------- | ----------------- | --------- |
| Inicio    | `/`           | `LayoutDashboard` | Inicio    |
| Pre-viaje | `/pre-travel` | `ClipboardList`   | Pre-viaje |
| Schedule  | `/schedule`   | `CalendarDays`    | Schedule  |
| Lugares   | `/places`     | `Map`             | Lugares   |
| Más       | `/settings`   | `MoreHorizontal`  | Más       |

**Header** (`src/components/layout/Header.tsx`) — sticky top bar with app title "Travel Planner" + online/offline badge. No back navigation, no contextual actions.

**Layout** (`src/components/layout/Layout.tsx`) — simple flex column: Header → main (max-w-2xl centered, px-4, pb-24 for nav clearance) → BottomNav.

**Routes** (14 lazy pages):

- `/` → Dashboard
- `/pre-travel` → PreTravel
- `/documents` → Documents, `/documents/:id` → DocumentDetail
- `/schedule` → Schedule, `/schedule/:date` → DayView
- `/daily/:date` → DailyPlan
- `/places` → Places, `/places/:id` → PlaceDetail
- `/recommendations` → Recommendations, `/recommendations/:id` → RecommendationDetail
- `/countries/:id` → CountryInfo
- `/settings` → Settings
- `/404` → NotFound, `*` → redirect to 404

**Key observation**: Documents, Recommendations, and CountryInfo are NOT in the bottom nav — they're only reachable via links from other pages. The "Más" tab only leads to Settings.

---

### 2. Dashboard Current State

**Page**: `src/pages/Dashboard.tsx` (261 lines)

**Structure** (top to bottom):

1. **Title row**: "Vietnam + Camboya 2026" + today's date (formatted in Spanish) + duplicate online/offline badge (already in Header)
2. **TripCountdown**: hero card showing trip status
3. **NextEvent**: next upcoming event card with countdown
4. **Quick Access grid** (2×2): Documents count, Plan de hoy, Maletas progress, Places count
5. **Quick Actions** (3-col grid): +Documento, +Evento, +Lugar (open inline forms)
6. **RecentActivity**: last 5 modified items across all entity types

**TripCountdown** (`src/components/dashboard/TripCountdown.tsx`):

- **Before trip**: Shows big number `status.daysUntilStart` + `formatCountdownDays(status.daysUntilStart)`
- **During trip**: "Día X de Y" + progress bar
- **After trip**: "¡Viaje completado!" + route summary

**🐛 COUNTDOWN DUPLICATION BUG**: In the "before" phase (lines 34-39), the component renders:

```
<span className="text-5xl">{status.daysUntilStart}</span>   // e.g., "17"
<span>{formatCountdownDays(status.daysUntilStart)}</span>    // e.g., "17 días"
```

`formatCountdownDays()` returns `"17 días"` — so the display shows **"17 17 días"**. The number appears twice. Fix: either show just the big number + literal "días"/"día", or change `formatCountdownDays` to return only the unit word.

**NextEvent** (`src/components/dashboard/NextEvent.tsx`): Uses `findNextEvent()` to get the chronologically next event, shows icon + title + time + date + location + relative countdown (e.g., "en 17 días").

**Dashboard utils** (`src/utils/dashboard.ts`):

- `getTripStatus()` — computes phase (before/during/after), daysUntilStart, currentDay, progress%
- `findNextEvent()` — filters future events, sorts by date+time
- `buildRecentActivity()` — merges all entity types, sorts by updatedAt, takes top 5
- `getCurrentDayRoute()` — finds location name for today's events
- `formatCountdownDays()` — returns `"X día"` or `"X días"` (the source of the duplication bug)

---

### 3. Schedule Current State

**Page**: `src/pages/Schedule.tsx` (220 lines)

**View modes**: Toggle between **Calendar** and **List** (segmented control in header).

- **Calendar view**: Custom `Calendar` component with month navigation, event dots on dates, click date → navigates to `/daily/:date` (DailyPlan), long-press/quick-add opens EventForm with pre-filled date.
- **List view**: Flat sorted list of all events as `EventCard` components.
- **FAB**: Floating action button to add new event.
- **Empty state**: Calendar icon + "Sin eventos" message + "Añadir primer evento" button.

**DayView** (`src/pages/DayView.tsx`, 251 lines): Route `/schedule/:date`

- Back button → `/schedule`
- Date header with event count
- "Full day plan" button → navigates to `/daily/:date`
- **Timeline** component (visual vertical timeline)
- **EventCard** list below timeline
- **Accommodation card** at bottom (orange, bed icon) if any accommodation event exists
- FAB for adding events to this day

**DailyPlan** (`src/pages/DailyPlan.tsx`, 171 lines): Route `/daily/:date`

- Back button → `/schedule`
- Day navigation: chevron left/right to go to prev/next day
- Date + auto-detected location header
- "Simple timeline view" button → back to DayView
- **DailyPlanCard** — the rich daily view with:
  - Location banner
  - Activities grouped by period (morning/afternoon/evening) with collapsible sections
  - Places to visit grouped by period
  - Cultural notes
  - Day tips
  - Recommendations

**Schedule utils** (`src/utils/schedule.ts`):

- `EVENT_TYPE_CONFIG` — color/icon config for flight, transport, visit, accommodation, activity
- `getEventIcon()` — returns icon based on type (with transport sub-detection: train, bus, boat)
- `sortItemsByStartTime()`, `formatEventTimeRange()`, `getGoogleMapsUrl()`

**DailyPlan utils** (`src/utils/dailyPlan.ts`):

- `CITY_KEYWORDS` — keyword map for 9 cities to auto-detect day location from events
- `determineDayLocation()` — scores events against city keywords
- `getPlacesForLocation()` — filters places matching a city
- `groupItemsByPeriod()` / `groupPlacesByPeriod()` — morning/afternoon/evening grouping

---

### 4. Day Detail Structure

Two separate views for a single day:

1. **DayView** (`/schedule/:date`) — simple timeline + event cards + accommodation
2. **DailyPlan** (`/daily/:date`) — rich view with activities, places, cultural notes, tips, recommendations

**DailyPlanCard** (`src/components/daily/DailyPlanCard.tsx`, 260 lines):

- Collapsible sections with period headers (Morning ☀️ / Afternoon 🌤 / Evening 🌙)
- EventCards in "timeline" variant within each period
- Places linked to `/places/:id`
- CulturalNote component
- DayTip component
- DailyRecommendation component

**Supporting components** in `src/components/daily/`:

- `CulturalNote.tsx` — cultural tips card
- `DailyPlanForm.tsx` — edit form for daily plan data
- `DailyRecommendation.tsx` — recommendation cards
- `DayTip.tsx` — tips list

---

### 5. Pre-Travel Section

**Location**: Own tab in bottom nav (`/pre-travel`), 2nd position.

**Page**: `src/pages/PreTravel.tsx` (365 lines)

**Structure**:

1. Title "Pre-viaje" + Share button (copies packing list to clipboard)
2. **Packing progress card** — expandable, shows percentage + progress bar + essential items count
3. **Horizontal tab bar** (scrollable): Equipaje, Vacunas, Dinero, Conectividad, Seguridad, Consejos
4. **Tab content**:
   - `checklist` tab → `PackingChecklist` component (grouped by category, toggleable items)
   - Other tabs → `PreTravelSection` component (list of items with importance flags and optional details)

**Pre-travel categories** (from types):

- `checklist` — packing items (documents, health, clothing, electronics, toiletries, misc)
- `vaccines` — health/vaccine info
- `money` — currency and payment tips
- `connectivity` — SIM cards, offline maps
- `safety` — emergency numbers, common scams
- `tips` — practical travel tips

**Seed data**: 30 packing items across 6 categories, 5 pre-travel sections with 4 items each.

---

### 6. Data Model

**Dexie tables** (9 tables, `src/db/schema.ts`):

| Table               | Key    | Indexes                                             | Type               |
| ------------------- | ------ | --------------------------------------------------- | ------------------ |
| `documents`         | `id`   | type, title, createdAt, updatedAt                   | `DocumentItem`     |
| `itineraryItems`    | `id`   | date, type, title, \*tags                           | `ItineraryItem`    |
| `places`            | `id`   | name, category                                      | `Place`            |
| `dailyPlans`        | `date` | items, places, recommendations, tips, culturalNotes | `DailyPlan`        |
| `recommendations`   | `id`   | type, title, priority, \*tags                       | `Recommendation`   |
| `countryInfo`       | `id`   | country                                             | `CountryInfo`      |
| `packingItems`      | `id`   | category, name, checked, essential                  | `PackingItem`      |
| `preTravelSections` | `id`   | category, title                                     | `PreTravelSection` |
| `travelers`         | `id`   | name, passportNumber                                | `Traveler`         |

**Key types** (`src/types/index.ts`):

- `TripMeta` — hardcoded constant: start 2026-07-04, end 2026-07-20, 5 travelers, 8-city route
- `ItineraryItem` — date, startTime, endTime?, type (flight|transport|visit|accommodation|activity), title, description?, location?, notes?, tags?
- `Place` — name, description, category (temple|nature|city|restaurant|market|beach|museum|other), location, tips?, funFacts?, culturalContext?, images?
- `DocumentItem` — type (passport|insurance|flight|accommodation|other), title, data (Record<string, unknown>), fileData? (base64), favorite?
- `DailyPlan` — date (PK), items[], places[], recommendations[], tips[], culturalNotes[]
- `Recommendation` — type (restaurant|activity|place), title, description, location?, tags, priority (must-see|if-time|optional)
- `CountryInfo` — country code, sections (history, culture, food, traditions, customs, language, currency, tips[])
- `Traveler` — name, passportNumber
- `PackingItem` — category, name, checked, essential
- `PreTravelSection` — category, title, items[] (text, checked?, important, details?)
- `Location` — name, lat?, lng?, address?, googleMapsUrl?

**Seed data** (hardcoded in `src/db/seed.ts`, 1363 lines):

- 5 travelers (family members with passport numbers)
- 10 documents (3 flights + 7 accommodations)
- 36 itinerary items (full day-by-day plan for Jul 4-20)
- 33 places across Vietnam and Cambodia
- 2 country info records (Vietnam + Cambodia)
- 30 packing items
- 5 pre-travel sections
- 10 recommendations
- 17 daily plans (one per travel day)

---

### 7. Existing Document/Help Sections

**Documents page** (`/documents`): Full CRUD with search, type filter (passport, insurance, flight, accommodation, other), favorites. Document types have specific form fields:

- Passport: number, expiration, nationality
- Insurance: policy number, company, emergency phone
- Flight: airline, flight number, departure/arrival airports, date, time
- Accommodation: hotel name, address, check-in/out dates, confirmation code
- Other: free text

**DocumentDetail** (`/documents/:id`): Detail view with file preview (image/PDF), share functionality.

**CountryInfo** (`/countries/:id`): Rich country pages with 8 sections (history, culture, food, traditions, customs, language, currency, tips). Includes:

- Language phrases (Spanish → local with pronunciation)
- Currency info component
- Toggle between Vietnam ↔ Cambodia
- Share button

**Settings** (`/settings`): Theme toggle (dark/light), data export (JSON), data import, database reset.

**NOT in bottom nav**: Documents, Recommendations, CountryInfo are accessible only via links from Dashboard/DailyPlan.

---

### 8. Identified Gaps & Issues

**Bugs**:

1. **Countdown duplication** — `TripCountdown` shows "17 17 días" because the big number AND `formatCountdownDays()` both include the number
2. **Duplicate online/offline badge** — shown in both Header and Dashboard title row
3. **Language inconsistency** — UI is mixed Spanish/English (e.g., "Full day plan", "Back", "Simple timeline view", "Edit" in DailyPlan vs Spanish elsewhere)

**Architecture gaps**:

1. **No trip switching** — `TRIP_META` is a hardcoded constant in types, trip data is baked into seed
2. **No multi-trip support** — single trip only, no trip selector
3. **DayView vs DailyPlan confusion** — two separate pages for the same day with overlapping data, unclear which is "primary"
4. **No country transition logic** — CountryInfo has a manual toggle button but no automatic detection based on current itinerary day
5. **Documents not in nav** — important section buried behind Dashboard quick access
6. **Recommendations not in nav** — separate page with no bottom nav entry
7. **No travelers view** — `Traveler` table exists with 5 people seeded but no UI to display them
8. **No embassy/consulate info** — CountryInfo has no embassy section
9. **No visa status tracking** — packing checklist mentions visas but no dedicated visa tracker
10. **No budget/expense tracking** — money section is static text, no interactive budget tool
11. **No weather integration** — no weather data for destinations
12. **No photo gallery** — Place type has `images?` field but no UI for it
13. **Calendar hardcoded month** — `currentMonth` initialized to `new Date(2026, 6, 1)` (July 2026)

**UX gaps**:

1. **No onboarding** — first-time users see seeded data with no guidance
2. **No search across entities** — each section has its own search, no global search
3. **No notifications/reminders** — no alert system for upcoming events or document expiry
4. **Settings page is minimal** — only theme + data management, no trip settings
5. **No offline indicator on data operations** — offline badge exists but no guidance on what works offline
6. **No pull-to-refresh** — data is live-queried from Dexie but no manual refresh mechanism

---

### Affected Areas

- `src/components/layout/BottomNav.tsx` — tab structure, icons, labels
- `src/components/layout/Header.tsx` — header content, contextual actions
- `src/components/layout/Layout.tsx` — overall shell structure
- `src/pages/Dashboard.tsx` — dashboard layout, sections, quick actions
- `src/components/dashboard/TripCountdown.tsx` — countdown display (bug fix)
- `src/components/dashboard/NextEvent.tsx` — next event display
- `src/pages/Schedule.tsx` — calendar/list views, navigation
- `src/pages/DayView.tsx` — day timeline view
- `src/pages/DailyPlan.tsx` — rich daily plan view
- `src/components/daily/DailyPlanCard.tsx` — daily plan card structure
- `src/pages/PreTravel.tsx` — pre-travel tab structure
- `src/pages/Documents.tsx` — document management
- `src/pages/Places.tsx` — places map/list
- `src/pages/CountryInfo.tsx` — country info pages
- `src/pages/Settings.tsx` — settings page
- `src/types/index.ts` — TRIP_META constant, type definitions
- `src/db/seed.ts` — seed data structure
- `src/utils/dashboard.ts` — countdown logic (bug source)
- `src/utils/dailyPlan.ts` — city keyword detection

---

### Approaches

1. **Incremental redesign** — Fix bugs first, then improve one section at a time (Dashboard → Schedule → Pre-Travel → etc.)
   - Pros: Lower risk, can ship incrementally, each phase is reviewable
   - Cons: Temporary visual inconsistency between old/new sections
   - Effort: Medium (spread across multiple PRs)

2. **Big-bang redesign** — Redesign all pages and navigation in one pass
   - Pros: Consistent UX from day one, clean architecture
   - Cons: Very large PR (>1000 lines), hard to review, high risk
   - Effort: High

3. **Foundation-first** — First establish new navigation/layout shell + design tokens, then migrate pages one by one
   - Pros: Clean foundation, incremental page migration, each page is independent
   - Cons: Two-step process before visible results
   - Effort: Medium-High

### Recommendation

**Foundation-first approach** (option 3): First redesign the navigation shell (BottomNav, Header, Layout) and fix the countdown bug, then migrate pages incrementally. This gives a consistent frame for the new design while keeping each page migration as a small, reviewable change.

### Risks

- **No test coverage** — any UI change is untested; visual regression is possible
- **Seed data coupling** — many pages assume the specific Vietnam/Cambodia seed data
- **Dexie live queries** — changes to data model require updating all hooks that use `useLiveQuery`
- **Mixed language** — current codebase mixes Spanish and English in UI strings; a redesign should pick one convention
- **Two day views** — DayView and DailyPlan overlap significantly; the redesign should consolidate or clearly differentiate them

### Ready for Proposal

**Yes** — the codebase is well-structured with clear separation of concerns. The data model is solid, components are domain-organized, and lazy loading is in place. The exploration has identified all key areas, the countdown bug source, and architectural gaps. Ready for the orchestrator to proceed with `sdd-propose` for the `app-redesign` change.
