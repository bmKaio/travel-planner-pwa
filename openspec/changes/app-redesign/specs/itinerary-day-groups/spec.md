# itinerary-day-groups Specification

## Purpose

Redesigned schedule page that defaults to a day-grouped list view with rich day cards, past/future/current day styling, and chronological ordering.

## Requirements

### Requirement: Day-Grouped List View

The schedule page MUST default to a list mode where itinerary items are grouped by day. Each day group SHALL render as a card containing: a day title (with highlights from that day), formatted date, "Día X de Y" tag, and a brief itinerary summary. Days SHALL be sorted chronologically.

#### Scenario: Schedule loads with day groups

- GIVEN a trip with 17 days of itinerary data
- WHEN the schedule page loads in default list mode
- THEN events are grouped by day, each day rendered as a separate card
- AND each card shows the day title, formatted date, and "Día X de 17" tag
- AND days are ordered chronologically from earliest to latest

#### Scenario: Day group card content

- GIVEN day 3 has events: "Visita al Templo" at 09:00 and "Mercado central" at 14:00
- WHEN the day 3 group card renders
- THEN the card shows "Día 3 de 17" tag
- AND the title references a highlight (e.g., "Templos de Angkor")
- AND a brief 1-line summary of the day's activities is shown

### Requirement: Day Status Styling

Past days MUST render with dimmed visual styling (reduced opacity, gray tones) but remain tappable. The current day SHALL render with highlighted styling. Future days SHALL render with normal styling.

#### Scenario: Past day is dimmed but navigable

- GIVEN day 2 is in the past relative to the current date
- WHEN the schedule list renders
- THEN the day 2 card shows reduced opacity (e.g., 60%)
- AND gray/muted tones are applied
- AND tapping the card still navigates to the day detail

#### Scenario: Current day is highlighted

- GIVEN today is day 5 of the trip
- WHEN the schedule list renders
- THEN the day 5 card has a highlighted border or background accent
- AND full opacity is applied

#### Scenario: Future day has normal styling

- GIVEN day 10 is in the future relative to the current date
- WHEN the schedule list renders
- THEN the day 10 card renders with full opacity and standard colors

### Requirement: Calendar View Toggle

The schedule page SHALL retain a toggle to switch between the default list view and an existing calendar view as a secondary option.

#### Scenario: Toggle to calendar view

- GIVEN the schedule page is in list mode
- WHEN the user taps the calendar toggle
- THEN the view switches to the calendar layout
- AND the toggle label/icon updates to indicate list mode is available
