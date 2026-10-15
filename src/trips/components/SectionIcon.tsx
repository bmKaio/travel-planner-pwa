import type { LucideIcon } from 'lucide-react'
import { SECTION_STYLE, type SectionKey } from './sectionStyle'

interface SectionIconProps {
  section: SectionKey
  /** Replaces the section's own icon (e.g. contacts and documents are both "private"). */
  icon?: LucideIcon
}

function SectionIcon({ section, icon }: SectionIconProps) {
  const style = SECTION_STYLE[section]
  const Icon = icon ?? style.icon
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.soft}`}
    >
      <Icon className={`h-5 w-5 ${style.ink}`} aria-hidden="true" />
    </span>
  )
}

export default SectionIcon
