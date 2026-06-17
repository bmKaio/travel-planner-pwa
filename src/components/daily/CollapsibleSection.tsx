import { useState } from 'react'
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'

export interface CollapsibleSectionProps {
  title: string
  icon: LucideIcon
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50"
        aria-expanded={isOpen}
        aria-label={title}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-travel-blue-50 dark:bg-travel-blue-900/30">
            <Icon
              className="h-5 w-5 text-travel-blue-600 dark:text-travel-blue-400"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
        )}
      </button>
      <div
        className="transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '2000px' : '0px' }}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  )
}
