# Responsive Layout and Guide Topics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Widen every v2 trip screen for tablets and turn the guide into a topic hub → topic list → entry navigation with per-topic colours and one predictable back button.

**Architecture:** Pure guide helpers in `src/trips/domain/guide.ts` (TDD) decide topics, counts, route-param validity and the entry page's back target. Presentational components read a literal-class style map per topic (`guideTopicStyle.ts`); container pages wire hooks + domain. Layout widening is Tailwind-only (`md:` breakpoint), no logic.

**Tech Stack:** React 18, React Router 6, Tailwind 3.4, lucide-react, Vitest (node env), Dexie (unchanged).

**Spec:** `docs/superpowers/specs/2026-10-14-responsive-guide-topics-design.md`

## Global Constraints

- Targets: phone (< 768 px, unchanged except the guide) and tablet (Tailwind `md`, ≥ 768 px). No desktop layout.
- Wide container: `max-w-md md:max-w-3xl`.
- Bottom nav stays on every device, same four items.
- Touch targets ≥ 48 px for new controls; body text 17–18 px; nothing gets smaller.
- Topic colours are new tokens; never reuse `action` / `done` / `urgent` for topics. Text uses ink tokens; colour is never the only cue.
- UI copy in Spanish; identifiers, comments, commits in English. Conventional commits, **no AI attribution / Co-Authored-By lines**.
- No content, schema or `seedVersion` change. Legacy Vietnam screens untouched.
- Branch `feat/viaje-peru`: commit locally only; do not push (push redeploys the preview).
- Strict TS with `noUnusedLocals` / `noUnusedParameters`.
- Per-task checks: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.

## Review Focus

1. Entry page reloaded (or opened from a shared link) after arriving from a day: router state is gone → back must go to the topic, never crash. Pinned by `guideBackTarget` tests (Task 1).
2. `fromDay` state with a date that is not a day of this trip, or a malformed value → back to the topic. Pinned by `readFromDay` + `guideBackTarget` tests (Task 1).
3. Topic URL typed wrong (`/guide/topic/Food`, `/guide/topic/places`, `/guide/topic/constructor`) → redirect to the hub. Pinned by `isGuideCategory` tests (Task 1).
4. Topic with exactly one entry reads "1 lectura", not "1 lecturas". Pinned by `formatReadingCount` test (Task 1).
5. Long topic names ("Curiosidades", "Gastronomía") on a 360 px phone in a 2-column grid must not overflow the card: name is `text-lg` on phone (`md:text-xl`) with `break-words hyphens-auto` (`<html lang="es">` already set). Checked in the owner's manual pass (Task 3).

---

## File map

