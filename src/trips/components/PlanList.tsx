import type { PlanItem } from '../types'
import { planItemUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'
import FreeTimeIdeas, { type FreeTimeIdeasData } from './FreeTimeIdeas'

interface PlanListProps {
  items: PlanItem[]
  emptyText?: string
  /** Shown under free-time items. */
  ideas?: FreeTimeIdeasData
}

function PlanList({ items, emptyText, ideas }: PlanListProps) {
  if (items.length === 0) {
    return emptyText ? <p className="text-base text-trip-muted">{emptyText}</p> : null
  }
  return (
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
      {items.map((item) => {
        const url = planItemUrl(item)
        return (
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
              {url && (
                <MapsLink href={url} className="mt-2 self-start">
                  Cómo llegar
                </MapsLink>
              )}
              {item.free && ideas && <FreeTimeIdeas {...ideas} />}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default PlanList
