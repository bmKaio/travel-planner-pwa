# navigation-shell Specification

## Purpose

New 4-tab bottom navigation replacing the current 5-tab layout. Consolidates Places + Map into one tab and relocates Pre-viaje into the Más hub.

## Requirements

### Requirement: Four-Tab Bottom Navigation

The bottom navigation MUST render exactly four tabs: Inicio (/), Itinerario (/schedule), Mapa (/map), and Más (/more). The active tab SHALL be visually highlighted. The Pre-viaje tab MUST NOT appear in the bottom navigation.

| Tab        | Label      | Icon                | Route     |
| ---------- | ---------- | ------------------- | --------- |
| Inicio     | Inicio     | Home                | /         |
| Itinerario | Itinerario | Calendar/List       | /schedule |
| Mapa       | Mapa       | Map                 | /map      |
| Más        | Más        | MoreHorizontal/Menu | /more     |

#### Scenario: Four tabs render correctly

- GIVEN the app loads on the dashboard (Inicio)
- WHEN the bottom navigation renders
- THEN exactly four tabs are visible: Inicio, Itinerario, Mapa, Más
- AND the Inicio tab is highlighted as active
- AND no fifth tab (Pre-viaje) is present

#### Scenario: Navigating between tabs

- GIVEN the user is on the Inicio tab
- WHEN the user taps "Itinerario"
- THEN the app navigates to /schedule
- AND the Itinerario tab highlights as active
- AND Inicio deselects

### Requirement: Map Tab Consolidation

The Mapa tab SHALL consolidate the previous Places list and Map view into a single tab with sub-navigation (e.g., list/map toggle or tabs within the page).

#### Scenario: Map tab shows list and map options

- GIVEN the user taps the Mapa tab
- WHEN the /map page loads
- THEN the user can switch between a places list view and a map view
- AND both views are accessible from within the same tab

### Requirement: Pre-viaje Relocation

Pre-viaje content MUST be accessible from within the Más section and MUST NOT appear as a separate tab in the bottom navigation.

#### Scenario: Pre-viaje accessible via Más

- GIVEN the user taps the Más tab
- WHEN the Más page loads
- THEN a "Pre-viaje" entry point is visible
- AND tapping it navigates to the pre-travel planning view
