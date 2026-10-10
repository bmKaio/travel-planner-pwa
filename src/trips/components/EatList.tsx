import type { EatItem } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'

function EatList({ items }: { items: EatItem[] }) {
  if (items.length === 0) {
    return <p className="text-base text-trip-muted">No hay comidas previstas para este día.</p>
  }
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {items.map((item) => (
        <li
          key={`${item.when}-${item.name}`}
          className="flex flex-col gap-1 border-t border-trip-line py-4 first:border-t-0"
        >
          <p className="text-sm font-bold uppercase tracking-wider text-trip-muted">{item.when}</p>
          <p className="text-lg font-semibold">{item.name}</p>
          <p className="text-base text-trip-muted">{item.kind}</p>
          <p className="text-base leading-snug text-trip-ink2">{item.tip}</p>
          <MapsLink href={directionsUrl(item.q)} className="mt-2 self-start">
            Cómo llegar
          </MapsLink>
        </li>
      ))}
    </ul>
  )
}

export default EatList
