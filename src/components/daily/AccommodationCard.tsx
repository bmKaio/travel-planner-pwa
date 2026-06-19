import { BedDouble, Clock, MapPin, Navigation } from 'lucide-react'
import type { ItineraryItem, Location } from '../../types'

export interface AccommodationCardProps {
  accommodation: ItineraryItem
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

export function AccommodationCard({ accommodation }: AccommodationCardProps) {
  const address = accommodation.location?.name ?? accommodation.location?.address
  const mapsUrl = getMapsUrl(accommodation.location)

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900/40">
        <BedDouble className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{accommodation.title}</p>
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
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-travel-blue-600 hover:bg-travel-blue-50 dark:bg-slate-900/40 dark:text-travel-blue-400 dark:hover:bg-travel-blue-900/20"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              Cómo llegar
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
