// Shared type definitions for Travel Planner PWA

export type CountryCode = 'vietnam' | 'cambodia'

export type DocumentType = 'passport' | 'insurance' | 'flight' | 'accommodation' | 'other'

export type ItineraryItemType = 'flight' | 'transport' | 'visit' | 'accommodation' | 'activity'

export type PlaceCategory =
  | 'temple'
  | 'nature'
  | 'city'
  | 'restaurant'
  | 'market'
  | 'beach'
  | 'museum'
  | 'hotel'
  | 'other'

export type RecommendationType = 'restaurant' | 'activity' | 'place'

export type RecommendationPriority = 'must-see' | 'if-time' | 'optional'

export type PackingCategory =
  | 'documents'
  | 'health'
  | 'clothing'
  | 'electronics'
  | 'toiletries'
  | 'misc'

export type PreTravelCategory =
  | 'checklist'
  | 'vaccines'
  | 'money'
  | 'connectivity'
  | 'safety'
  | 'tips'

export interface Location {
  name: string
  lat?: number
  lng?: number
  address?: string
  googleMapsUrl?: string
}

export interface DocumentItem {
  id: string
  type: DocumentType
  title: string
  data: Record<string, unknown>
  fileData?: string
  favorite?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ItineraryItem {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime?: string
  type: ItineraryItemType
  title: string
  description?: string
  location?: Location
  notes?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Place {
  id: string
  name: string
  description: string
  category: PlaceCategory
  location: Location
  openingHours?: string
  tips?: string[]
  funFacts?: string[]
  culturalContext?: string
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface DailyPlan {
  date: string // YYYY-MM-DD
  items: ItineraryItem[]
  places: Place[]
  recommendations: Recommendation[]
  tips: string[]
  culturalNotes: string[]
  heroImage?: string
  summary?: string
}

export interface Recommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  location?: Location
  tags: string[]
  priority: RecommendationPriority
  whyVisit?: string
  createdAt: Date
  updatedAt: Date
}

export interface CountryInfoSections {
  history: string
  culture: string
  food: string
  traditions: string
  customs: string
  language: string
  currency: string
  tips: string[]
}

export interface CountryInfo {
  id: string
  country: CountryCode
  sections: CountryInfoSections
}

export interface PackingItem {
  id: string
  category: PackingCategory
  name: string
  checked: boolean
  notes?: string
  essential: boolean
}

export interface PreTravelSectionItem {
  id: string
  text: string
  checked?: boolean
  important: boolean
  details?: string
}

export interface PreTravelSection {
  id: string
  category: PreTravelCategory
  title: string
  items: PreTravelSectionItem[]
}

export interface Traveler {
  id: string
  name: string
  passportNumber: string
}

export interface TripMeta {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  travelers: number
  route: string[]
}

export const TRIP_META: TripMeta = {
  startDate: '2026-07-04',
  endDate: '2026-07-20',
  travelers: 5,
  route: ['Hanoi', 'Pu Luong', 'Ninh Binh', 'Cat Ba', 'Hue', 'Hoi An', 'Siem Reap', 'Phnom Penh'],
}

export type DatabaseTableName =
  | 'documents'
  | 'itineraryItems'
  | 'places'
  | 'dailyPlans'
  | 'recommendations'
  | 'countryInfo'
  | 'packingItems'
  | 'preTravelSections'
  | 'travelers'
