# Peru itinerary: free-time slots and alternative sights

- **Branch:** `feat/viaje-peru`
- **TDD:** on (global Strict TDD, recorded in `odd/tasks/multi-trip.md`); runner `npm test` (Vitest)

## Objective

Plan items that are not a place to go (free time, included transfers, generic meals,
departures and arrivals by the circuit bus) must not show a "Cómo llegar" button. Days with free
time get alternative sights (markets, streets, museums, viewpoints) that are not already in the
day's plan.

## Scope

- `PlanItem.q` becomes optional; no `q` means no maps button (Plan list and "Ahora" card).
- `SeeItem.alternative?: boolean`; the "Visitar" tab lists planned visits first, then a
  separate "Si os sobra tiempo" group with the alternatives.
- Content: remove `q` from non-destination items; free-time items point to the "Visitar" tab;
  add sourced alternatives for 18, 19, 20, 22, 24, 25 and 27 Oct; bump `seedVersion`.

## Constraints

- UI copy in Spanish; code and comments in English.
- Alternatives need a source and must be open on the slot's weekday (or say otherwise).
- Push only when the user asks.

## Tasks

- [x] T1 Optional plan `q` + `planItemUrl` (TDD) + PlanList / NowCard / TodayPage
- [x] T2 `alternative` see items + `splitSeeItems` (TDD) + SeeList groups
- [x] T3 Research alternatives (sourced, weekday-checked)
- [x] T4 Content update in `src/trips/content/peru-2026.ts`, seedVersion 5

## Checks

`npm test`, `npm run lint`, `npm run format:check`, `npm run build`.

## Progress

- Started 2026-10-14.
- T1+T2 done in c4bf76d5: RED observed (`planItemUrl is not a function`), GREEN 110/110 tests, lint and typecheck clean.
- T3: sourced research (session scratchpad); excluded Mercado de Surquillo (closed since 2023), Museo Santuarios Andinos (closed Mondays), Yavari (closes 17:00), Museo Inka (Saturday 16:00), Aguas Calientes museums (closed at night). Weak-hours items say "Confirmad el horario".
- T4: `q` removed from 18 non-destination items; free-time items on 18, 19, 20, 22, 24, 27 point to "Visitar"; 30 alternatives on 18, 19, 20, 22, 24, 25, 27; Consettur bus stop query (name on Maps not verified); seedVersion 5. Checks: 110 tests, lint, format, build OK.

## Next step

Push when the user asks; check the Consettur query opens the right spot on Maps.
