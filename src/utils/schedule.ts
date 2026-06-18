import { Plane, Bus, Car, Train, MapPin, BedDouble, Compass, type LucideIcon } from 'lucide-react'
import { format, parseISO, isBefore, isAfter, isEqual, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ItineraryItem, ItineraryItemType, Location } from '../types'

export interface EventTypeConfig {
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  timelineClass: string
}

export const EVENT_TYPE_CONFIG: Record<ItineraryItemType, EventTypeConfig> = {
  flight: {
    label: 'Vuelo',
    icon: Plane,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    timelineClass: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
  },
  transport: {
    label: 'Transporte',
    icon: Car,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    timelineClass: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
  },
  visit: {
    label: 'Visita',
    icon: MapPin,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    timelineClass: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  },
  accommodation: {
    label: 'Alojamiento',
    icon: BedDouble,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    timelineClass: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
  },
  activity: {
    label: 'Actividad',
    icon: Compass,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-900/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
    timelineClass: 'border-rose-400 bg-rose-50 dark:bg-rose-900/20',
  },
}

export const EVENT_TYPE_ORDER: ItineraryItemType[] = [
  'flight',
  'transport',
  'visit',
  'activity',
  'accommodation',
]

export function getEventTypeConfig(type: ItineraryItemType): EventTypeConfig {
  return EVENT_TYPE_CONFIG[type]
}

export function getTransportIcon(title: string): LucideIcon {
  const lower = title.toLowerCase()
  if (lower.includes('tren') || lower.includes('train')) return Train
  if (lower.includes('bus') || lower.includes('autobús')) return Bus
  if (lower.includes('barco') || lower.includes('ferry') || lower.includes('kayak')) return Bus
  return Car
}

export function getEventIcon(item: ItineraryItem): LucideIcon {
  if (item.type === 'transport') {
    return getTransportIcon(item.title)
  }
  return EVENT_TYPE_CONFIG[item.type].icon
}

export function formatEventTimeRange(startTime: string, endTime?: string): string {
  if (!endTime) return startTime
  return `${startTime} - ${endTime}`
}

export function formatEventDurationMinutes(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  return endHours * 60 + endMinutes - (startHours * 60 + startMinutes)
}

export function sortItemsByStartTime(items: ItineraryItem[]): ItineraryItem[] {
  return [...items].sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function getGoogleMapsUrl(location?: Location): string | null {
  if (!location) return null
  if (location.googleMapsUrl) return location.googleMapsUrl
  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    return `https://www.google.com/maps?q=${location.lat},${location.lng}&z=15`
  }
  return null
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export type DayGroupStatus = 'past' | 'current' | 'future'

export interface DayGroup {
  date: string
  items: ItineraryItem[]
  dayNumber: number
  totalDays: number
  status: DayGroupStatus
}

export interface GroupEventsByDateOptions {
  startDate: string
  totalDays: number
  today?: Date
}

export function groupEventsByDate(
  items: ItineraryItem[],
  options: GroupEventsByDateOptions
): DayGroup[] {
  const { startDate, totalDays, today = new Date() } = options
  const todayStr = toDateInputValue(today)
  const start = parseISO(startDate)

  const grouped = new Map<string, ItineraryItem[]>()
  for (const item of items) {
    const list = grouped.get(item.date) ?? []
    list.push(item)
    grouped.set(item.date, list)
  }

  const sortedDates = Array.from(grouped.keys()).sort()

  return sortedDates.map((date) => {
    const dayItems = sortItemsByStartTime(grouped.get(date) ?? [])
    const dayDate = parseISO(date)
    const dayNumber = Math.max(1, differenceInCalendarDays(dayDate, start) + 1)

    let status: DayGroupStatus = 'future'
    if (isBefore(dayDate, parseISO(todayStr))) {
      status = 'past'
    } else if (isEqual(dayDate, parseISO(todayStr))) {
      status = 'current'
    } else if (isAfter(dayDate, parseISO(todayStr))) {
      status = 'future'
    }

    return {
      date,
      items: dayItems,
      dayNumber,
      totalDays,
      status,
    }
  })
}

export function formatDayGroupDate(date: string): string {
  return format(parseISO(date), "EEEE, d 'de' MMMM", { locale: es })
}

export function generateDaySummary(items: ItineraryItem[]): string {
  if (items.length === 0) return 'Sin eventos programados'

  const nonAccommodation = items.filter((item) => item.type !== 'accommodation')
  const highlights = nonAccommodation.length > 0 ? nonAccommodation : items

  if (highlights.length === 1) {
    return highlights[0].title
  }

  const firstTwo = highlights.slice(0, 2).map((item) => item.title)
  const remaining = highlights.length - 2

  if (remaining > 0) {
    return `${firstTwo.join(' · ')} y ${remaining} más`
  }

  return firstTwo.join(' · ')
}
