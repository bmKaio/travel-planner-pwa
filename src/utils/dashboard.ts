import { format, formatDistanceToNow, isAfter, isBefore, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DocumentItem, ItineraryItem, Place, Recommendation } from '../types'

export type TripPhase = 'before' | 'during' | 'after'

export interface TripStatus {
  phase: TripPhase
  daysUntilStart: number
  daysUntilEnd: number
  currentDay: number
  totalDays: number
  progress: number
}

export function getTripStatus(startDate: string, endDate: string, now = new Date()): TripStatus {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const totalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  )

  if (isBefore(now, start) && !isSameDay(now, start)) {
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      phase: 'before',
      daysUntilStart,
      daysUntilEnd: Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      currentDay: 0,
      totalDays,
      progress: 0,
    }
  }

  if (isAfter(now, end) && !isSameDay(now, end)) {
    return {
      phase: 'after',
      daysUntilStart: 0,
      daysUntilEnd: 0,
      currentDay: totalDays,
      totalDays,
      progress: 100,
    }
  }

  const elapsedMs = now.getTime() - start.getTime()
  const currentDay = Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) + 1
  const progress = Math.min(100, Math.max(0, ((currentDay - 1) / (totalDays - 1)) * 100))

  return {
    phase: 'during',
    daysUntilStart: 0,
    daysUntilEnd: Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    currentDay,
    totalDays,
    progress,
  }
}

export function formatEventCountdown(date: string, time: string, now = new Date()): string {
  const eventDate = parseISO(date)
  const [hours, minutes] = time.split(':').map(Number)
  eventDate.setHours(hours, minutes, 0, 0)

  if (eventDate.getTime() <= now.getTime()) {
    return 'Ahora'
  }

  const distance = formatDistanceToNow(eventDate, { locale: es, addSuffix: true })
  return distance
}

export function formatTodayDate(now = new Date()): string {
  return format(now, 'yyyy-MM-dd')
}

export function formatDisplayDate(date: string): string {
  return format(parseISO(date), "EEEE, d 'de' MMMM", { locale: es })
}

export type ActivityItem =
  | { type: 'document'; id: string; title: string; date: Date; link: string }
  | { type: 'event'; id: string; title: string; date: Date; link: string }
  | { type: 'place'; id: string; title: string; date: Date; link: string }
  | { type: 'recommendation'; id: string; title: string; date: Date; link: string }

export function buildRecentActivity(
  documents: DocumentItem[],
  events: ItineraryItem[],
  places: Place[],
  recommendations: Recommendation[],
  limit = 5
): ActivityItem[] {
  const docActivities: ActivityItem[] = documents.map((doc) => ({
    type: 'document',
    id: doc.id,
    title: doc.title,
    date: doc.updatedAt ?? doc.createdAt,
    link: `/documents/${doc.id}`,
  }))

  const eventActivities: ActivityItem[] = events.map((event) => ({
    type: 'event',
    id: event.id,
    title: event.title,
    date: event.updatedAt,
    link: `/schedule/${event.date}`,
  }))

  const placeActivities: ActivityItem[] = places.map((place) => ({
    type: 'place',
    id: place.id,
    title: place.name,
    date: place.updatedAt,
    link: `/places/${place.id}`,
  }))

  const recommendationActivities: ActivityItem[] = recommendations.map((rec) => ({
    type: 'recommendation',
    id: rec.id,
    title: rec.title,
    date: rec.updatedAt,
    link: `/recommendations/${rec.id}`,
  }))

  return [...docActivities, ...eventActivities, ...placeActivities, ...recommendationActivities]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
}

export function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { locale: es, addSuffix: true })
}

export function formatCountdownDays(days: number): string {
  if (days === 1) return 'día'
  return 'días'
}

export function findNextEvent(events: ItineraryItem[], now = new Date()): ItineraryItem | null {
  const currentDateStr = format(now, 'yyyy-MM-dd')
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const upcoming = events
    .filter((event) => {
      if (event.date > currentDateStr) return true
      if (event.date === currentDateStr) {
        const [hours, minutes] = event.startTime.split(':').map(Number)
        const eventMinutes = hours * 60 + minutes
        return eventMinutes > currentMinutes
      }
      return false
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  return upcoming[0] ?? null
}

export function getCurrentDayRoute(items: ItineraryItem[], date: string): string | undefined {
  const dayItems = items.filter((item) => item.date === date)
  const withLocation = dayItems.find((item) => item.location?.name)
  return withLocation?.location?.name
}
