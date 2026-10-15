import type { Stay } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'
import PhoneLink from './PhoneLink'
import { SECTION_STYLE } from './sectionStyle'

const { icon: StayIcon, edge, ink, soft } = SECTION_STYLE.stay

function StayCard({ stay }: { stay: Stay }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card p-[18px]`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${soft}`}>
          <StayIcon className={`h-6 w-6 ${ink}`} aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-lg font-semibold">{stay.name}</p>
          <p className="text-base text-trip-muted">{stay.meta}</p>
        </div>
      </div>
      <MapsLink href={directionsUrl(stay.q)} variant="primary" className="w-full">
        Cómo llegar al alojamiento
      </MapsLink>
      {stay.phone && (
        <PhoneLink number={stay.phone} variant="ghost" className="w-full">
          Llamar
        </PhoneLink>
      )}
    </div>
  )
}

export default StayCard
