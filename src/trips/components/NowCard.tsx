import { MapPin } from 'lucide-react'
import MapsLink from './MapsLink'
import FreeTimeIdeas, { type FreeTimeIdeasData } from './FreeTimeIdeas'
import { SECTION_STYLE } from './sectionStyle'

const { edge, ink, soft } = SECTION_STYLE.plan

interface NowCardProps {
  label: string
  range: string
  title: string
  place: string
  /** Directions link; null when the item is not a place to go. */
  url: string | null
  /** Ideas for a free-time item. */
  ideas?: FreeTimeIdeasData
}

function NowCard({ label, range, title, place, url, ideas }: NowCardProps) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-[22px] border-[1.5px] border-l-[6px] border-trip-ink ${edge} bg-trip-card p-5`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`rounded-lg ${soft} px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider ${ink}`}
        >
          {label}
        </span>
        <span className="font-trip-mono text-lg font-semibold">{range}</span>
      </div>
      <h2 className="text-[25px] font-bold leading-tight">{title}</h2>
      <p className="flex items-center gap-2 text-lg font-medium text-trip-ink2">
        <MapPin className={`h-5 w-5 shrink-0 ${ink}`} aria-hidden="true" />
        {place}
      </p>
      {url && (
        <MapsLink href={url} variant="primary" className="mt-1 w-full">
          Cómo llegar
        </MapsLink>
      )}
      {ideas && <FreeTimeIdeas {...ideas} />}
    </section>
  )
}

export default NowCard
