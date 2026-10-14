import type { GuideCategory } from '../types'
import { GUIDE_TOPIC_STYLE } from './guideTopicStyle'

function GuideTopicIcon({ category }: { category: GuideCategory }) {
  const { icon: Icon, ink, soft } = GUIDE_TOPIC_STYLE[category]
  return (
    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${soft}`}>
      <Icon className={`h-7 w-7 ${ink}`} aria-hidden="true" />
    </span>
  )
}

export default GuideTopicIcon
