# Proposal: App-Wide UI/UX Redesign

## Intent

Redesign the travel planner PWA to deliver a richer, context-aware travel companion experience. The dashboard should greet travelers with country-specific language and adapt as the trip progresses across borders. The itinerary should present a day-grouped narrative instead of a flat event list. Day detail views should feel immersive with hero imagery and structured cultural content. Navigation simplifies from 5 to 4 tabs, relocating pre-travel into a consolidated "Más" hub that also hosts help resources (documents, insurance, embassy).

Additionally, fix the countdown duplication bug ("17 17 días") and enhance the next event card with date display and direct navigation.

## Scope

### In Scope

- **Dynamic dashboard greeting**: Country-aware title/subtitle (e.g., "Xin chào" / "Bienvenido a Vietnam") that transitions when the itinerary crosses into Cambodia
- **Countdown bug fix**: Eliminate duplicate number display in TripCountdown "before" phase
- **Next event enhancement**: Show event date and add tap-to-navigate to full day detail
- **Itinerary redesign**: Default to list mode grouped by day; each day group shows title with highlights, date, "Day X of trip" tag, summarized description; past days dimmed but navigable
- **Night accommodation details**: Show hotel/sleeping info per night in day views
- **Day detail redesign**: Hero card with representative image (date, title, location), planning description, then sections: Activities, Tips, Cultural Tips (expanded), Recommendations (places, food, restaurants)
- **Navigation restructure**: 4-tab bottom nav — Inicio, Itinerario, Mapa, Más; remove Pre-viaje tab
- **"Más" section enhancement**: Add Help hub with documents view, insurance info (tap-to-call, policy lookup), Spanish embassy info (phone + map), plus existing settings (theme, export/import)

### Out of Scope

- Multi-trip support or trip switching
- Budget/expense tracking
- Weather integration or photo gallery
- Global search across entities
- Onboarding flow or notifications system
- Test infrastructure (no test runner exists)
- Data model changes to TRIP_META or seed structure

## Capabilities

> Contract between proposal and specs phases. No existing specs in `openspec/specs/` — all are new.

### New Capabilities

- `dashboard-greeting`: Dynamic country-aware greeting that auto-detects current location from itinerary events and transitions across countries
- `countdown-fix`: Fix TripCountdown duplication bug and clean up countdown display
- `next-event-enhanced`: Next event card with date display and navigation action to day detail
- `itinerary-day-groups`: Schedule list mode grouped by day with day cards (title, date, day-of-trip tag, summary, past-day dimming)
- `accommodation-display`: Night accommodation details shown in day views
- `day-detail-hero`: Immersive day detail with hero image card, structured sections (activities, tips, cultural tips, recommendations)
- `navigation-shell`: 4-tab bottom nav (Inicio, Itinerario, Mapa, Más) replacing current 5-tab layout
- `more-help-hub`: Consolidated "Más" section with Help resources (documents, insurance with tap-to-call, embassy info) and existing settings

### Modified Capabilities

None — no existing specs to modify.

## Approach

**Foundation-first strategy** (recommended by exploration):

1. **Phase 1 — Shell + Bug Fix**: Redesign BottomNav (5→4 tabs), fix countdown bug, update route structure. This establishes the new navigation frame with minimal risk.
2. **Phase 2 — Dashboard**: Dynamic greeting with country detection (reuse existing `CITY_KEYWORDS` → map to country), enhanced NextEvent card.
3. **Phase 3 — Itinerary**: Redesign Schedule to default list mode with day groups, day cards with highlights and summaries, past-day dimming.
4. **Phase 4 — Day Detail**: Hero card component, restructured DailyPlan sections, accommodation display.
5. **Phase 5 — Más Hub**: New Help page aggregating documents, insurance, embassy, and existing settings.

Each phase produces independently reviewable changes. Country detection reuses the existing `determineDayLocation()` utility, extended to map cities → countries.

## Affected Areas

