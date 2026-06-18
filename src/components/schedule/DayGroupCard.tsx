import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, BedDouble, ChevronRight } from 'lucide-react'
import type { ItineraryItem } from '../../types'
import {
  type DayGroupStatus,
  formatDayGroupDate,
  generateDaySummary,
  sortItemsByStartTime,
} from '../../utils/schedule'
import { determineDayLocation } from '../../utils/dailyPlan'
import { EventCard } from './EventCard'

export interface DayGroupCardProps {
  date: string
  dayNumber: number
  totalDays: number
  events: ItineraryItem[]
  status: DayGroupStatus
  accommodation?: ItineraryItem
  onEditEvent: (event: ItineraryItem) => void
  onDeleteEvent: (event: ItineraryItem) => void
}

const statusStyles: Record<DayGroupStatus, string> = {
  past: 'opacity-60 grayscale-[0.3]',
  current:
    'ring-2 ring-travel-blue-400 bg-travel-blue-50/30 dark:bg-travel-blue-900/10 dark:ring-travel-blue-500',
  future: '',
}

export function DayGroupCard({
  date,
  dayNumber,
  totalDays,
  events,
  status,
  accommodation,
  onEditEvent,
  onDeleteEvent,
}: DayGroupCardProps) {
  const navigate = useNavigate()

  const sortedEvents = useMemo(() => sortItemsByStartTime(events), [events])

  const location = useMemo(() => determineDayLocation(events), [events])
  const title = useMemo(() => {
    if (location) return location
    const firstNonAccommodation = events.find((item) => item.type !== 'accommodation')
    return firstNonAccommodation?.title ?? events[0]?.title ?? 'Día sin título'
  }, [location, events])

  const summary = useMemo(() => generateDaySummary(events), [events])

  const handleCardClick = () => {
    navigate(`/schedule/${date}`)
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900 ${statusStyles[status]}`}
      aria-label={`Día ${dayNumber} de ${totalDays}, ${formatDayGroupDate(date)}`}
    >
      <button
        type="button"
        onClick={handleCardClick}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50"
        aria-label={`Ver detalle del día ${dayNumber}`}
      >
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300">
          <span className="text-[10px] font-medium uppercase leading-none">Día</span>
          <span className="text-lg font-bold leading-none">{dayNumber}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {formatDayGroupDate(date)}
              </p>
            </div>
            <ChevronRight
              className="mt-1 h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-travel-blue-50 px-2.5 py-1 text-xs font-medium text-travel-blue-700 dark:bg-travel-blue-900/30 dark:text-travel-blue-300">
              Día {dayNumber} de {totalDays}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {location}
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-1 text-sm text-gray-700 dark:text-gray-300">{summary}</p>

          {accommodation && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 dark:bg-orange-900/20">
              <BedDouble
                className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {accommodation.title}
                </p>
                {accommodation.location && (
                  <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                    {accommodation.location.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </button>

      <div className="border-t border-gray-100 bg-gray-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
        <ul className="space-y-2" aria-label={`Eventos del día ${dayNumber}`}>
          {sortedEvents.map((event) => (
            <li key={event.id}>
              <EventCard
                event={event}
                variant="timeline"
                onEdit={() => onEditEvent(event)}
                onDelete={() => onDeleteEvent(event)}
              />
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
