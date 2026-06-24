import {
  Church,
  TreePine,
  Building2,
  Utensils,
  ShoppingBag,
  MapPin,
  Landmark,
  Hotel,
  Coffee,
  type LucideIcon,
} from 'lucide-react'
import type { Place, PlaceCategory } from '../types'

export interface CategoryConfig {
  label: string
  icon: LucideIcon
  textClass: string
  bgClass: string
  markerColor: string
}

export const CATEGORY_CONFIG: Record<PlaceCategory, CategoryConfig> = {
  temple: {
    label: 'Temple',
    icon: Church,
    textClass: 'text-orange-700 dark:text-orange-300',
    bgClass: 'bg-orange-100 dark:bg-orange-900/40',
    markerColor: '#f97316',
  },
  nature: {
    label: 'Nature',
    icon: TreePine,
    textClass: 'text-green-700 dark:text-green-300',
    bgClass: 'bg-green-100 dark:bg-green-900/40',
    markerColor: '#22c55e',
  },
  city: {
    label: 'City',
    icon: Building2,
    textClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-100 dark:bg-blue-900/40',
    markerColor: '#3b82f6',
  },
  restaurant: {
    label: 'Restaurant',
    icon: Utensils,
    textClass: 'text-red-700 dark:text-red-300',
    bgClass: 'bg-red-100 dark:bg-red-900/40',
    markerColor: '#ef4444',
  },
  market: {
    label: 'Market',
    icon: ShoppingBag,
    textClass: 'text-purple-700 dark:text-purple-300',
    bgClass: 'bg-purple-100 dark:bg-purple-900/40',
    markerColor: '#a855f7',
  },
  beach: {
    label: 'Beach',
    icon: MapPin,
    textClass: 'text-cyan-700 dark:text-cyan-300',
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/40',
    markerColor: '#06b6d4',
  },
  museum: {
    label: 'Museum',
    icon: Landmark,
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-100 dark:bg-amber-900/40',
    markerColor: '#d97706',
  },
  hotel: {
    label: 'Hotel',
    icon: Hotel,
    textClass: 'text-indigo-700 dark:text-indigo-300',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/40',
    markerColor: '#6366f1',
  },
  cafe: {
    label: 'Café',
    icon: Coffee,
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-100 dark:bg-amber-900/40',
    markerColor: '#b45309',
  },
  other: {
    label: 'Other',
    icon: MapPin,
    textClass: 'text-gray-700 dark:text-gray-300',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    markerColor: '#6b7280',
  },
}

export const FILTER_CATEGORIES: PlaceCategory[] = [
  'temple',
  'nature',
  'city',
  'restaurant',
  'market',
  'beach',
  'museum',
  'hotel',
  'cafe',
  'other',
]

export function getCategoryConfig(category: PlaceCategory): CategoryConfig {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

export function formatCoordinates(lat?: number, lng?: number): string {
  if (lat === undefined || lng === undefined) return 'No coordinates'
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

export function getGoogleMapsUrl(place: Place): string {
  const { lat, lng, address } = place.location

  if (lat !== undefined && lng !== undefined) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15`
  }

  if (address) {
    return `https://www.google.com/maps/search/${encodeURIComponent(address)}`
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(place.name)}`
}

export function parseCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function joinCommaSeparated(items?: string[]): string {
  return (items ?? []).join(', ')
}
