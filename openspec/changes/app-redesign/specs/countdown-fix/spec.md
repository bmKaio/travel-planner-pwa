# countdown-fix Specification

## Purpose

Fix the TripCountdown component's duplicate number display bug and define clean countdown rendering across all trip phases.

## Requirements

### Requirement: Clean Countdown Display

The countdown MUST display the remaining days as a single number with the unit "días" appearing exactly once. The number and unit SHALL appear on separate visual lines or combined cleanly.

| Phase       | Display                                                  |
| ----------- | -------------------------------------------------------- |
| Before trip | Big number (e.g., "17") on one line, "días" on next line |
| During trip | Appropriate message (e.g., "En viaje")                   |
| After trip  | "Viaje completado"                                       |

The system MUST NOT duplicate the numeric value (e.g., "17 17 días" is forbidden).

#### Scenario: Trip starts in 17 days

- GIVEN the trip start date is 17 days from the current date
- WHEN the countdown renders
- THEN the display shows "17" as a large number on one line
- AND "días" appears on the next line below the number
- AND the number "17" appears exactly once in the rendered output

#### Scenario: Trip starts in 1 day

- GIVEN the trip start date is tomorrow
- WHEN the countdown renders
- THEN the display shows "1" on one line and "día" (singular) on the next line

#### Scenario: Trip is currently active

- GIVEN the current date falls within the trip start and end dates
- WHEN the countdown renders
- THEN the display shows an in-progress message (e.g., "En viaje" or "Día X de Y")
- AND no numeric countdown is shown

#### Scenario: Trip has ended

- GIVEN the current date is after the trip end date
- WHEN the countdown renders
- THEN the display shows "Viaje completado"
- AND no numeric countdown is shown
