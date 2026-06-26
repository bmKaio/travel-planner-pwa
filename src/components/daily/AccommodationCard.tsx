import { BedDouble, ChevronRight, Clock, MapPin, Navigation } from 'lucide-react'
import type { ItineraryItem, Location } from '../../types'

export interface AccommodationCardProps {
  accommodation: ItineraryItem
  onClick?: () => void
}

function getMapsUrl(location: Location | undefined): string | null {
  if (!location) return null
  if (location.googleMapsUrl) return location.googleMapsUrl
  if (location.lat !== undefined && location.lng !== undefined) {
    return `https://www.google.com/maps?q=${location.lat},${location.lng}&z=15`
  }
  if (location.address) {
    return `https://www.google.com/maps/search/${encodeURIComponent(location.address)}`
  }
  return null
}

export function AccommodationCard({ accommodation, onClick }: AccommodationCardProps) {
  const address = accommodation.location?.name ?? accommodation.location?.address
  const mapsUrl = getMapsUrl(accommodation.location)

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      {...(onClick
        ? {
            type: 'button' as const,
            onClick,
            'aria-label': `Ver detalle de ${accommodation.title}`,
          }
        : {})}
      className={`flex w-full items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left dark:border-orange-800 dark:bg-orange-900/20${onClick ? ' cursor-pointer transition-colors hover:border-orange-300 hover:bg-orange-100 dark:hover:border-orange-700 dark:hover:bg-orange-900/30' : ''}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900/40">
        <BedDouble className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {accommodation.title}
          </p>
          {onClick && (
            <ChevronRight
              className="h-4 w-4 shrink-0 text-orange-400 dark:text-orange-500"
              aria-hidden="true"
            />
          )}
        </div>
        {address && (
          <div className="mt-1 flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">{address}</span>
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          {accommodation.startTime && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 dark:bg-slate-900/40">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Check-in: {accommodation.startTime}
            </span>
          )}
          {accommodation.endTime && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 dark:bg-slate-900/40">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Check-out: {accommodation.endTime}
            </span>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-travel-blue-600 hover:bg-travel-blue-50 dark:bg-slate-900/40 dark:text-travel-blue-400 dark:hover:bg-travel-blue-900/20"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              Cómo llegar
            </a>
          )}
        </div>
      </div>
    </Wrapper>
  )
}
