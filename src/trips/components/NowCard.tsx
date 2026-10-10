import { MapPin } from 'lucide-react'
import MapsLink from './MapsLink'

interface NowCardProps {
  label: string
  range: string
  title: string
  place: string
  url: string
}

function NowCard({ label, range, title, place, url }: NowCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-[22px] border-[1.5px] border-trip-ink bg-trip-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="rounded-lg bg-trip-ink px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider text-trip-bg">
          {label}
        </span>
        <span className="font-trip-mono text-lg font-semibold">{range}</span>
      </div>
      <h2 className="text-[25px] font-bold leading-tight">{title}</h2>
      <p className="flex items-center gap-2 text-lg font-medium text-trip-ink2">
        <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
        {place}
      </p>
      <MapsLink href={url} variant="primary" className="mt-1 w-full">
        Cómo llegar
      </MapsLink>
    </section>
  )
}

export default NowCard
