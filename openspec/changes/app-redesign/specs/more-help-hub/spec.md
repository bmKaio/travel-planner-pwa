# more-help-hub Specification

## Purpose

Consolidated "Más" page aggregating pre-travel tools, a help resources hub, and existing settings in one accessible location.

## Requirements

### Requirement: Pre-viaje Section

The Más page MUST include a Pre-viaje entry point that navigates to the pre-travel planning view (formerly its own tab). This SHALL be the primary access point for pre-travel content.

#### Scenario: Pre-viaje accessible from Más

- GIVEN the user is on the Más page
- WHEN the user taps the Pre-viaje entry
- THEN the app navigates to the pre-travel planning view
- AND all existing pre-travel functionality remains intact

### Requirement: Help Resources Section

The Más page MUST include a Help section with subsections for Documentación, Seguro, and Embajada. This section SHALL be clearly separated from Pre-viaje and Settings.

#### Scenario: Documentación subsection

- GIVEN the user taps "Documentación" in the Help section
- WHEN the subsection loads
- THEN the existing Documents page content is shown (passports, tickets, hotel reservations, travel reservations)
- AND all document categories are accessible

#### Scenario: Seguro subsection with tap-to-call

- GIVEN insurance data includes company name "Allianz", policy number "POL-12345", and phone "+34 900 123 456"
- WHEN the Seguro subsection renders
- THEN the insurance company name and policy number are displayed
- AND the contact phone number is rendered as a `tel:` link for tap-to-call
- AND a policy document viewer is available if a policy document exists

#### Scenario: Embajada subsection with map

- GIVEN embassy data: "Embajada de España en Vietnam", address "4 Le Duan, Hanoi", phone "+84 24 3825 0000"
- WHEN the Embajada subsection renders
- THEN the embassy name, address, and phone (as `tel:` link) are displayed
- AND a map pin or embedded map shows the embassy location

### Requirement: Settings Retention

The Más page MUST retain existing settings functionality: theme toggle (light/dark) and data export/import. These SHALL be positioned below the Help section.

#### Scenario: Theme toggle works from Más

- GIVEN the current theme is light
- WHEN the user toggles the theme switch in the Más page
- THEN the app switches to dark theme
- AND the toggle reflects the new state

#### Scenario: Data export/import accessible

- GIVEN the user scrolls to the Settings section on the Más page
- WHEN export and import options are rendered
- THEN the user can export trip data and import previously exported data
- AND both operations behave as they did in the standalone Settings page
