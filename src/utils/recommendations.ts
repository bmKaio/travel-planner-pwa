import { Utensils, Ticket, MapPin, type LucideIcon } from 'lucide-react'
import type { Recommendation, RecommendationPriority, RecommendationType } from '../types'

export interface RecommendationTypeConfig {
  label: string
  icon: LucideIcon
  textClass: string
  bgClass: string
}

export interface RecommendationPriorityConfig {
  label: string
  textClass: string
  bgClass: string
  sortOrder: number
}

export const RECOMMENDATION_TYPE_CONFIG: Record<RecommendationType, RecommendationTypeConfig> = {
  restaurant: {
    label: 'Restaurant',
    icon: Utensils,
    textClass: 'text-orange-700 dark:text-orange-300',
    bgClass: 'bg-orange-100 dark:bg-orange-900/40',
  },
  activity: {
    label: 'Activity',
    icon: Ticket,
    textClass: 'text-travel-teal-700 dark:text-travel-teal-300',
    bgClass: 'bg-travel-teal-100 dark:bg-travel-teal-900/40',
  },
  place: {
    label: 'Place',
    icon: MapPin,
    textClass: 'text-travel-blue-700 dark:text-travel-blue-300',
    bgClass: 'bg-travel-blue-100 dark:bg-travel-blue-900/40',
  },
}

export const RECOMMENDATION_PRIORITY_CONFIG: Record<
  RecommendationPriority,
  RecommendationPriorityConfig
> = {
  'must-see': {
    label: 'Must-see',
    textClass: 'text-rose-700 dark:text-rose-300',
    bgClass: 'bg-rose-100 dark:bg-rose-900/40',
    sortOrder: 1,
  },
  'if-time': {
    label: 'If time',
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-100 dark:bg-amber-900/40',
    sortOrder: 2,
  },
  optional: {
    label: 'Optional',
    textClass: 'text-gray-700 dark:text-gray-300',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    sortOrder: 3,
  },
}

export const RECOMMENDATION_TYPES: RecommendationType[] = ['restaurant', 'activity', 'place']
export const RECOMMENDATION_PRIORITIES: RecommendationPriority[] = [
  'must-see',
  'if-time',
  'optional',
]

export function getRecommendationTypeConfig(type: RecommendationType): RecommendationTypeConfig {
  return RECOMMENDATION_TYPE_CONFIG[type] ?? RECOMMENDATION_TYPE_CONFIG.place
}

export function getRecommendationPriorityConfig(
  priority: RecommendationPriority
): RecommendationPriorityConfig {
  return RECOMMENDATION_PRIORITY_CONFIG[priority] ?? RECOMMENDATION_PRIORITY_CONFIG.optional
}

export function getGoogleMapsUrl(recommendation: Recommendation): string {
  const { location } = recommendation
  if (!location) {
    return `https://www.google.com/maps/search/${encodeURIComponent(recommendation.title)}`
  }

  const { lat, lng, address } = location
  if (lat !== undefined && lng !== undefined) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15`
  }

  if (address) {
    return `https://www.google.com/maps/search/${encodeURIComponent(address)}`
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(location.name)}`
}

export function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export function joinTags(tags?: string[]): string {
  return (tags ?? []).join(', ')
}
