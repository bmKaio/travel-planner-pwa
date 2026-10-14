import type { HelpCardInfo } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'
import PhoneLink from './PhoneLink'
import { SECTION_STYLE } from './sectionStyle'

interface HelpCardProps {
  card: HelpCardInfo
  /** Public embassy cards are `consular`; imported agency, insurance and hotel cards are `private`. */
  section: 'consular' | 'private'
}

function HelpCard({ card, section }: HelpCardProps) {
  const { icon: Icon, edge, ink, soft } = SECTION_STYLE[section]
  return (
    <div
      className={`flex flex-col gap-3 rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card p-[18px]`}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${soft}`}
        >
          <Icon className={`h-6 w-6 ${ink}`} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-lg font-bold">{card.title}</p>
          <p className="text-base text-trip-muted">{card.sub}</p>
        </div>
      </div>
      <PhoneLink number={card.phone} className="w-full">
        {card.cta}
      </PhoneLink>
      {card.mapQuery && (
        <MapsLink
          href={directionsUrl(card.mapQuery)}
          variant="ghost"
          icon={false}
          className="w-full"
        >
          Cómo llegar
        </MapsLink>
      )}
    </div>
  )
}

export default HelpCard
