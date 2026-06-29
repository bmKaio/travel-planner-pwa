import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plane, BedDouble } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ItineraryItem } from '../../types'
import { TRIP_META } from '../../types'

interface Segment {
  checkIn: string
  checkOut: string
  city: string
  hotel: string
}

function cityFromTags(tags: string[] | undefined): string {
  const slug = tags?.find((t) => t !== 'alojamiento') ?? ''
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function cleanHotelName(title: string): string {
  const emdash = title.indexOf(' — ')
  return emdash !== -1 ? title.slice(emdash + 3) : title
}

function formatDateRange(from: string, to: string): string {
  const start = parseISO(from)
  const end = parseISO(to)
  if (from === to) return format(start, 'd MMM', { locale: es })
  if (format(start, 'MM') === format(end, 'MM')) {
    return `${format(start, 'd')}-${format(end, 'd MMM', { locale: es })}`
  }
  return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM', { locale: es })}`
}

interface Props {
  items: ItineraryItem[]
}

function TripTimeline({ items }: Props) {
  const segments = useMemo<Segment[]>(() => {
    const accommodations = items
      .filter((i) => i.type === 'accommodation')
      .sort((a, b) => a.date.localeCompare(b.date))

    return accommodations.map((acc, idx) => ({
      checkIn: acc.date,
      checkOut: accommodations[idx + 1]?.date ?? TRIP_META.endDate,
      city: cityFromTags(acc.tags),
      hotel: cleanHotelName(acc.title),
    }))
  }, [items])

  if (segments.length === 0) return null

  return (
    <section aria-label="Itinerario del viaje">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Vista del viaje</h2>
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {/* Departure */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center self-stretch">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60">
              <Plane className="h-3 w-3 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div className="mt-0.5 w-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="pb-3 pt-0.5">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {format(parseISO(TRIP_META.startDate), 'd MMM', { locale: es })}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Salida Madrid</p>
          </div>
        </div>

        {/* Accommodation segments */}
        {segments.map((seg) => (
          <Link
            key={seg.checkIn}
            to={`/schedule/${seg.checkIn}`}
            className="group flex items-start gap-3"
          >
            <div className="flex flex-col items-center self-stretch">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 transition-colors group-hover:bg-amber-200 dark:bg-amber-900/50 dark:group-hover:bg-amber-800/60">
                <BedDouble
                  className="h-3 w-3 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-0.5 w-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-1 pb-3 pt-0.5">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatDateRange(seg.checkIn, seg.checkOut)}
              </p>
              <p className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {seg.city}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{seg.hotel}</p>
            </div>
          </Link>
        ))}

        {/* Return */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60">
            <Plane
              className="h-3 w-3 rotate-180 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
          </div>
          <div className="pt-0.5">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {format(parseISO(TRIP_META.endDate), 'd MMM', { locale: es })}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Vuelta a Madrid</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(TripTimeline)
