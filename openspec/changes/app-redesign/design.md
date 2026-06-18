# Design: App-Wide UI/UX Redesign

## Technical Approach

Foundation-first strategy matching the proposal's 5 phases. Each phase is an independent commit. The redesign touches navigation, dashboard, itinerary, day detail, and a new Más hub — all client-side with no backend changes. Data stays in Dexie (IndexedDB). Existing patterns (lazy routes, Tailwind utility classes, lucide-react icons, `useMemo`-heavy components) are preserved throughout.

## Architecture Decisions

| Decision                 | Options Considered                                               | Choice                                                      | Rationale                                                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nav state management     | React Router nested routes vs. flat routes + tab highlight logic | **Flat routes + NavLink**                                   | Current `BottomNav` already uses `NavLink` with `isActive`. Adding nested routes introduces unnecessary router complexity for 4 tabs.                                                                          |
| Map tab route            | New `/map` route vs. reuse `/places`                             | **New `/map` route → same `Places` page**                   | Spec requires `/map`. Simplest: add route alias in `App.tsx` pointing to existing `Places` component. No code duplication.                                                                                     |
| Country detection        | New `useCurrentCountry()` hook vs. extend `useTripStatus()`      | **New `useCurrentCountry()` hook**                          | Separation of concerns. `getTripStatus()` handles phase/progress. Country detection is orthogonal — different inputs (itinerary items + CITY_KEYWORDS → country map).                                          |
| City→Country mapping     | Hardcode in component vs. extend `CITY_KEYWORDS`                 | **Add `CITY_COUNTRY_MAP` constant** in `dailyPlan.ts`       | Keeps all location logic co-located. Map: `{ Hanoi: 'vietnam', 'Siem Reap': 'cambodia', ... }`. Reuses `determineDayLocation()` output.                                                                        |
| Day detail consolidation | Keep DayView + DailyPlan separate vs. merge                      | **Merge into single `DayDetail` page at `/schedule/:date`** | Spec requires single entry point. DailyPlan already has richer data (tips, cultural notes, recommendations). DayView's timeline + accommodation display merges into DayDetail. Deprecate `/daily/:date` route. |
| Accommodation data model | New `accommodations` table vs. extend `itineraryItems`           | **Reuse `itineraryItems` with `type: 'accommodation'`**     | Already exists — DayView.tsx line 48-50 filters `type === 'accommodation'`. Enrich seed data with hotel entries. No schema migration needed.                                                                   |
| Más hub layout           | Sub-routes vs. scrollable page with section cards                | **Scrollable page with nav-link cards**                     | Simpler, fewer routes, matches mobile UX pattern. Each section card links to existing routes (`/pre-travel`, `/documents`) or renders inline (insurance, embassy).                                             |
| Day group computation    | Server-side grouping vs. client-side `useMemo`                   | **Client-side `useMemo` with `groupByDate()` utility**      | Offline-first architecture. All data already loaded via `useItinerary()` hook. Grouping is trivial O(n) sort + reduce.                                                                                         |
| Hero card image          | First place image vs. dailyPlans image field                     | **Add optional `heroImage` field to `DailyPlan`**           | DailyPlan already keyed by date. Seed data can include image URLs. Fallback: first place's `images[0]` or a default gradient.                                                                                  |

## Data Flow

```
IndexedDB (Dexie)
    │
    ├── itineraryItems ──→ useItinerary() ──→ Schedule (day groups)
    │                                    ──→ Dashboard (next event, country detection)
    │                                    ──→ DayDetail (activities, accommodation)
    │
    ├── dailyPlans ──→ useLiveQuery() ──→ DayDetail (tips, cultural, recs, heroImage)
    │
    ├── places ──→ usePlaces() ──→ Map tab (list/map toggle)
    │                          ──→ DayDetail (place images for hero fallback)
    │
    └── documents ──→ useDocuments() ──→ Más > Documentación
                                     ──→ Más > Seguro (filter type='insurance')
```