| File                                         | Status | Responsibility                                                                                                                                   |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/trips/domain/guide.ts`                  | modify | + `GuideTopic`, `guideTopics`, `isGuideCategory`, `guideTopicEntries`, `formatReadingCount`, `readFromDay`, `GuideBackTarget`, `guideBackTarget` |
| `src/trips/domain/guide.test.ts`             | modify | tests for the above                                                                                                                              |
| `src/trips/components/TripLayout.tsx`        | modify | wide container                                                                                                                                   |
| `src/trips/components/TripNav.tsx`           | modify | wide container                                                                                                                                   |
| `src/trips/components/TripErrorBoundary.tsx` | modify | wide container                                                                                                                                   |
| `src/trips/pages/TripSwitcher.tsx`           | modify | wide container, 2-column trip cards on tablet                                                                                                    |
| `src/trips/pages/HelpPage.tsx`               | modify | 2-column help cards on tablet                                                                                                                    |
| `src/index.css`                              | modify | topic colour variables (light + dark)                                                                                                            |
| `tailwind.config.js`                         | modify | `trip-topic-*` colours                                                                                                                           |
| `src/trips/components/guideTopicStyle.ts`    | create | per-topic icon + literal Tailwind classes                                                                                                        |
| `src/trips/components/GuideTopicIcon.tsx`    | create | coloured icon circle                                                                                                                             |
| `src/trips/components/GuideTopicCard.tsx`    | create | hub card                                                                                                                                         |
| `src/trips/components/BackLink.tsx`          | create | button-styled back link                                                                                                                          |
| `src/trips/components/GuideTopicList.tsx`    | create | entry cards of one topic                                                                                                                         |
| `src/trips/pages/GuidePage.tsx`              | modify | topic hub                                                                                                                                        |
| `src/trips/pages/GuideTopicPage.tsx`         | create | one topic's entries                                                                                                                              |
| `src/App.tsx`                                | modify | `guide/topic/:category` route                                                                                                                    |
| `src/trips/components/GuideCardList.tsx`     | modify | optional `fromDay` → router state                                                                                                                |
| `src/trips/pages/ItineraryPage.tsx`          | modify | pass the day to `GuideCardList`                                                                                                                  |
| `src/trips/pages/GuideEntryPage.tsx`         | modify | single back button, topic chip, `max-w-prose`                                                                                                    |
| `CLAUDE.md`                                  | modify | route list                                                                                                                                       |

---

### Task 1: Guide topic domain helpers

**Files:**

- Modify: `src/trips/domain/guide.ts` (append after `groupGuide`)
- Test: `src/trips/domain/guide.test.ts`

**Interfaces:**

- Consumes: existing `GUIDE_SECTIONS`, `groupGuide`, `guideCategoryLabel`, types `GuideCategory`, `GuideEntry`.
- Produces:
  - `interface GuideTopic { category: GuideCategory; label: string; count: number }`
  - `guideTopics(entries: GuideEntry[]): GuideTopic[]`
  - `isGuideCategory(value: string | undefined): value is GuideCategory`
  - `guideTopicEntries(entries: GuideEntry[], category: GuideCategory): GuideEntry[]`
  - `formatReadingCount(count: number): string`
  - `readFromDay(state: unknown): string | undefined`
  - `interface GuideBackTarget { path: string; label: string }` — `path` is relative to `/trips/:tripId/`
  - `guideBackTarget(category: GuideCategory, fromDay: string | undefined, dayDates: string[]): GuideBackTarget`

- [ ] **Step 1: Write the failing tests**

In `src/trips/domain/guide.test.ts`, extend the import list:

```ts
import {
  GUIDE_SECTIONS,
  formatReadingCount,
  groupGuide,
  guideBackTarget,
  guideCategoryLabel,
  guideDayLinks,
  guideForDay,
  guideTopicEntries,
  guideTopics,
  isGuideCategory,
  readFromDay,
  sourceLabel,
} from './guide'
```

Append at the end of the file:

```ts
describe('guideTopics', () => {
  it('returns non-empty topics in reading order with their entry count', () => {
    const topics = guideTopics([
      entry('pisco', 'drink'),
      entry('incas', 'history'),
      entry('chicha', 'drink'),
    ])
    expect(topics).toEqual([
      { category: 'history', label: 'Historia', count: 1 },
      { category: 'drink', label: 'Bebidas', count: 2 },
    ])
  })

  it('returns no topics for no entries', () => {
    expect(guideTopics([])).toEqual([])
  })
})

describe('isGuideCategory', () => {
  it('accepts every known category', () => {
    for (const { category } of GUIDE_SECTIONS) expect(isGuideCategory(category)).toBe(true)
  })

  it('rejects unknown ids, other casing, prototype keys, empty and undefined', () => {
    expect(isGuideCategory('places')).toBe(false)
    expect(isGuideCategory('Food')).toBe(false)
    expect(isGuideCategory('constructor')).toBe(false)
    expect(isGuideCategory('')).toBe(false)
    expect(isGuideCategory(undefined)).toBe(false)
  })
})

describe('guideTopicEntries', () => {
  it('returns only the entries of the topic, in authored order', () => {
    const entries = [entry('lomo', 'food'), entry('pisco', 'drink'), entry('ceviche', 'food')]
    expect(keys(guideTopicEntries(entries, 'food'))).toEqual(['lomo', 'ceviche'])
  })

  it('keeps cities in route order', () => {
    const entries = [
      entry('cusco', 'city', ['2026-10-23']),
      entry('selva', 'city'),
      entry('lima', 'city', ['2026-10-18']),
    ]
    expect(keys(guideTopicEntries(entries, 'city'))).toEqual(['lima', 'cusco', 'selva'])
  })

  it('returns an empty list for a topic without entries', () => {
    expect(guideTopicEntries([entry('lomo', 'food')], 'tip')).toEqual([])
  })
})

describe('formatReadingCount', () => {
  it('uses the singular for one entry', () => {
    expect(formatReadingCount(1)).toBe('1 lectura')
  })

  it('uses the plural otherwise', () => {
    expect(formatReadingCount(14)).toBe('14 lecturas')
    expect(formatReadingCount(0)).toBe('0 lecturas')
  })
})