| Area                                           | Impact   | Description                                                               |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `src/components/layout/BottomNav.tsx`          | Modified | 5→4 tabs, remove Pre-viaje, rename Schedule→Itinerario, Lugares→Mapa      |
| `src/App.tsx`                                  | Modified | Route additions for help/hub pages                                        |
| `src/pages/Dashboard.tsx`                      | Modified | Dynamic greeting replacing hardcoded title, remove duplicate online badge |
| `src/components/dashboard/TripCountdown.tsx`   | Modified | Fix "17 17 días" duplication                                              |
| `src/components/dashboard/NextEvent.tsx`       | Modified | Add date display, navigation to day detail                                |
| `src/pages/Schedule.tsx`                       | Modified | Default to list mode, day-grouped layout                                  |
| `src/pages/DailyPlan.tsx`                      | Modified | Hero card, restructured sections, accommodation                           |
| `src/components/daily/DailyPlanCard.tsx`       | Modified | New section layout (activities, tips, cultural, recs)                     |
| `src/pages/Settings.tsx`                       | Modified | Absorbed into Más hub or replaced by new MorePage                         |
| `src/utils/dashboard.ts`                       | Modified | Country detection utility, greeting strings                               |
| `src/utils/dailyPlan.ts`                       | Modified | Extend city→country mapping                                               |
| `src/pages/MorePage.tsx`                       | New      | Más hub with Help section                                                 |
| `src/components/dashboard/DynamicGreeting.tsx` | New      | Country-aware greeting component                                          |
| `src/components/schedule/DayGroup.tsx`         | New      | Day group card for itinerary list                                         |
| `src/components/daily/DayHeroCard.tsx`         | New      | Hero image card for day detail                                            |

## Risks

| Risk                                                            | Likelihood | Mitigation                                                                           |
| --------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| No test coverage — visual regressions undetected                | High       | Manual verification per phase; `npm run build` as gate                               |
| Seed data coupling — greeting/hero assume Vietnam+Cambodia data | Med        | Guard with fallbacks; use optional chaining on missing data                          |
| Mixed Spanish/English strings persist                           | Med        | Standardize: UI labels in Spanish, code identifiers in English                       |
| DayView/DailyPlan overlap confusion                             | Med        | This redesign consolidates — DailyPlan becomes primary, DayView deprecated or merged |
| Large total change surface (~25 files, ~1500 lines)             | Med        | Foundation-first phasing keeps each slice under 400 lines                            |

## Rollback Plan

Each phase is an independent commit on a feature branch. Rollback per phase:

1. **Nav shell**: Revert `BottomNav.tsx` + `App.tsx` route changes — restores 5-tab layout
2. **Dashboard**: Revert `Dashboard.tsx` + `TripCountdown.tsx` + `NextEvent.tsx` — restores hardcoded title and original countdown
3. **Itinerary**: Revert `Schedule.tsx` + new `DayGroup.tsx` — restores calendar/list toggle
4. **Day detail**: Revert `DailyPlan.tsx` + `DailyPlanCard.tsx` + new `DayHeroCard.tsx` — restores current daily plan layout
5. **Más hub**: Revert `MorePage.tsx` + route changes — restores standalone Settings page

Full rollback: `git revert` each phase commit in reverse order, or reset branch to pre-redesign state.

## Dependencies

- Existing `CITY_KEYWORDS` map in `src/utils/dailyPlan.ts` for country detection
- Existing seed data (17 daily plans, 36 itinerary items) for day group content
- `lucide-react` icons for new UI elements
- No new npm packages required

## Success Criteria

- [ ] Dashboard shows country-specific greeting that updates when trip crosses borders
- [ ] Countdown displays clean number + unit (no duplication)
- [ ] Next event card shows date and navigates to day detail on tap
- [ ] Itinerary defaults to day-grouped list with day cards showing highlights, date, day-of-trip tag
- [ ] Past days are visually dimmed but remain tappable
- [ ] Day detail shows hero card with image, structured content sections
- [ ] Bottom nav has exactly 4 tabs: Inicio, Itinerario, Mapa, Más
- [ ] Más section includes documents, insurance (tap-to-call), embassy info, and settings
- [ ] `npm run build` passes with no errors
