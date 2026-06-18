# next-event-enhanced Specification

## Purpose

Enhanced next-event card that adds date display and tap-to-navigate functionality to the existing event preview on the dashboard.

## Requirements

### Requirement: Next Event Card with Date and Navigation

The next-event card MUST display the event's date prominently alongside existing fields (icon, title, time, location, relative time). The card MUST be tappable and SHALL navigate the user to the full day detail view for that event's date.

#### Scenario: Tapping next event navigates to day detail

- GIVEN the next upcoming event belongs to day 3 of the trip
- WHEN the user taps the next-event card
- THEN the app navigates to `/schedule/3` (or the day's detail route)
- AND the day detail page loads showing the full schedule for that day

#### Scenario: Date displayed on card

- GIVEN the next event is on "15 de junio"
- WHEN the next-event card renders
- THEN the event date (e.g., "15 jun") is visible on the card
- AND the existing icon, title, time, and location remain visible
- AND the relative time label (e.g., "Mañana") continues to display

#### Scenario: No upcoming events exist

- GIVEN all itinerary events have already passed
- WHEN the dashboard loads
- THEN the next-event card shows a message indicating no upcoming events
- AND the card is not tappable or navigates nowhere
