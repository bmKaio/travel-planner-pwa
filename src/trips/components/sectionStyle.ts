import {
  BedDouble,
  Building2,
  CalendarClock,
  Camera,
  HeartPulse,
  ListChecks,
  Lock,
  NotebookPen,
  Route,
  Siren,
  UtensilsCrossed,
} from 'lucide-react'
import { GUIDE_TOPIC_STYLE, type GuideTopicStyle } from './guideTopicStyle'

export type SectionKey =
  | 'plan'
  | 'eat'
  | 'see'
  | 'leg'
  | 'stay'
  | 'emergency'
  | 'consular'
  | 'health'
  | 'private'
  | 'checklist'
  | 'notes'

/** Same shape as a guide topic: icon, left edge, top stripe, strong text colour, soft background. */
export type SectionStyle = GuideTopicStyle

// Literal class strings: Tailwind only generates classes it finds verbatim in the source.
// The section -> token table is spec §2; src/trips/components/sectionStyle.test.ts pins it.
export const SECTION_STYLE: Record<SectionKey, SectionStyle> = {
  plan: {
    icon: CalendarClock,
    edge: 'border-l-trip-topic-city',
    stripe: 'border-t-trip-topic-city',
    ink: 'text-trip-topic-city',
    soft: 'bg-trip-topic-city-soft',
  },
  eat: {
    icon: UtensilsCrossed,
    edge: 'border-l-trip-topic-food',
    stripe: 'border-t-trip-topic-food',
    ink: 'text-trip-topic-food',
    soft: 'bg-trip-topic-food-soft',
  },
  see: {
    icon: Camera,
    edge: 'border-l-trip-topic-history',
    stripe: 'border-t-trip-topic-history',
    ink: 'text-trip-topic-history',
    soft: 'bg-trip-topic-history-soft',
  },
  leg: {
    icon: Route,
    edge: 'border-l-trip-topic-tip',
    stripe: 'border-t-trip-topic-tip',
    ink: 'text-trip-topic-tip',
    soft: 'bg-trip-topic-tip-soft',
  },
  stay: {
    icon: BedDouble,
    edge: 'border-l-trip-topic-drink',
    stripe: 'border-t-trip-topic-drink',
    ink: 'text-trip-topic-drink',
    soft: 'bg-trip-topic-drink-soft',
  },
  // Listed by the spec; EmergencyCard keeps its own red classes ("unchanged look").
  emergency: {
    icon: Siren,
    edge: 'border-l-trip-urgent',
    stripe: 'border-t-trip-urgent',
    ink: 'text-trip-urgent',
    soft: 'bg-trip-urgent-soft',
  },
  consular: {
    icon: Building2,
    edge: 'border-l-trip-topic-tip',
    stripe: 'border-t-trip-topic-tip',
    ink: 'text-trip-topic-tip',
    soft: 'bg-trip-topic-tip-soft',
  },
  health: {
    icon: HeartPulse,
    edge: 'border-l-trip-topic-food',
    stripe: 'border-t-trip-topic-food',
    ink: 'text-trip-topic-food',
    soft: 'bg-trip-topic-food-soft',
  },
  private: {
    icon: Lock,
    edge: 'border-l-trip-topic-drink',
    stripe: 'border-t-trip-topic-drink',
    ink: 'text-trip-topic-drink',
    soft: 'bg-trip-topic-drink-soft',
  },
  checklist: {
    icon: ListChecks,
    edge: 'border-l-trip-done',
    stripe: 'border-t-trip-done',
    ink: 'text-trip-done',
    soft: 'bg-trip-done-soft',
  },
  notes: {
    icon: NotebookPen,
    edge: 'border-l-trip-topic-history',
    stripe: 'border-t-trip-topic-history',
    ink: 'text-trip-topic-history',
    soft: 'bg-trip-topic-history-soft',
  },
}

export type NavKey = 'today' | 'itinerary' | 'guide' | 'help'

export interface NavStyle {
  /** Background of the 3px top bar of the active item (applied on its `before:` pseudo-element). */
  bar: string
  /** Icon colour of the active item. */
  ink: string
}

export const NAV_STYLE: Record<NavKey, NavStyle> = {
  today: { bar: 'before:bg-trip-action', ink: 'text-trip-action' },
  itinerary: { bar: 'before:bg-trip-topic-city', ink: 'text-trip-topic-city' },
  guide: { bar: 'before:bg-trip-topic-curiosity', ink: 'text-trip-topic-curiosity' },
  help: { bar: 'before:bg-trip-urgent', ink: 'text-trip-urgent' },
}

// Trip switcher stripes reuse the guide topic stripes, in their order (no new literal classes).
const TRIP_STRIPES = Object.values(GUIDE_TOPIC_STYLE).map((style) => style.stripe)

/** Top-border class of the trip at registry position `index`; cycles, and tolerates -1. */
export function tripStripe(index: number): string {
  const count = TRIP_STRIPES.length
  return TRIP_STRIPES[((index % count) + count) % count]
}
