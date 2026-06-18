# Tasks: App-Wide UI/UX Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900-1000 |
| 400-line budget risk | High |
| 800-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Navigation shell + countdown fix | PR 1 | Base = `feature/app-redesign` tracker branch |
| 2 | Dashboard greeting + NextEvent | PR 2 | Base = `pr-1-nav-shell` branch |
| 3 | Schedule day groups + itinerary | PR 3 | Base = `pr-2-dashboard-greeting` branch |
| 4 | Day detail (hero card, sections, accommodation) | PR 4 | Base = `pr-3-schedule` branch |
| 5 | Más help hub | PR 5 | Base = `pr-4-day-detail` branch |

Tracker branch: `feature/app-redesign` (draft PR, no merge until all children reviewed)

### Dependency Diagram

```
feature/app-redesign (draft tracker)
  └── PR 1: nav-shell         (base: tracker)
        └── PR 2: greeting    (base: pr-1)
              └── PR 3: schedule  (base: pr-2)
                    └── PR 4: day-detail (base: pr-3)
                          └── PR 5: mas-hub   (base: pr-4)
```

## Phase 1: Navigation Shell + Countdown Fix (~100 lines)

- [x] T1.1 Modify `src/components/layout/BottomNav.tsx` — reduce navItems to 4: Inicio, Itinerario, Mapa, Más; remove Pre-viaje; change Lugares→Mapa icon
- [x] T1.2 Modify `src/App.tsx` — add `/map` route → lazy `Places`; add `/more` route → lazy `MorePage`; add `/schedule/:date` → lazy `DayDetail`; remove `/daily/:date`; remove `/settings`
- [x] T1.3 Modify `src/components/dashboard/TripCountdown.tsx` — fix "17 17 días" bug: render number and `formatCountdownDays()` on separate lines, never duplicate number
- [x] T1.4 Update `src/utils/dashboard.ts` — remove `formatCountdownDays()` inline number+unit (component handles layout); keep as pure label utility
- [x] T1.5 Verify: `npm run build` passes; BottomNav shows 4 tabs; countdown shows "17" on one line, "días" on next

## Phase 2: Dashboard Greeting + NextEvent Enhanced (~180 lines)

- [x] T2.1 Create `src/hooks/useCurrentCountry.ts` — hook that accepts `ItineraryItem[]`, finds today's items, runs `determineDayLocation()`, maps city→country via `CITY_COUNTRY_MAP`, returns `CountryGreeting`
- [x] T2.2 Modify `src/utils/dailyPlan.ts` — add `CITY_COUNTRY_MAP` constant: `{ Hanoi: 'vietnam', 'Siem Reap': 'cambodia', 'Phnom Penh': 'cambodia' }` etc.
- [x] T2.3 Create `src/components/dashboard/DynamicGreeting.tsx` — displays country-aware title/subtitle from `useCurrentCountry()`; fallback "Hola" + empty subtitle when no trip active
- [x] T2.4 Modify `src/pages/Dashboard.tsx` — replace hardcoded "Vietnam + Camboya 2026" title with `<DynamicGreeting>`; remove wifi online badge
- [x] T2.5 Modify `src/components/dashboard/NextEvent.tsx` — navigate to `/schedule/:date` (already works); verify date display and card navigation
- [x] T2.6 Verify: dashboard shows "Xin chào / Bienvenido a Vietnam" for Hanoi dates; NextEvent navigates to day detail

## Phase 3: Schedule Day Groups + Itinerary (~200 lines)

- [x] T3.1 Modify `src/utils/schedule.ts` — add `groupEventsByDate()` utility: O(n) reduce by date, returns sorted `DayGroup[]` with computed dayNumber, totalDays, status (past/current/future)
- [x] T3.2 Create `src/components/schedule/DayGroupCard.tsx` — card with day title, formatted date, "Día X de Y" tag, 1-line summary; past=dimmed(60%+gray), current=highlighted(border), future=normal; entire card is tappable → `/schedule/:date`
- [x] T3.3 Modify `src/pages/Schedule.tsx` — default `viewMode` to `'list'`; render `DayGroupCard[]` grouped by date in list mode; keep calendar toggle working; update navigation from `/daily/:date` to `/schedule/:date`
- [x] T3.4 Verify: Schedule loads in list mode with day groups; past days dimmed but navigable; calendar toggle still works; `npm run build` passes

## Phase 4: Day Detail + Accommodation (~300 lines)

- [x] T4.1 Modify `src/types/index.ts` — add optional `heroImage?: string` to `DailyPlan` interface
- [x] T4.2 Modify `src/db/seed.ts` — add `heroImage` URLs to key `dailyPlans` entries; add check-in/check-out data to accommodation-type `itineraryItems`
- [x] T4.3 Create `src/components/daily/CollapsibleSection.tsx` — reusable expand/collapse section with title, optional icon, defaultOpen prop, chevron indicator
- [x] T4.4 Create `src/components/daily/DayHeroCard.tsx` — full-width hero with background image (or gradient fallback), overlaid date, title, location, "Day X of Y" tag
- [x] T4.5 Create `src/components/daily/AccommodationCard.tsx` — hotel info card with icon, name, address, check-in/check-out; hidden when no accommodation data
- [x] T4.6 Create `src/pages/DayDetail.tsx` — merged page: hero card → planning description → CollapsibleSection "Actividades" (EventCards) → AccommodationCard → "Tips" → "Consejos culturales" → "Recomendaciones"; nav back to `/schedule`
- [x] T4.7 Delete `src/pages/DayView.tsx` — consolidated into DayDetail
- [x] T4.8 Delete `src/pages/DailyPlan.tsx` — consolidated into DayDetail
- [x] T4.9 Verify: `/schedule/2026-07-05` shows hero, description, collapsible sections, accommodation; `/daily/2026-07-05` redirects; `npm run build` passes

## Phase 5: Más Help Hub (~180 lines)

- [x] T5.1 Create `src/components/more/InsuranceCard.tsx` — insurance company, policy number, tap-to-call `tel:` link; filter documents by `type='insurance'`
- [x] T5.2 Create `src/components/more/EmbassyCard.tsx` — embassy name, address, `tel:` phone link; hardcoded entries for Hanoi + Phnom Penh
- [x] T5.3 Create `src/pages/MorePage.tsx` — scrollable hub: Help Section (Pre-viaje → `/pre-travel`, Documentación → `/documents`), InsuranceCard, EmbassyCard, then Settings Section (theme toggle, export/import) migrated from Settings.tsx
- [x] T5.4 Delete `src/pages/Settings.tsx` — absorbed into MorePage
- [x] T5.5 Verify: Más tab shows all sections; Pre-viaje, Documents, Insurance `tel:` link, Embassy work; theme toggle toggles dark mode; `npm run build` passes