describe('readFromDay', () => {
  it('reads an ISO date from router state', () => {
    expect(readFromDay({ fromDay: '2026-10-22' })).toBe('2026-10-22')
  })

  it('ignores missing, malformed or non-object state', () => {
    expect(readFromDay(undefined)).toBeUndefined()
    expect(readFromDay(null)).toBeUndefined()
    expect(readFromDay('2026-10-22')).toBeUndefined()
    expect(readFromDay({})).toBeUndefined()
    expect(readFromDay({ fromDay: 22 })).toBeUndefined()
    expect(readFromDay({ fromDay: '22/10/2026' })).toBeUndefined()
  })
})

describe('guideBackTarget', () => {
  const dayDates = ['2026-10-21', '2026-10-22']

  it('goes back to the day the entry was opened from', () => {
    expect(guideBackTarget('food', '2026-10-22', dayDates)).toEqual({
      path: 'itinerary/2026-10-22',
      label: 'Volver al día',
    })
  })

  it('goes back to the topic when there is no day', () => {
    expect(guideBackTarget('food', undefined, dayDates)).toEqual({
      path: 'guide/topic/food',
      label: 'Gastronomía',
    })
  })

  it('goes back to the topic when the day is not part of this trip', () => {
    expect(guideBackTarget('city', '2030-01-01', dayDates)).toEqual({
      path: 'guide/topic/city',
      label: 'Ciudades',
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/trips/domain/guide.test.ts`
Expected: FAIL — `guideTopics` (and the other new names) is not exported / not a function.

- [ ] **Step 3: Implement**

In `src/trips/domain/guide.ts`, add right after `groupGuide`:

```ts
export interface GuideTopic {
  category: GuideCategory
  label: string
  count: number
}

/** Non-empty topics in reading order with their entry count. */
export function guideTopics(entries: GuideEntry[]): GuideTopic[] {
  return groupGuide(entries).map((section) => ({
    category: section.category,
    label: section.label,
    count: section.entries.length,
  }))
}

/** Type guard for the `:category` route param. */
export function isGuideCategory(value: string | undefined): value is GuideCategory {
  return GUIDE_SECTIONS.some((section) => section.category === value)
}

/** Entries of one topic in the same order as `groupGuide`; [] when the topic is empty. */
export function guideTopicEntries(entries: GuideEntry[], category: GuideCategory): GuideEntry[] {
  return groupGuide(entries).find((section) => section.category === category)?.entries ?? []
}

/** '1 lectura' / '14 lecturas'. */
export function formatReadingCount(count: number): string {
  return count === 1 ? '1 lectura' : `${count} lecturas`
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** The day an entry was opened from, carried as router state `{ fromDay }`; anything else → undefined. */
export function readFromDay(state: unknown): string | undefined {
  if (typeof state !== 'object' || state === null || !('fromDay' in state)) return undefined
  const { fromDay } = state
  return typeof fromDay === 'string' && ISO_DATE.test(fromDay) ? fromDay : undefined
}

export interface GuideBackTarget {
  /** Relative to the trip root (`/trips/:tripId/`). */
  path: string
  label: string
}

/** The entry page's single back button: the day it came from if it is a trip day, else its topic. */
export function guideBackTarget(
  category: GuideCategory,
  fromDay: string | undefined,
  dayDates: string[]
): GuideBackTarget {
  if (fromDay !== undefined && dayDates.includes(fromDay)) {
    return { path: `itinerary/${fromDay}`, label: 'Volver al día' }
  }
  return { path: `guide/topic/${category}`, label: guideCategoryLabel(category) }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/trips/domain/guide.test.ts`
Expected: PASS (all `guide.test.ts` suites).

- [ ] **Step 5: Full checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/trips/domain/guide.ts src/trips/domain/guide.test.ts
git commit -m "feat(trips): add guide topic helpers"
```

---

### Task 2: Responsive layout for v2 screens

**Files:**

- Modify: `src/trips/components/TripLayout.tsx`, `src/trips/components/TripNav.tsx`, `src/trips/components/TripErrorBoundary.tsx`, `src/trips/pages/TripSwitcher.tsx`, `src/trips/pages/HelpPage.tsx`

**Interfaces:** none (markup/classes only).

No unit tests: the project has no component tests; this is class-only. Verified by build/lint and the owner's manual pass.

- [ ] **Step 1: Widen the shell**

`src/trips/components/TripLayout.tsx`:

```tsx
        <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-3 px-5 md:max-w-3xl">
```

```tsx
      <main
        id="main-content"
        className="mx-auto max-w-md px-5 pb-28 pt-5 md:max-w-3xl"
        tabIndex={-1}
      >
```

`src/trips/components/TripNav.tsx`:

```tsx
      <ul className="mx-auto flex max-w-md px-2 md:max-w-3xl">
```

`src/trips/components/TripErrorBoundary.tsx`:

```tsx
        <main className="mx-auto max-w-md px-5 py-8 md:max-w-3xl">
```

- [ ] **Step 2: Trip switcher — wide container, 2-column cards on tablet**

`src/trips/pages/TripSwitcher.tsx`: change `<main>` to

```tsx
      <main className="mx-auto flex max-w-md flex-col gap-6 px-5 pb-10 pt-8 md:max-w-3xl">
```

and wrap each section's cards (both "Próximos y en curso" and "Historial"):

```tsx
<div className="flex flex-col gap-3 md:grid md:grid-cols-2">
  {active.map((trip) => (
    <TripCard key={trip.id} trip={trip} today={today} />
  ))}
</div>
```

```tsx
<div className="flex flex-col gap-3 md:grid md:grid-cols-2">
  {past.map((trip) => (
    <TripCard key={trip.id} trip={trip} today={today} />
  ))}
</div>
```

- [ ] **Step 3: Help — 2-column help cards on tablet**

`src/trips/pages/HelpPage.tsx`: replace

```tsx
{
  helpInfo?.cards.map((card) => <HelpCard key={`${card.title}-${card.phone}`} card={card} />)
}
```

with

```tsx
{
  helpInfo && helpInfo.cards.length > 0 && (
    <div className="flex flex-col gap-[18px] md:grid md:grid-cols-2 md:gap-3">
      {helpInfo.cards.map((card) => (
        <HelpCard key={`${card.title}-${card.phone}`} card={card} />
      ))}
    </div>
  )
}
```

(Grid items stretch by default, so cards in a row align without extra classes.)

- [ ] **Step 4: Checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all green. Run `npx prettier --write` on the touched files first if `format:check` fails.

- [ ] **Step 5: Commit**

```bash
git add src/trips/components/TripLayout.tsx src/trips/components/TripNav.tsx src/trips/components/TripErrorBoundary.tsx src/trips/pages/TripSwitcher.tsx src/trips/pages/HelpPage.tsx
git commit -m "feat(trips): widen v2 screens on tablets"
```

---

### Task 3: Topic colours and the guide hub

**Files:**

- Modify: `src/index.css` (inside `.trip-app` and `.dark .trip-app`), `tailwind.config.js` (`colors.trip`), `src/trips/pages/GuidePage.tsx`
- Create: `src/trips/components/guideTopicStyle.ts`, `src/trips/components/GuideTopicIcon.tsx`, `src/trips/components/GuideTopicCard.tsx`

**Interfaces:**

- Consumes (Task 1): `GuideTopic`, `guideTopics`, `formatReadingCount`.
- Produces:
  - `GUIDE_TOPIC_STYLE: Record<GuideCategory, GuideTopicStyle>` with `GuideTopicStyle { icon: LucideIcon; stripe: string; edge: string; ink: string; soft: string }` (literal Tailwind classes: `stripe` = top border colour, `edge` = left border colour, `ink` = text colour, `soft` = background)
  - `<GuideTopicIcon category={GuideCategory} />` — 56 px circle, soft background, 28 px icon in the strong tone
  - Tailwind colours `trip-topic-<category>` and `trip-topic-<category>-soft`

- [ ] **Step 1: Colour variables**

`src/index.css`, append inside the `.trip-app { … }` block (after `--trip-urgent-soft`):

```css
/* Guide topic tones: strong (stripe, icon) / soft (icon circle). Contrast ≥ 3:1 vs soft and card. */
--trip-topic-history: #9a5b00;
--trip-topic-history-soft: #fbeed6;
--trip-topic-city: #0f766e;
--trip-topic-city-soft: #dcf3f0;
--trip-topic-food: #b3431c;
--trip-topic-food-soft: #fbe6dc;
--trip-topic-drink: #7a3fd0;
--trip-topic-drink-soft: #efe7fc;
--trip-topic-curiosity: #b8326f;
--trip-topic-curiosity-soft: #fbe4ee;
--trip-topic-tip: #3f46b8;
--trip-topic-tip-soft: #e6e7fa;
```

and inside `.dark .trip-app { … }`:

```css
--trip-topic-history: #f0b85a;
--trip-topic-history-soft: #3a2c14;
--trip-topic-city: #5fd3c4;
--trip-topic-city-soft: #143430;
--trip-topic-food: #ff9b73;
--trip-topic-food-soft: #3d2117;
--trip-topic-drink: #c4a3ff;
--trip-topic-drink-soft: #2c2245;
--trip-topic-curiosity: #ff8fbf;
--trip-topic-curiosity-soft: #3d1a2a;
--trip-topic-tip: #a3a9ff;
--trip-topic-tip-soft: #22254a;
```

(Contrast checked while planning: light strong vs soft 4.67–6.18, vs card 5.43–7.56; dark 6.76–7.55 and 7.79–9.43.)

`tailwind.config.js`, inside `colors.trip` after `'urgent-soft'`:

```js
          'topic-history': 'var(--trip-topic-history)',
          'topic-history-soft': 'var(--trip-topic-history-soft)',
          'topic-city': 'var(--trip-topic-city)',
          'topic-city-soft': 'var(--trip-topic-city-soft)',
          'topic-food': 'var(--trip-topic-food)',
          'topic-food-soft': 'var(--trip-topic-food-soft)',
          'topic-drink': 'var(--trip-topic-drink)',
          'topic-drink-soft': 'var(--trip-topic-drink-soft)',
          'topic-curiosity': 'var(--trip-topic-curiosity)',
          'topic-curiosity-soft': 'var(--trip-topic-curiosity-soft)',
          'topic-tip': 'var(--trip-topic-tip)',
          'topic-tip-soft': 'var(--trip-topic-tip-soft)',
```

- [ ] **Step 2: Style map**

Create `src/trips/components/guideTopicStyle.ts`:

```ts
import {
  CupSoda,
  Landmark,
  Lightbulb,
  MapPin,
  ThumbsUp,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { GuideCategory } from '../types'

export interface GuideTopicStyle {
  icon: LucideIcon
  /** Top border colour (hub card stripe). */
  stripe: string
  /** Left border colour (entry card stripe). */
  edge: string
  /** Strong tone as text colour (icons). */
  ink: string
  /** Soft tone as background (icon circle, chip). */
  soft: string
}

// Literal class strings: Tailwind only generates classes it finds verbatim in the source.
export const GUIDE_TOPIC_STYLE: Record<GuideCategory, GuideTopicStyle> = {
  history: {
    icon: Landmark,
    stripe: 'border-t-trip-topic-history',
    edge: 'border-l-trip-topic-history',
    ink: 'text-trip-topic-history',
    soft: 'bg-trip-topic-history-soft',
  },
  city: {
    icon: MapPin,
    stripe: 'border-t-trip-topic-city',
    edge: 'border-l-trip-topic-city',
    ink: 'text-trip-topic-city',
    soft: 'bg-trip-topic-city-soft',
  },
  food: {
    icon: UtensilsCrossed,
    stripe: 'border-t-trip-topic-food',
    edge: 'border-l-trip-topic-food',
    ink: 'text-trip-topic-food',
    soft: 'bg-trip-topic-food-soft',
  },
  drink: {
    icon: CupSoda,
    stripe: 'border-t-trip-topic-drink',
    edge: 'border-l-trip-topic-drink',
    ink: 'text-trip-topic-drink',
    soft: 'bg-trip-topic-drink-soft',
  },
  curiosity: {
    icon: Lightbulb,
    stripe: 'border-t-trip-topic-curiosity',
    edge: 'border-l-trip-topic-curiosity',
    ink: 'text-trip-topic-curiosity',
    soft: 'bg-trip-topic-curiosity-soft',
  },
  tip: {
    icon: ThumbsUp,
    stripe: 'border-t-trip-topic-tip',
    edge: 'border-l-trip-topic-tip',
    ink: 'text-trip-topic-tip',
    soft: 'bg-trip-topic-tip-soft',
  },
}
```

- [ ] **Step 3: Icon circle**

Create `src/trips/components/GuideTopicIcon.tsx`:

```tsx
import type { GuideCategory } from '../types'
import { GUIDE_TOPIC_STYLE } from './guideTopicStyle'

function GuideTopicIcon({ category }: { category: GuideCategory }) {
  const { icon: Icon, ink, soft } = GUIDE_TOPIC_STYLE[category]
  return (
    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${soft}`}>
      <Icon className={`h-7 w-7 ${ink}`} aria-hidden="true" />
    </span>
  )
}

export default GuideTopicIcon
```

- [ ] **Step 4: Hub card**

Create `src/trips/components/GuideTopicCard.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { formatReadingCount, type GuideTopic } from '../domain/guide'
import { GUIDE_TOPIC_STYLE } from './guideTopicStyle'
import GuideTopicIcon from './GuideTopicIcon'

interface GuideTopicCardProps {
  topic: GuideTopic
  tripId: string
}

function GuideTopicCard({ topic, tripId }: GuideTopicCardProps) {
  const { stripe } = GUIDE_TOPIC_STYLE[topic.category]
  return (
    <Link
      to={`/trips/${tripId}/guide/topic/${topic.category}`}
      className={`flex h-full min-h-[150px] flex-col items-start gap-3 rounded-[20px] border border-t-[6px] border-trip-line ${stripe} bg-trip-card p-4 text-trip-ink no-underline active:bg-trip-soft`}
    >
      <GuideTopicIcon category={topic.category} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="hyphens-auto break-words text-lg font-bold leading-tight md:text-xl">
          {topic.label}
        </span>
        <span className="text-base text-trip-ink2">{formatReadingCount(topic.count)}</span>
      </span>
    </Link>
  )
}

export default GuideTopicCard
```

- [ ] **Step 5: Hub page**

Replace `src/trips/pages/GuidePage.tsx` with:

```tsx
import { useMemo } from 'react'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { guideTopics } from '../domain/guide'
import PageHeader from '../components/PageHeader'
import GuideTopicCard from '../components/GuideTopicCard'
import TripStatusMessage from '../components/TripStatusMessage'

function GuidePage() {
  const trip = useTrip()
  const { entries, loading, error } = useGuide(trip.id)
  const topics = useMemo(() => guideTopics(entries), [entries])

  if (error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  if (loading) return <TripStatusMessage message="Cargando la guía…" />

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Guía" subtitle={trip.name} />
      {topics.length === 0 ? (
        <TripStatusMessage message="Este viaje todavía no tiene guía." />
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {topics.map((topic) => (
            <li key={topic.category}>
              <GuideTopicCard topic={topic} tripId={trip.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GuidePage
```

(The topic route is added in Task 4; until then a tapped card falls through to the existing `guide/:entryKey` route and redirects back to the hub — acceptable mid-branch.)

- [ ] **Step 6: Checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all green.
Then confirm Tailwind emitted the topic classes: `grep -o "trip-topic-[a-z-]*" dist/assets/*.css | sort -u`
Expected: includes `bg-trip-topic-food-soft`, `border-t-trip-topic-food`, `text-trip-topic-food` (and the other five topics).

- [ ] **Step 7: Commit**

```bash
git add src/index.css tailwind.config.js src/trips/components/guideTopicStyle.ts src/trips/components/GuideTopicIcon.tsx src/trips/components/GuideTopicCard.tsx src/trips/pages/GuidePage.tsx
git commit -m "feat(trips): show the guide as a hub of coloured topics"
```

---

### Task 4: Topic page and route

**Files:**

- Create: `src/trips/components/BackLink.tsx`, `src/trips/components/GuideTopicList.tsx`, `src/trips/pages/GuideTopicPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**

- Consumes: Task 1 `isGuideCategory`, `guideTopicEntries`, `guideCategoryLabel`; Task 3 `GUIDE_TOPIC_STYLE`, `GuideTopicIcon`.
- Produces: `<BackLink to={string} label={string} />` (used again in Task 5); route `/trips/:tripId/guide/topic/:category`.

- [ ] **Step 1: Back link**

Create `src/trips/components/BackLink.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface BackLinkProps {
  to: string
  label: string
}

/** Button-styled "‹ label" link: easy to see and to hit (≥ 48 px). */
function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-[48px] items-center gap-1 self-start rounded-[14px] border-[1.5px] border-trip-line bg-trip-card pl-2 pr-4 text-base font-semibold text-trip-ink no-underline active:bg-trip-soft"
    >
      <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      {label}
    </Link>
  )
}

export default BackLink
```

- [ ] **Step 2: Topic entry list**

Create `src/trips/components/GuideTopicList.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { GuideCategory, GuideEntry } from '../types'
import { GUIDE_TOPIC_STYLE } from './guideTopicStyle'

interface GuideTopicListProps {
  entries: GuideEntry[]
  category: GuideCategory
  tripId: string
}

function GuideTopicList({ entries, category, tripId }: GuideTopicListProps) {
  const { edge } = GUIDE_TOPIC_STYLE[category]
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.key}>
          <Link
            to={`/trips/${tripId}/guide/${entry.key}`}
            className={`flex h-full items-center gap-3 rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card py-4 pl-4 pr-3 text-trip-ink no-underline active:bg-trip-soft`}
          >
            <span className="flex flex-1 flex-col gap-1">
              <span className="text-lg font-semibold">{entry.title}</span>
              <span className="text-base leading-snug text-trip-ink2">{entry.summary}</span>
            </span>
            <ChevronRight className="h-6 w-6 shrink-0 text-trip-muted" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default GuideTopicList
```

- [ ] **Step 3: Topic page**

Create `src/trips/pages/GuideTopicPage.tsx`:

```tsx
import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { guideCategoryLabel, guideTopicEntries, isGuideCategory } from '../domain/guide'
import BackLink from '../components/BackLink'
import GuideTopicIcon from '../components/GuideTopicIcon'
import GuideTopicList from '../components/GuideTopicList'
import TripStatusMessage from '../components/TripStatusMessage'

function GuideTopicPage() {
  const trip = useTrip()
  const { category } = useParams<{ category: string }>()
  const { entries, loading, error } = useGuide(trip.id)
  const topicEntries = useMemo(
    () => (isGuideCategory(category) ? guideTopicEntries(entries, category) : []),
    [entries, category]
  )
  const guidePath = `/trips/${trip.id}/guide`

  if (error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  if (loading) return <TripStatusMessage message="Cargando la guía…" />
  // Unknown or empty topic (typo, or content changed): back to the hub.
  if (!isGuideCategory(category) || topicEntries.length === 0) {
    return <Navigate to={guidePath} replace />
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <BackLink to={guidePath} label="Guía" />
      <header className="flex items-center gap-3">
        <GuideTopicIcon category={category} />
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">
          {guideCategoryLabel(category)}
        </h1>
      </header>
      <GuideTopicList entries={topicEntries} category={category} tripId={trip.id} />
    </div>
  )
}

export default GuideTopicPage
```

- [ ] **Step 4: Route**

`src/App.tsx`: next to the other lazy trip pages add

```tsx
const GuideTopicPage = lazy(() => import('./trips/pages/GuideTopicPage'))
```

and inside `/trips/:tripId`, between the `guide` and `guide/:entryKey` routes:

```tsx
<Route path="guide/topic/:category" element={<GuideTopicPage />} />
```

- [ ] **Step 5: Checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/trips/components/BackLink.tsx src/trips/components/GuideTopicList.tsx src/trips/pages/GuideTopicPage.tsx src/App.tsx
git commit -m "feat(trips): add the guide topic page"
```

---

### Task 5: Entry page back button, day state and docs

**Files:**

- Modify: `src/trips/components/GuideCardList.tsx`, `src/trips/pages/ItineraryPage.tsx`, `src/trips/pages/GuideEntryPage.tsx`, `CLAUDE.md`

**Interfaces:**

- Consumes: Task 1 `readFromDay`, `guideBackTarget`; Task 3 `GUIDE_TOPIC_STYLE`; Task 4 `BackLink`.
- Produces: `GuideCardList` prop `fromDay?: string` (router state `{ fromDay }`).

- [ ] **Step 1: Carry the day from "Para saber más"**

`src/trips/components/GuideCardList.tsx`:

```tsx
interface GuideCardListProps {
  entries: GuideEntry[]
  tripId: string
  /** Set on an itinerary day: the entry page then offers "Volver al día". */
  fromDay?: string
}

function GuideCardList({ entries, tripId, fromDay }: GuideCardListProps) {
```

and on the `Link`:

```tsx
          <Link
            to={`/trips/${tripId}/guide/${entry.key}`}
            state={fromDay ? { fromDay } : undefined}
            className="flex items-center gap-3 py-4 text-trip-ink no-underline"
          >
```

`src/trips/pages/ItineraryPage.tsx`, `DayGuide`:

```tsx
function DayGuide({
  entries,
  tripId,
  date,
}: {
  entries: GuideEntry[]
  tripId: string
  date: string
}) {
  if (entries.length === 0) return null
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-xl font-bold">Para saber más</h2>
      <GuideCardList entries={entries} tripId={tripId} fromDay={date} />
    </section>
  )
}
```

and its call site:

```tsx
<DayGuide entries={guideForDay(guide.entries, day.date)} tripId={trip.id} date={day.date} />
```

- [ ] **Step 2: Entry page**

In `src/trips/pages/GuideEntryPage.tsx`:

Imports become:

```tsx
import { useMemo } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { useTripDays } from '../hooks/useTripDays'
import {
  guideBackTarget,
  guideCategoryLabel,
  guideDayLinks,
  readFromDay,
  sourceLabel,
} from '../domain/guide'
import BackLink from '../components/BackLink'
import { GUIDE_TOPIC_STYLE } from '../components/guideTopicStyle'
import TripStatusMessage from '../components/TripStatusMessage'
```

Top of the component:

```tsx
const trip = useTrip()
const { entryKey } = useParams<{ entryKey: string }>()
const location = useLocation()
const guide = useGuide(trip.id)
const { days, loading: daysLoading } = useTripDays(trip.id)
const entry = guide.entries.find((candidate) => candidate.key === entryKey)
const dayLinks = useMemo(() => guideDayLinks(entry?.dates, days), [entry, days])
const dayDates = useMemo(() => days.map((day) => day.date), [days])
const tripPath = `/trips/${trip.id}`
const guidePath = `${tripPath}/guide`

if (guide.error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
// Wait for the days too, so the back button does not switch from topic to day after loading.
if (guide.loading || daysLoading) return <TripStatusMessage message="Cargando la guía…" />
// Unknown key (typo, or removed in a later content version): back to the list.
if (!entry) return <Navigate to={guidePath} replace />

const back = guideBackTarget(entry.category, readFromDay(location.state), dayDates)
const topic = GUIDE_TOPIC_STYLE[entry.category]
const TopicIcon = topic.icon
```

Replace the old back `Link` + `<header>` with:

```tsx
      <BackLink to={`${tripPath}/${back.path}`} label={back.label} />

      <header className="flex flex-col gap-2">
        <Link
          to={`${guidePath}/topic/${entry.category}`}
          className={`inline-flex min-h-[40px] items-center gap-2 self-start rounded-full px-3 text-sm font-bold uppercase tracking-wider text-trip-ink no-underline ${topic.soft}`}
        >
          <TopicIcon className={`h-4 w-4 ${topic.ink}`} aria-hidden="true" />
          {guideCategoryLabel(entry.category)}
        </Link>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">{entry.title}</h1>
      </header>
```

and the body wrapper:

```tsx
      <div className="flex max-w-prose flex-col gap-3">
```

"Días del viaje" and "Fuentes" stay as they are; replace the remaining `/trips/${trip.id}/itinerary/` prefix there with `${tripPath}/itinerary/`. `ChevronLeft` is no longer imported (it lives in `BackLink`).

- [ ] **Step 3: Docs**

`CLAUDE.md`, "Multi-trip" → **Routes**: change
`/trips/:tripId/{today,itinerary[/:date],guide[/:entryKey],help}`
to
`/trips/:tripId/{today,itinerary[/:date],guide[/topic/:category|/:entryKey],help}`
and append to that bullet: `The guide opens as a hub of topics; an entry opened from a day goes back to that day.`

- [ ] **Step 4: Checks**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/trips/components/GuideCardList.tsx src/trips/pages/ItineraryPage.tsx src/trips/pages/GuideEntryPage.tsx CLAUDE.md
git commit -m "feat(trips): send guide entries back to their day or topic"
```

---

## Owner manual pass (after Task 5)

`npm run dev` → `http://localhost:5173/travel-planner-pwa/trips/peru-2026/guide`, in device emulation at 360 px, 390 px, 768 px portrait, 1024 px landscape, light and dark:

- Hub: 2 columns on phone, 3 on tablet; six colours and icons; "Curiosidades"/"Gastronomía" fit; counts read "N lecturas".
- Topic → entry → "‹ Gastronomía" back to the topic; topic chip opens the topic.
- Itinerary day → "Para saber más" → entry → "‹ Volver al día"; reload the entry → back goes to the topic.
- `/guide/topic/places` → hub. `/guide/unknown-key` → hub.
- Ayuda and "Mis viajes" cards in 2 columns on tablet; Hoy / Itinerario just wider; bottom nav unchanged.
- Offline reload still works.