Country detection flow:

```
itineraryItems (today's date)
    → determineDayLocation(items) → city name
    → CITY_COUNTRY_MAP[city] → 'vietnam' | 'cambodia'
    → GREETING_STRINGS[country] → { title, subtitle }
```

## Route Table

| Path              | Component         | Tab        | Action                                     |
| ----------------- | ----------------- | ---------- | ------------------------------------------ |
| `/`               | `Dashboard`       | Inicio     | Modify: dynamic greeting                   |
| `/schedule`       | `Schedule`        | Itinerario | Modify: default list mode, day groups      |
| `/schedule/:date` | `DayDetail` (new) | —          | Create: merged DayView + DailyPlan         |
| `/map`            | `Places` (reused) | Mapa       | Add route alias                            |
| `/more`           | `MorePage` (new)  | Más        | Create: help hub + settings                |
| `/pre-travel`     | `PreTravel`       | —          | Keep (accessed from Más)                   |
| `/documents`      | `Documents`       | —          | Keep (accessed from Más)                   |
| `/daily/:date`    | —                 | —          | **Remove** (redirect to `/schedule/:date`) |
| `/settings`       | —                 | —          | **Remove** (absorbed into MorePage)        |

## Component Tree

```
App
└── Layout
    ├── BottomNav (4 tabs: Inicio, Itinerario, Mapa, Más)
    └── Routes
        ├── Dashboard
        │   ├── DynamicGreeting (new)
        │   ├── TripCountdown (fix duplication)
        │   ├── NextEvent (add date + navigation)
        │   ├── QuickAccessCard[]
        │   └── RecentActivity
        ├── Schedule
        │   ├── ViewToggle (list/calendar)
        │   ├── DayGroupCard[] (new)
        │   │   ├── DayGroupHeader (title, date, day-X tag, summary)
        │   │   └── EventCard[] (reused)
        │   └── Calendar (existing, secondary view)
        ├── DayDetail (new — replaces DayView + DailyPlan)
        │   ├── DayHeroCard (new — image, date, title, location)
        │   ├── PlanningDescription
        │   ├── CollapsibleSection "Actividades"
        │   │   └── EventCard[]
        │   ├── AccommodationCard (new — hotel info)
        │   ├── CollapsibleSection "Tips"
        │   ├── CollapsibleSection "Consejos culturales"
        │   └── CollapsibleSection "Recomendaciones"
        │       └── RecommendationCard[]
        ├── Places (reused as /map)
        └── MorePage (new)
            ├── HelpSection
            │   ├── PreTravelLink → /pre-travel
            │   ├── DocumentsLink → /documents
            │   ├── InsuranceCard (new — tel: links)
            │   └── EmbassyCard (new — tel: + address)
            └── SettingsSection (reused from Settings.tsx)
```

## File Changes

