import { useState } from 'react'
import { MapPin, Pencil, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import type { ItineraryItem } from '../../types'
import {
  EVENT_TYPE_CONFIG,
  formatEventTimeRange,
  getEventIcon,
  getGoogleMapsUrl,
} from '../../utils/schedule'

interface EventCardProps {
  event: ItineraryItem
  variant?: 'default' | 'timeline'
  onEdit: () => void
  onDelete: () => void
}

export function EventCard({ event, variant = 'default', onEdit, onDelete }: EventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = EVENT_TYPE_CONFIG[event.type]
  const Icon = getEventIcon(event)
  const mapsUrl = getGoogleMapsUrl(event.location)
  const hasLongNotes = (event.notes?.length ?? 0) > 80
  const displayedNotes = hasLongNotes && !expanded ? `${event.notes?.slice(0, 80)}...` : event.notes

  const isTimeline = variant === 'timeline'

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow dark:border-slate-700 dark:bg-slate-900 ${config.borderColor}`}
      aria-label={`${event.title}, ${config.label}`}
    >
      <div className={`${config.bgColor} border-b ${config.borderColor} px-4 py-3`}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white/70 dark:bg-slate-900/40">
            <Icon className={`h-5 w-5 ${config.color}`} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.bgColor} ${config.color} border ${config.borderColor}`}
              >
                {config.label}
              </span>
            </div>

            <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatEventTimeRange(event.startTime, event.endTime)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {event.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300">{event.description}</p>
        )}

        {event.location && (
          <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">{event.location.name}</span>
          </div>
        )}

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-travel-blue-50 px-3 py-2 text-sm font-medium text-travel-blue-700 hover:bg-travel-blue-100 dark:bg-travel-blue-900/30 dark:text-travel-blue-300 dark:hover:bg-travel-blue-900/50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Abrir en Google Maps
          </a>
        )}

        {event.notes && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Notas:</span>{' '}
              {displayedNotes}
            </p>
            {hasLongNotes && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-400"
                aria-expanded={expanded}
              >
                {expanded ? (
                  <>
                    Ver menos <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Ver más <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-slate-800 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {!isTimeline && (
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
              aria-label={`Editar ${event.title}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Editar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
              aria-label={`Eliminar ${event.title}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
