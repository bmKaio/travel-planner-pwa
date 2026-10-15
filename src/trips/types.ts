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
  /** Google Maps query. Omit when the item is not a place to go (free time, included transfers). */
  q?: string
  /** Free time: the plan shows the day's alternative sights as ideas. */
  free?: boolean
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
  /** Not in the day's plan: an idea for free time. */
  alternative?: boolean
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

export interface DayCover {
  /** Place shown on the card, e.g. "Valle del Colca". */
  place: string
  /** Bundled image URL (Vite asset import from the content file). */
  image: string
  /** Describes the photo for screen readers. */
  alt: string
  /** "Autor · CC BY-SA 4.0" */
  credit: string
  /** Wikimedia Commons file page (https). */
  creditUrl: string
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
  cover?: DayCover
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
  /** Public embassy and consulate cards from the trip content. Absent on rows synced before it existed. */
  consular?: HelpCardInfo[]
  cards: HelpCardInfo[]
  contacts: Contact[]
  docs: DocInfo[]
}

export type GuideCategory = 'history' | 'city' | 'food' | 'drink' | 'curiosity' | 'tip'

export interface ContentGuideEntry {
  /** Unique within the trip; URL segment of the entry page. Lowercase kebab-case. */
  key: string
  category: GuideCategory
  title: string
  /** One or two lines, shown on cards. */
  summary: string
  /** Short paragraphs, rendered in order. */
  body: string[]
  /** Trip days this entry belongs to (ISO dates present in `days`). */
  dates?: string[]
  /** Source URLs, shown small at the end of the entry page. At least one. */
  sources: string[]
  /** Also listed on the Help screen ("Ayuda"), e.g. health rules worth having at hand. */
  inHelp?: boolean
}

export interface GuideEntry extends ContentGuideEntry {
  tripId: string
  /** Index in the authored `guide` array; Dexie returns rows by primary key, not authored order. */
  order: number
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
  /** Embassy and consulates of the travellers' country, shown in "Ayuda". Public data only. */
  consular?: HelpCardInfo[]
  days: ContentDay[]
  checklist: ContentChecklistItem[]
  /** Reading guide; optional because not every trip has one. */
  guide?: ContentGuideEntry[]
}
