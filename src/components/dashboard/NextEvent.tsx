import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, Calendar, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ItineraryItem } from '../../types'
import { findNextEvent, formatDisplayDate, formatEventCountdown } from '../../utils/dashboard'
import { getEventIcon } from '../../utils/schedule'

interface NextEventProps {
  events: ItineraryItem[]
}

function NextEvent({ events }: NextEventProps) {
  const navigate = useNavigate()
  const nextEvent = findNextEvent(events)

  if (!nextEvent) {
    return (
      <section
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6"
        aria-label="Próximo evento"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Próximo evento</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">No hay eventos programados</p>
      </section>
    )
  }

  const EventIcon = getEventIcon(nextEvent)
  const countdown = formatEventCountdown(nextEvent.date, nextEvent.startTime)

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:p-6"
      aria-label="Próximo evento"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Próximo evento</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            {format(parseISO(nextEvent.date), 'EEE d MMM', { locale: es })}
          </span>
          <span className="rounded-full bg-travel-blue-50 px-2.5 py-1 text-xs font-medium text-travel-blue-700 dark:bg-travel-blue-900/30 dark:text-travel-blue-300">
            {countdown}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/schedule/${nextEvent.date}`)}
        className="mt-3 flex w-full items-center gap-3 rounded-xl bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700"
        aria-label={`Ver ${nextEvent.title} el ${nextEvent.date}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300">
          <EventIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
            {nextEvent.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {nextEvent.startTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDisplayDate(nextEvent.date)}
            </span>
            {nextEvent.location?.name && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {nextEvent.location.name}
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </button>
    </section>
  )
}

export default memo(NextEvent)
