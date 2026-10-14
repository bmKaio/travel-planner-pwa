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
