import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { GuideCategory, GuideEntry } from '../types'
import { GUIDE_TOPIC_STYLE } from './guideTopicStyle'

interface GuideTopicListProps {
  entries: GuideEntry[]
  category: GuideCategory
  tripId: string
}

function GuideTopicList({ entries, category, tripId }: GuideTopicListProps) {
  const { edge } = GUIDE_TOPIC_STYLE[category]
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.key}>
          <Link
            to={`/trips/${tripId}/guide/${entry.key}`}
            className={`flex h-full items-center gap-3 rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card py-4 pl-4 pr-3 text-trip-ink no-underline active:bg-trip-soft`}
          >
            <span className="flex flex-1 flex-col gap-1">
              <span className="text-lg font-semibold">{entry.title}</span>
              <span className="text-base leading-snug text-trip-ink2">{entry.summary}</span>
            </span>
            <ChevronRight className="h-6 w-6 shrink-0 text-trip-muted" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default GuideTopicList
