import type { HelpCardInfo } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'
import PhoneLink from './PhoneLink'

function HelpCard({ card }: { card: HelpCardInfo }) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-trip-line bg-trip-card p-[18px]">
      <div className="flex flex-col gap-0.5">
        <p className="text-lg font-bold">{card.title}</p>
        <p className="text-base text-trip-muted">{card.sub}</p>
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
