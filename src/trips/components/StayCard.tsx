import { BedDouble, Phone } from 'lucide-react'
import type { Stay } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'
import { tripButtonClass } from './buttonStyles'

function StayCard({ stay }: { stay: Stay }) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-trip-line bg-trip-card p-[18px]">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-trip-soft">
          <BedDouble className="h-6 w-6" aria-hidden="true" />
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
        <a href={`tel:${stay.phone}`} className={tripButtonClass('ghost', 'w-full')}>
          <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
          Llamar
        </a>
      )}
    </div>
  )
}

export default StayCard
