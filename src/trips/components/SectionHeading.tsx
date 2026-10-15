import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import SectionIcon from './SectionIcon'
import type { SectionKey } from './sectionStyle'

interface SectionHeadingProps {
  section: SectionKey
  children: ReactNode
  icon?: LucideIcon
  /** DOM id of the `h2` (for `aria-labelledby`). */
  id?: string
  size?: 'md' | 'lg'
}

function SectionHeading({ section, children, icon, id, size = 'md' }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2.5">
      <SectionIcon section={section} icon={icon} />
      <h2 id={id} className={`${size === 'lg' ? 'text-2xl' : 'text-xl'} font-bold`}>
        {children}
      </h2>
    </div>
  )
}

export default SectionHeading
