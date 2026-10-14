import { Link } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import { tripButtonClass } from './buttonStyles'
import { SECTION_STYLE } from './sectionStyle'

const { edge, soft } = SECTION_STYLE.see

export interface FreeTimeIdeasData {
  names: string[]
  /** Route to the day's "Visitar" tab. */
  to: string
}

/** Ideas for a free-time slot: the day's alternative sights and a link to their details. */
function FreeTimeIdeas({ names, to }: FreeTimeIdeasData) {
  if (names.length === 0) return null
  return (
    <div className={`mt-2 flex flex-col gap-2 rounded-2xl border-l-4 ${edge} ${soft} p-3`}>
      <p className="text-sm font-bold uppercase tracking-wider text-trip-muted">Ideas</p>
      <ul className="flex flex-col gap-1 text-base text-trip-ink2">
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <Link to={to} className={tripButtonClass('secondary', 'self-start')}>
        <Lightbulb className="h-5 w-5" aria-hidden="true" />
        Ver ideas
      </Link>
    </div>
  )
}

export default FreeTimeIdeas
