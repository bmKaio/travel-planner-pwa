import { formatDayLabel, weekdayShort } from './dates'

export type ItineraryTab = 'plan' | 'eat' | 'see'

export const ITINERARY_TABS: { id: ItineraryTab; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'eat', label: 'Comer' },
  { id: 'see', label: 'Visitar' },
]

export function parseItineraryTab(value: string | null): ItineraryTab {
  return value === 'eat' || value === 'see' ? value : 'plan'
}

/** DOM ids linking each tab to the panel it controls. */
export const tabId = (tab: ItineraryTab): string => `itinerary-tab-${tab}`
export const tabPanelId = (tab: ItineraryTab): string => `itinerary-panel-${tab}`

export interface DayStripItem {
  date: string
  weekday: string
  dayOfMonth: string
  isToday: boolean
  isSelected: boolean
  ariaLabel: string
}

export function buildDayStrip(
  dates: string[],
  selectedDate: string,
  today: string
): DayStripItem[] {
  return dates.map((date, i) => ({
    date,
    weekday: weekdayShort(date),
    dayOfMonth: String(Number(date.slice(8))),
    isToday: date === today,
    isSelected: date === selectedDate,
    ariaLabel: `Día ${i + 1}, ${formatDayLabel(date)}${date === today ? ', hoy' : ''}`,
  }))
}

/** The requested date if it belongs to the trip; null if it does not (caller redirects). */
export function resolveSelectedDate(
  dates: string[],
  requested: string | undefined,
  fallbackIndex: number
): string | null {
  if (dates.length === 0) return null
  if (requested !== undefined) return dates.includes(requested) ? requested : null
  return dates[Math.min(Math.max(fallbackIndex, 0), dates.length - 1)]
}