| File                                           | Action    | Description                                                                       |
| ---------------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| `src/components/layout/BottomNav.tsx`          | Modify    | 5→4 tabs, update navItems array                                                   |
| `src/App.tsx`                                  | Modify    | Add `/map`, `/more`, `/schedule/:date` routes; remove `/daily/:date`, `/settings` |
| `src/pages/Dashboard.tsx`                      | Modify    | Replace hardcoded title with `DynamicGreeting`                                    |
| `src/components/dashboard/DynamicGreeting.tsx` | Create    | Country-aware greeting using `useCurrentCountry()`                                |
| `src/hooks/useCurrentCountry.ts`               | Create    | Hook: today's items → city → country → greeting strings                           |
| `src/utils/dailyPlan.ts`                       | Modify    | Add `CITY_COUNTRY_MAP` constant                                                   |
| `src/components/dashboard/TripCountdown.tsx`   | Modify    | Fix "17 17 días" — render number and unit separately                              |
| `src/components/dashboard/NextEvent.tsx`       | Modify    | Navigate to `/schedule/:date` instead of `/schedule/:date`; date already shown    |
| `src/pages/Schedule.tsx`                       | Modify    | Default to list mode, group by day with `DayGroupCard`                            |
| `src/components/schedule/DayGroupCard.tsx`     | Create    | Day group card with header, summary, past/current/future styling                  |
| `src/utils/schedule.ts`                        | Modify    | Add `groupEventsByDate()` utility                                                 |
| `src/pages/DayDetail.tsx`                      | Create    | Merged day detail with hero, sections, accommodation                              |
| `src/components/daily/DayHeroCard.tsx`         | Create    | Hero image card for day detail                                                    |
| `src/components/daily/AccommodationCard.tsx`   | Create    | Hotel info card reusing existing accommodation data                               |
| `src/components/daily/CollapsibleSection.tsx`  | Create    | Reusable expand/collapse section wrapper                                          |
| `src/pages/MorePage.tsx`                       | Create    | Más hub with help sections + settings                                             |
| `src/components/more/InsuranceCard.tsx`        | Create    | Insurance info with tap-to-call                                                   |
| `src/components/more/EmbassyCard.tsx`          | Create    | Embassy info with address + phone                                                 |
| `src/pages/DayView.tsx`                        | Delete    | Consolidated into DayDetail                                                       |
| `src/pages/DailyPlan.tsx`                      | Delete    | Consolidated into DayDetail                                                       |
| `src/pages/Settings.tsx`                       | Delete    | Absorbed into MorePage                                                            |
| `src/types/index.ts`                           | Modify    | Add `heroImage?: string` to `DailyPlan` interface                                 |
| `src/db/schema.ts`                             | No change | `dailyPlans` schema already flexible enough                                       |
| `src/db/seed.ts`                               | Modify    | Add `heroImage` to dailyPlans, add accommodation-type itinerary items             |

## Key Interfaces

```typescript
// useCurrentCountry hook
interface CountryGreeting {
  country: CountryCode | null
  title: string // "Xin chào" | "សួស្តី" | "Hola"
  subtitle: string // "Bienvenido a Vietnam" | "Bienvenido a Camboya" | ""
}
function useCurrentCountry(items: ItineraryItem[]): CountryGreeting

// DayGroupCard
interface DayGroupCardProps {
  date: string
  dayNumber: number
  totalDays: number
  events: ItineraryItem[]
  status: 'past' | 'current' | 'future'
  accommodation?: ItineraryItem
  onClick: () => void
}

// DayHeroCard
interface DayHeroCardProps {
  image?: string
  date: string
  title: string
  location: string | null
  dayNumber: number
  totalDays: number
}

// CollapsibleSection
interface CollapsibleSectionProps {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}
```

## Testing Strategy

| Layer       | What to Test                                                | Approach                                            |
| ----------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Build       | No TypeScript/compilation errors                            | `npm run build` as gate per phase                   |
| Visual      | Nav renders 4 tabs, day groups styled correctly             | Manual verification per phase                       |
| Unit        | `groupEventsByDate()`, `useCurrentCountry()`, countdown fix | No test runner exists — verified via build + manual |
| Integration | Navigation flow: tab → page → day detail → back             | Manual walkthrough per phase                        |

## Migration / Rollout

No data migration required. The `DailyPlan.heroImage` field is optional — existing seed data works without it. The `itineraryItems` table already supports `type: 'accommodation'`. New seed entries are additive.

Route changes: `/daily/:date` redirects to `/schedule/:date` during transition. `/settings` removed — functionality lives in MorePage.

## Open Questions

- [ ] Hero image sourcing: seed data needs actual image URLs or base64 placeholders. Should we use Unsplash URLs or local assets?
- [ ] Embassy data: hardcode two entries (Hanoi + Phnom Penh) in a constant, or add to seed data as a new `embassies` structure within documents?
