# accommodation-display Specification

## Purpose

Display accommodation details (where the traveler sleeps each night) within day detail and itinerary views.

## Requirements

### Requirement: Accommodation Info in Day Views

The system MUST display accommodation information for each day that has lodging data. The display SHALL include hotel name and address. When available, check-in and check-out information SHALL also be shown. Accommodation info SHALL appear in both the day group card (itinerary list) and the day detail view.

#### Scenario: Day has accommodation data

- GIVEN day 3 has accommodation at "Hotel Angkor Paradise, Siem Reap"
- WHEN viewing the day 3 group card or day detail
- THEN the hotel name "Hotel Angkor Paradise" is shown
- AND the address "Siem Reap" is shown
- AND an accommodation icon (e.g., bed/building) precedes the info

#### Scenario: Check-in/check-out available

- GIVEN day 3 accommodation has check-in "14:00" and check-out "12:00" (next day)
- WHEN accommodation details render
- THEN check-in time is displayed
- AND check-out time is displayed (or "hasta las 12:00")

#### Scenario: No accommodation data for day

- GIVEN day 7 has no lodging entry
- WHEN viewing day 7 in any view
- THEN no accommodation section is rendered for that day
- AND the layout does not show empty placeholders
