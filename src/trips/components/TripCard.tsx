import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { TripMeta } from '../types'
import { getTripStatus, TRIP_STATUS_LABEL } from '../domain/tripStatus'
import { tripHomePath } from '../domain/landing'
import { formatDateRange } from '../domain/dates'

interface TripCardProps {
  trip: TripMeta
  today: string
}

function TripCard({ trip, today }: TripCardProps) {
  const status = getTripStatus(trip, today)
  return (
    <Link
      to={tripHomePath(trip)}
      className="flex items-center gap-4 rounded-[20px] border border-trip-line bg-trip-card p-[18px] text-trip-ink no-underline hover:border-trip-ink"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={`self-start rounded-lg px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider ${
            status === 'current' ? 'bg-trip-ink text-trip-bg' : 'bg-trip-soft text-trip-ink2'
          }`}
        >
          {TRIP_STATUS_LABEL[status]}
        </span>
        <span className="text-lg font-semibold">{trip.name}</span>
        <span className="text-base text-trip-muted">
          {formatDateRange(trip.startDate, trip.endDate)} · {trip.countries.join(', ')}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-trip-muted" aria-hidden="true" />
    </Link>
  )
}

export default TripCard
