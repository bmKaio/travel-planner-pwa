import {
  Bus,
  CableCar,
  Car,
  Footprints,
  Plane,
  Ship,
  TrainFront,
  type LucideIcon,
} from 'lucide-react'
import type { Leg, LegMode } from '../types'
import { legUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'

const MODE_ICON: Record<LegMode, LucideIcon> = {
  car: Car,
  cable: CableCar,
  walk: Footprints,
  plane: Plane,
  bus: Bus,
  train: TrainFront,
  boat: Ship,
}

function LegList({ legs }: { legs: Leg[] }) {
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {legs.map((leg) => {
        const Icon = MODE_ICON[leg.mode]
        return (
          <li
            key={leg.title}
            className="flex items-center gap-3.5 border-t border-trip-line py-3.5 first:border-t-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trip-soft">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[17px] font-semibold">{leg.title}</p>
              <p className="text-[15px] text-trip-muted">{leg.meta}</p>
            </div>
            <MapsLink href={legUrl(leg)} icon={false} className="px-3">
              Ver ruta
            </MapsLink>
          </li>
        )
      })}
    </ul>
  )
}

export default LegList
