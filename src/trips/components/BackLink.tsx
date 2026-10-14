import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface BackLinkProps {
  to: string
  label: string
}

/** Button-styled "‹ label" link: easy to see and to hit (≥ 48 px). */
function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-[48px] items-center gap-1 self-start rounded-[14px] border-[1.5px] border-trip-line bg-trip-card pl-2 pr-4 text-base font-semibold text-trip-ink no-underline active:bg-trip-soft"
    >
      <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      {label}
    </Link>
  )
}

export default BackLink
