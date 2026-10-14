import { Link } from 'react-router-dom'
import { formatReadingCount, type GuideTopic } from '../domain/guide'
import { GUIDE_TOPIC_STYLE } from './guideTopicStyle'
import GuideTopicIcon from './GuideTopicIcon'

interface GuideTopicCardProps {
  topic: GuideTopic
  tripId: string
}

function GuideTopicCard({ topic, tripId }: GuideTopicCardProps) {
  const { stripe } = GUIDE_TOPIC_STYLE[topic.category]
  return (
    <Link
      to={`/trips/${tripId}/guide/topic/${topic.category}`}
      className={`flex h-full min-h-[150px] flex-col items-start gap-3 rounded-[20px] border border-t-[6px] border-trip-line ${stripe} bg-trip-card p-4 text-trip-ink no-underline active:bg-trip-soft`}
    >
      <GuideTopicIcon category={topic.category} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="hyphens-auto break-words text-lg font-bold leading-tight md:text-xl">
          {topic.label}
        </span>
        <span className="text-base text-trip-ink2">{formatReadingCount(topic.count)}</span>
      </span>
    </Link>
  )
}

export default GuideTopicCard
