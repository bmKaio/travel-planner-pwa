import type { GuideCategory, GuideEntry, TripDay } from '../types'
import { formatDayLabel } from './dates'

export const GUIDE_SECTIONS: { category: GuideCategory; label: string }[] = [
  { category: 'history', label: 'Historia' },
  { category: 'city', label: 'Ciudades' },
  { category: 'food', label: 'Gastronomía' },
  { category: 'drink', label: 'Bebidas' },
  { category: 'curiosity', label: 'Curiosidades' },
  { category: 'tip', label: 'Consejos' },
]

export function guideCategoryLabel(category: GuideCategory): string {
  return GUIDE_SECTIONS.find((section) => section.category === category)?.label ?? ''
}

export interface GuideSection {
  category: GuideCategory
  label: string
  entries: GuideEntry[]
}

function earliestDate(entry: GuideEntry): string | undefined {
  return entry.dates && entry.dates.length > 0 ? [...entry.dates].sort()[0] : undefined
}

/** Route order: earliest date first; undated entries last. Array sort is stable. */
function byRouteOrder(entries: GuideEntry[]): GuideEntry[] {
  return [...entries].sort((a, b) => {
    const da = earliestDate(a)
    const db = earliestDate(b)
    if (da === db) return 0
    if (da === undefined) return 1
    if (db === undefined) return -1
    return da < db ? -1 : 1
  })
}

/** Sections in reading order, empty ones dropped. `entries` must be in authored order. */
export function groupGuide(entries: GuideEntry[]): GuideSection[] {
  return GUIDE_SECTIONS.map(({ category, label }) => {
    const inSection = entries.filter((entry) => entry.category === category)
    return { category, label, entries: category === 'city' ? byRouteOrder(inSection) : inSection }
  }).filter((section) => section.entries.length > 0)
}

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

/** Entries linked to a trip day through their `dates`, in section order. */
export function guideForDay(entries: GuideEntry[], date: string): GuideEntry[] {
  return groupGuide(entries.filter((entry) => entry.dates?.includes(date))).flatMap(
    (section) => section.entries
  )
}

/** Entries also listed on the Help screen, in authored order. */
export function guideForHelp(entries: GuideEntry[]): GuideEntry[] {
  return entries.filter((entry) => entry.inHelp)
}

export interface GuideDayLink {
  date: string
  label: string
}

/** 'jue 22 oct · Lago Titicaca: Uros y Taquile' for each linked date that is a trip day. */
export function guideDayLinks(
  dates: string[] | undefined,
  days: Pick<TripDay, 'date' | 'title'>[]
): GuideDayLink[] {
  const wanted = new Set(dates ?? [])
  return days
    .filter((day) => wanted.has(day.date))
    .map((day) => ({ date: day.date, label: `${formatDayLabel(day.date)} · ${day.title}` }))
}

/** Short, readable label for a source link: its host without `www.`. */
export function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
