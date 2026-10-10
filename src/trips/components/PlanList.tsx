import type { PlanItem } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'

interface PlanListProps {
  items: PlanItem[]
  emptyText?: string
}

function PlanList({ items, emptyText }: PlanListProps) {
  if (items.length === 0) {
    return emptyText ? <p className="text-base text-trip-muted">{emptyText}</p> : null
  }
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {items.map((item) => (
        <li
          key={`${item.t}-${item.title}`}
          className="flex gap-3.5 border-t border-trip-line py-4 first:border-t-0"
        >
          <span className="w-[58px] shrink-0 pt-px font-trip-mono text-lg font-semibold">
            {item.t}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-lg font-semibold leading-snug">{item.title}</p>
            <p className="text-base text-trip-muted">{item.place}</p>
            <MapsLink href={directionsUrl(item.q)} className="mt-2 self-start">
              Cómo llegar
            </MapsLink>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default PlanList
