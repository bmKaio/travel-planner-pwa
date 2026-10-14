import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { GuideEntry } from '../types'

interface GuideCardListProps {
  entries: GuideEntry[]
  tripId: string
  /** Set on an itinerary day: the entry page then offers "Volver al día". */
  fromDay?: string
}

function GuideCardList({ entries, tripId, fromDay }: GuideCardListProps) {
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {entries.map((entry) => (
        <li key={entry.key} className="border-t border-trip-line first:border-t-0">
          <Link
            to={`/trips/${tripId}/guide/${entry.key}`}
            state={fromDay ? { fromDay } : undefined}
            className="flex items-center gap-3 py-4 text-trip-ink no-underline"
          >
            <span className="flex flex-1 flex-col gap-1">
              <span className="text-lg font-semibold">{entry.title}</span>
              <span className="text-base leading-snug text-trip-ink2">{entry.summary}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-trip-muted" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default GuideCardList
