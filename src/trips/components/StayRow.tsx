import { BedDouble } from 'lucide-react'
import type { Stay } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import { NO_STAY_TEXT } from '../domain/stayCopy'
import MapsLink from './MapsLink'

function StayRow({ stay }: { stay: Stay | null }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] border border-trip-line bg-trip-card p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-trip-soft">
        <BedDouble className="h-[22px] w-[22px]" aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[17px] font-semibold">{stay ? stay.name : NO_STAY_TEXT}</p>
        {stay && <p className="text-[15px] text-trip-muted">{stay.meta}</p>}
      </div>
      {stay && (
        <MapsLink href={directionsUrl(stay.q)} icon={false} className="px-3">
          Cómo llegar
        </MapsLink>
      )}
    </div>
  )
}

export default StayRow
