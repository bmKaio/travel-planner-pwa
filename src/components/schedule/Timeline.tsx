import { BedDouble } from 'lucide-react'
import type { ItineraryItem } from '../../types'
import {
  EVENT_TYPE_CONFIG,
  formatEventTimeRange,
  formatMinutesToTime,
  getEventIcon,
  getGoogleMapsUrl,
  parseTimeToMinutes,
} from '../../utils/schedule'

interface TimelineProps {
  events: ItineraryItem[]
}

const MINUTES_PER_MARKER = 120

export function Timeline({ events }: TimelineProps) {
  const sorted = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const hasAccommodation = sorted.some((event) => event.type === 'accommodation')

  const timeRange = (() => {
    if (sorted.length === 0) {
      return { start: 6 * 60, end: 23 * 60 }
    }

    const startMinutes = Math.min(...sorted.map((event) => parseTimeToMinutes(event.startTime)))
    const endTimes = sorted
      .filter((event) => event.endTime)
      .map((event) => parseTimeToMinutes(event.endTime!))
    const lastStart = Math.max(...sorted.map((event) => parseTimeToMinutes(event.startTime)))
    const endMinutes = endTimes.length > 0 ? Math.max(...endTimes, lastStart) : lastStart + 60

    const start = Math.max(
      0,
      Math.floor(startMinutes / MINUTES_PER_MARKER) * MINUTES_PER_MARKER - 60
    )
    const end = Math.min(
      24 * 60,
      Math.ceil(endMinutes / MINUTES_PER_MARKER) * MINUTES_PER_MARKER + 60
    )
    return { start, end }
  })()

  const totalMinutes = timeRange.end - timeRange.start
  const markers = Array.from(
    { length: Math.floor(totalMinutes / MINUTES_PER_MARKER) + 1 },
    (_, index) => timeRange.start + index * MINUTES_PER_MARKER
  )

  return (
    <div className="relative min-h-[320px] overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="relative min-w-[280px]">
        <div className="absolute bottom-0 left-8 top-0 w-px bg-gray-200 dark:bg-slate-700" />

        <div className="space-y-0">
          {markers.map((minutes) => (
            <div key={minutes} className="relative h-12">
              <span className="absolute -top-2 right-[calc(100%-2rem)] text-xs text-gray-400 dark:text-gray-500">
                {formatMinutesToTime(minutes)}
              </span>
              <div className="absolute left-8 right-0 top-0 h-px bg-gray-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>

        <div className="absolute left-8 right-0 top-0" style={{ bottom: 0 }}>
          {sorted.map((event, index) => {
            const startMinutes = parseTimeToMinutes(event.startTime)
            const top = ((startMinutes - timeRange.start) / totalMinutes) * 100
            const endMinutes = event.endTime ? parseTimeToMinutes(event.endTime) : startMinutes + 60
            const height = Math.max(3, ((endMinutes - startMinutes) / totalMinutes) * 100)

            return (
              <TimelineEvent
                key={event.id}
                event={event}
                top={top}
                height={height}
                isLast={index === sorted.length - 1}
              />
            )
          })}

          {hasAccommodation && (
            <div
              className="absolute flex items-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
              style={{ top: 'calc(100% - 2.5rem)', left: '1rem' }}
            >
              <BedDouble className="h-4 w-4" aria-hidden="true" />
              Fin del día — alojamiento
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TimelineEventProps {
  event: ItineraryItem
  top: number
  height: number
  isLast: boolean
}

function TimelineEvent({ event, top, isLast }: TimelineEventProps) {
  const config = EVENT_TYPE_CONFIG[event.type]
  const Icon = getEventIcon(event)
  const mapsUrl = getGoogleMapsUrl(event.location)

  return (
    <>
      <div
        className="absolute left-8 w-px border-l-2 border-dashed border-gray-300 dark:border-slate-600"
        style={{ top: `${top}%`, height: isLast ? '0' : `${100 - top}%` }}
        aria-hidden="true"
      />

      <div
        className={`absolute left-10 right-0 rounded-xl border p-3 shadow-sm ${config.bgColor} ${config.borderColor}`}
        style={{ top: `${top}%`, minHeight: '3rem' }}
      >
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-slate-900/40">
            <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {event.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatEventTimeRange(event.startTime, event.endTime)}
            </p>
            {event.location && (
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {event.location.name}
              </p>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-medium text-travel-blue-600 hover:underline dark:text-travel-blue-400"
                onClick={(event) => event.stopPropagation()}
              >
                Ver mapa
              </a>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute left-7 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-travel-blue-500 dark:border-slate-900"
        style={{ top: `${top}%` }}
        aria-hidden="true"
      />
    </>
  )
}
