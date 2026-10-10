// Domain types for the v2 trip engine. Legacy Vietnam types live in src/types.

export type TripEngine = 'legacy' | 'v2'

export interface TripMeta {
  id: string
  name: string
  /** ISO date (YYYY-MM-DD), inclusive. */
  startDate: string
  /** ISO date (YYYY-MM-DD), inclusive. */
  endDate: string
  countries: string[]
  engine: TripEngine
  /** Home route of a legacy trip, e.g. '/trips/vietnam-2026'. */
  legacyHomePath?: string
}

export type TripStatus = 'upcoming' | 'current' | 'past'

export interface PlanItem {
  /** Local time HH:mm. Items of a day are sorted by time. */
  t: string
  title: string
  place: string
  /** Google Maps query. */
  q: string
}

export interface EatItem {
  when: string
  name: string
  kind: string
  tip: string
  q: string
}

export interface SeeItem {
  name: string
  desc: string
  dur: string
  q: string
}

export type LegMode = 'car' | 'cable' | 'walk' | 'plane' | 'bus' | 'train' | 'boat'

export type TravelMode = 'driving' | 'walking' | 'transit' | 'bicycling'

export interface Leg {
  mode: LegMode
  title: string
  meta: string
  q?: string
  from?: string
  to?: string
  travel?: TravelMode
}

export interface Stay {
  name: string
  meta: string
  q: string
  phone?: string
}

export interface TripDay {
  tripId: string
  date: string
  title: string
  cities: string[]
  stay: Stay | null
  legs: Leg[]
  plan: PlanItem[]
  eat: EatItem[]
  see: SeeItem[]
}

export type ChecklistGroupId = 'shared' | 'private'

export interface ChecklistItem {
  /** `${tripId}:${key}` */
  id: string
  tripId: string
  group: ChecklistGroupId
  label: string
  done: boolean
  order: number
}

export interface TripNote {
  tripId: string
  text: string
  updatedAt: Date
}

export interface EmergencyInfo {
  label: string
  number: string
  description: string
}

export interface HelpCardInfo {
  title: string
  sub: string
  cta: string
  phone: string
  mapQuery?: string
}

export interface Contact {
  name: string
  role: string
  phone?: string
}

export interface DocInfo {
  name: string
  where: string
  who: string
}

export interface HelpInfo {
  tripId: string
  emergency: EmergencyInfo | null
  cards: HelpCardInfo[]
  contacts: Contact[]
  docs: DocInfo[]
}

export interface ContentState {
  tripId: string
  seedVersion: number
}

export type ContentDay = Omit<TripDay, 'tripId'>

export interface ContentChecklistItem {
  /** Unique within the trip; stored id is `${tripId}:${key}`. */
  key: string
  group: ChecklistGroupId
  label: string
  order: number
}

export interface TripContent {
  tripId: string
  /** Bump on every content change so devices resync. */
  seedVersion: number
  emergency: EmergencyInfo
  days: ContentDay[]
  checklist: ContentChecklistItem[]
}
