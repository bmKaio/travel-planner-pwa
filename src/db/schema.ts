import type {
  DocumentItem,
  ItineraryItem,
  Place,
  DailyPlan,
  Recommendation,
  CountryInfo,
  PackingItem,
  PreTravelSection,
  Traveler,
} from '../types'

export interface DatabaseSchema {
  documents: DocumentItem
  itineraryItems: ItineraryItem
  places: Place
  dailyPlans: DailyPlan
  recommendations: Recommendation
  countryInfo: CountryInfo
  packingItems: PackingItem
  preTravelSections: PreTravelSection
  travelers: Traveler
}

export const DB_NAME = 'TravelPlannerDB'
export const DB_VERSION = 1

export const TABLE_SCHEMAS = {
  documents: 'id, type, title, createdAt, updatedAt',
  itineraryItems: 'id, date, type, title, *tags',
  places: 'id, name, category',
  dailyPlans: 'date, items, places, recommendations, tips, culturalNotes',
  recommendations: 'id, type, title, priority, *tags',
  countryInfo: 'id, country',
  packingItems: 'id, category, name, checked, essential',
  preTravelSections: 'id, category, title',
  travelers: 'id, name, passportNumber',
} as const

export type TableName = keyof DatabaseSchema
