import { useState } from 'react'
import {
  BookOpen,
  Users,
  Utensils,
  Gift,
  Heart,
  MessageCircle,
  DollarSign,
  Lightbulb,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'

type SectionType =
  | 'history'
  | 'culture'
  | 'food'
  | 'traditions'
  | 'customs'
  | 'language'
  | 'currency'
  | 'tips'

interface SectionConfig {
  label: string
  icon: LucideIcon
  textClass: string
  bgClass: string
  borderClass: string
}

const SECTION_CONFIG: Record<SectionType, SectionConfig> = {
  history: {
    label: 'History',
    icon: BookOpen,
    textClass: 'text-amber-800 dark:text-amber-200',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-900/40',
  },
  culture: {
    label: 'Culture',
    icon: Users,
    textClass: 'text-purple-800 dark:text-purple-200',
    bgClass: 'bg-purple-50 dark:bg-purple-950/30',
    borderClass: 'border-purple-200 dark:border-purple-900/40',
  },
  food: {
    label: 'Food',
    icon: Utensils,
    textClass: 'text-rose-800 dark:text-rose-200',
    bgClass: 'bg-rose-50 dark:bg-rose-950/30',
    borderClass: 'border-rose-200 dark:border-rose-900/40',
  },
  traditions: {
    label: 'Traditions',
    icon: Gift,
    textClass: 'text-orange-800 dark:text-orange-200',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    borderClass: 'border-orange-200 dark:border-orange-900/40',
  },
  customs: {
    label: 'Customs',
    icon: Heart,
    textClass: 'text-pink-800 dark:text-pink-200',
    bgClass: 'bg-pink-50 dark:bg-pink-950/30',
    borderClass: 'border-pink-200 dark:border-pink-900/40',
  },
  language: {
    label: 'Language',
    icon: MessageCircle,
    textClass: 'text-blue-800 dark:text-blue-200',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200 dark:border-blue-900/40',
  },
  currency: {
    label: 'Currency',
    icon: DollarSign,
    textClass: 'text-emerald-800 dark:text-emerald-200',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-900/40',
  },
  tips: {
    label: 'Tips',
    icon: Lightbulb,
    textClass: 'text-yellow-800 dark:text-yellow-200',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderClass: 'border-yellow-200 dark:border-yellow-900/40',
  },
}

interface CountrySectionProps {
  type: SectionType
  title?: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

function CountrySection({ type, title, children, defaultExpanded = false }: CountrySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const config = SECTION_CONFIG[type]
  const Icon = config.icon

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${config.borderClass} ${config.bgClass} transition-shadow hover:shadow-sm`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${config.textClass}`}
        aria-expanded={isExpanded}
        aria-controls={`country-section-${type}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-slate-900/50`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-base font-semibold">{title ?? config.label}</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div
        id={`country-section-${type}`}
        className={`grid transition-all duration-200 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-black/5 px-4 pb-4 pt-3 dark:border-white/5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CountrySection
