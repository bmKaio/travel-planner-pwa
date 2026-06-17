import { useNavigate } from 'react-router-dom'
import { MapPin, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import type { Place } from '../../types'
import {
  getCategoryConfig,
  truncate,
  formatCoordinates,
  getGoogleMapsUrl,
} from '../../utils/places'
import Button from '../common/Button'

interface PlaceCardProps {
  place: Place
  onCenter?: (place: Place) => void
  onEdit?: (place: Place) => void
  onDelete?: (place: Place) => void
}

function PlaceCard({ place, onCenter, onEdit, onDelete }: PlaceCardProps) {
  const navigate = useNavigate()
  const config = getCategoryConfig(place.category)
  const CategoryIcon = config.icon

  const locationText =
    place.location.address ?? formatCoordinates(place.location.lat, place.location.lng)

  return (
    <article
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:p-5"
      aria-labelledby={`place-title-${place.id}`}
    >
      <div
        role="link"
        tabIndex={0}
        onClick={() => navigate(`/places/${place.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(`/places/${place.id}`)
          }
        }}
        className="w-full cursor-pointer text-left"
        aria-label={`View details for ${place.name}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgClass} ${config.textClass}`}
            >
              <CategoryIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id={`place-title-${place.id}`}
                className="text-base font-semibold text-gray-900 dark:text-white"
              >
                {place.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.bgClass} ${config.textClass}`}
              >
                {config.label}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {truncate(place.description, 120)}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{locationText}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          className="px-3 py-2 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onCenter?.(place)
          }}
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          View on map
        </Button>

        <a
          href={getGoogleMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Google Maps
        </a>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(place)
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
            aria-label={`Edit ${place.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(place)
            }}
            className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:text-rose-400 dark:hover:bg-rose-900/30"
            aria-label={`Delete ${place.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default PlaceCard
