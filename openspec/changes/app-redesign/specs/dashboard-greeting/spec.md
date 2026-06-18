# dashboard-greeting Specification

## Purpose

Dynamic, country-aware greeting on the dashboard that auto-detects the traveler's current country from itinerary events and renders a localized greeting with a Spanish subtitle.

## Requirements

### Requirement: Dynamic Country-Aware Greeting

The system MUST detect the traveler's current country based on itinerary events for the current date and display a localized greeting. The greeting SHALL update automatically when the itinerary crosses a country border.

| Rule              | Behavior                                                     |
| ----------------- | ------------------------------------------------------------ |
| Vietnam detected  | Title: "Xin chào", Subtitle: "Bienvenido a Vietnam"          |
| Cambodia detected | Title: "សួស្តី" (Sous-dey), Subtitle: "Bienvenido a Camboya" |
| No active trip    | Title: generic fallback, Subtitle: empty or hidden           |

The detection SHALL use the existing `CITY_KEYWORDS` map and itinerary event city/country data for the current date.

#### Scenario: Traveler is in Vietnam

- GIVEN an active trip with an itinerary event in Ho Chi Minh City on the current date
- WHEN the dashboard loads
- THEN the greeting title is "Xin chào"
- AND the subtitle is "Bienvenido a Vietnam"

#### Scenario: Traveler crosses into Cambodia

- GIVEN an active trip with an itinerary event in Phnom Penh on the current date
- WHEN the dashboard loads
- THEN the greeting title is "សួស្តី"
- AND the subtitle is "Bienvenido a Camboya"

#### Scenario: No active trip

- GIVEN no trip is currently active (no trip spans the current date)
- WHEN the dashboard loads
- THEN a generic fallback greeting is shown (e.g., "Hola")
- AND no country-specific subtitle is displayed

#### Scenario: Ambiguous date — no event on current date

- GIVEN an active trip but no itinerary event matches the current date
- WHEN the dashboard loads
- THEN the system SHOULD fall back to the last known country from the most recent past event
- OR show the generic fallback if no prior events exist
