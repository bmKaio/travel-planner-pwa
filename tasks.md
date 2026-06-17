# Travel Planner PWA — Phase 5 Tasks

## Change

- **Name**: travel-planner-pwa-phase-5
- **Scope**: Places and Map UI — Leaflet map, list view, place detail, create/edit form, Google Maps integration.
- **Delivery strategy**: single-pr
- **Review budget**: ~900 lines

## Phase 5: Places and Map UI

- [x] 5.1 Install Leaflet packages
  - `leaflet@^1.9.4`
  - `react-leaflet@^4.2.1`
  - `@types/leaflet@^1.9.12`
- [x] 5.2 Create places utility module (`src/utils/places.ts`)
  - Category config (icons, colors, marker colors)
  - Google Maps URL builder
  - Coordinate formatter
  - Comma-separated list helpers
- [x] 5.3 Create `MapView` component (`src/components/places/MapView.tsx`)
  - Leaflet map with OpenStreetMap tiles
  - Color-coded category markers
  - Popups with info and actions
  - Fit bounds on load
  - Focus place via `flyTo`
- [x] 5.4 Create `PlaceCard` component (`src/components/places/PlaceCard.tsx`)
  - Place info, category badge
  - View on map / Google Maps actions
  - Edit and delete actions
- [x] 5.5 Create `PlaceDetail` page (`src/pages/PlaceDetail.tsx`)
  - Route `/places/:id`
  - Full place information display
  - Google Maps, share, edit, delete actions
  - Image gallery
- [x] 5.6 Create `PlaceForm` component (`src/components/places/PlaceForm.tsx`)
  - Create/edit modal form
  - All required and optional fields
  - Image upload (base64)
  - Geolocation helper
  - Validation
- [x] 5.7 Update `Places` page (`src/pages/Places.tsx`)
  - Map and list view toggle
  - Search and category filter
  - FAB to add place
  - Empty states
  - Toast and confirm dialog integration
- [x] 5.8 Update `App.tsx`
  - Lazy import `PlaceDetail`
  - Add `/places/:id` route
- [x] 5.9 Verify build, lint, and formatting
  - `npm run build` succeeds
  - `npm run lint` passes
  - `npm run format:check` passes

## Phase 6: Daily Plan UI

- [x] 6.1 Create daily plan utility module (`src/utils/dailyPlan.ts`)
  - City keyword mapping for location detection
  - Day location detection from itinerary items
  - Place filtering by location
  - Morning/afternoon/evening time grouping
- [x] 6.2 Create `CulturalNote` component (`src/components/daily/CulturalNote.tsx`)
  - BookOpen icon and expandable long content
- [x] 6.3 Create `DayTip` component (`src/components/daily/DayTip.tsx`)
  - Lightbulb icon, collapsible list
  - Important vs nice-to-know priority heuristic
- [x] 6.4 Create `DailyRecommendation` component (`src/components/daily/DailyRecommendation.tsx`)
  - Priority badges (must-see, if-time, optional)
  - Links to matching `PlaceDetail` when available
  - Collapsible section
- [x] 6.5 Create `DailyPlanForm` component (`src/components/daily/DailyPlanForm.tsx`)
  - Edit cultural notes, tips, and recommendations
  - Does not modify itinerary items
  - Persists updates to `dailyPlans` table
- [x] 6.6 Create `DailyPlanCard` component (`src/components/daily/DailyPlanCard.tsx`)
  - Day location badge
  - Collapsible activities and places sections
  - Morning/afternoon/evening grouping
  - Links to `PlaceDetail` for each place
  - Inline `EventCard` for each activity
  - Empty states for activities, places, cultural notes, and tips
- [x] 6.7 Create `DailyPlan` page (`src/pages/DailyPlan.tsx`)
  - Route `/daily/:date`
  - Day header with previous/next day navigation
  - Back button to schedule
  - Link to `DayView` simple timeline
  - Edit button opening `DailyPlanForm`
  - Integrates `useItinerary`, `usePlaces`, and `dailyPlans` table
- [x] 6.8 Update `App.tsx`
  - Lazy import `DailyPlan`
  - Add `/daily/:date` route
- [x] 6.9 Update `Schedule.tsx`
  - Calendar day tap navigates to `/daily/:date`
- [x] 6.10 Update `DayView.tsx`
  - Add "Full day plan" button linking to `/daily/:date`
- [x] 6.11 Verify build, lint, and formatting
  - `npm run build` succeeds
  - `npm run lint` passes

## Review Workload Forecast

- Estimated changed lines: ~900-1100
- 400-line budget risk: High
- Chained PRs recommended: No
- Decision needed before apply: No
