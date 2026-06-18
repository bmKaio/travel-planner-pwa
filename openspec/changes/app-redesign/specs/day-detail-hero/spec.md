# day-detail-hero Specification

## Purpose

Redesigned immersive day detail view with a hero card, structured content sections, and collapsible layouts. Replaces or consolidates the existing DayView and DailyPlan pages.

## Requirements

### Requirement: Hero Card

The day detail view MUST render a hero card at the top containing: a representative image, the day's date, a title, and the main location name. The hero card SHALL be visually prominent at the top of the page.

#### Scenario: Day detail loads with hero card

- GIVEN day 5 data includes an image URL, date "15 de junio", title "Explorando Phnom Penh", and location "Phnom Penh"
- WHEN the day detail view loads
- THEN the hero card is shown at the top with the image as background
- AND the date, title, and location name are overlaid on the image
- AND the card spans the full width of the viewport

### Requirement: Planning Description

The day detail MUST include a brief planning description summarizing the day in 2-3 sentences, rendered below the hero card.

#### Scenario: Planning description renders

- GIVEN day 5 has a description field
- WHEN the day detail renders
- THEN the description text appears below the hero card
- AND the text is styled as narrative prose (not bullet points)

### Requirement: Structured Content Sections

The day detail MUST render the following collapsible/expandable sections below the planning description: "Actividades del día", "Tips", "Consejos culturales", and "Recomendaciones". Each section SHALL be independently expandable and collapsed by default unless otherwise specified.

| Section             | Content                                                 |
| ------------------- | ------------------------------------------------------- |
| Actividades del día | Activity list with times, titles, and descriptions      |
| Tips                | Practical advice (e.g., weather, dress code, transport) |
| Consejos culturales | Extended cultural tips in well-written paragraph style  |
| Recomendaciones     | Places to visit, places to eat, local food to try       |

#### Scenario: Sections expand and collapse independently

- GIVEN the day detail has content in all four sections
- WHEN the user taps "Consejos culturales"
- THEN only that section expands to show its content
- AND tapping it again collapses it
- AND other sections remain in their current state

#### Scenario: Section with no content is hidden

- GIVEN day 7 has no "Tips" content
- WHEN the day detail renders
- THEN the "Tips" section is either hidden or shown as empty with a "no tips available" message

### Requirement: View Consolidation

The redesigned day detail MUST replace the existing DayView and DailyPlan pages. There SHALL be a single route/handler for day detail after the redesign.

#### Scenario: Single day detail entry point

- GIVEN the redesign is deployed
- WHEN navigating to a day (e.g., `/schedule/3`)
- THEN the hero-based day detail view loads
- AND the old DayView and DailyPlan pages are no longer accessible
