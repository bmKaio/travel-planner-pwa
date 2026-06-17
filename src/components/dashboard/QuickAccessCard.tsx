import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface QuickAccessCardProps {
  icon: LucideIcon
  title: string
  value: string
  link: string
  accent?: 'blue' | 'green' | 'amber' | 'rose'
  ariaLabel?: string
}

const accentClasses = {
  blue: {
    iconBg:
      'bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300',
    hover: 'hover:border-travel-blue-300 dark:hover:border-travel-blue-700',
  },
  green: {
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    hover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  amber: {
    iconBg:
      'bg-travel-amber-100 text-travel-amber-700 dark:bg-travel-amber-900/40 dark:text-travel-amber-300',
    hover: 'hover:border-travel-amber-300 dark:hover:border-travel-amber-700',
  },
  rose: {
    iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    hover: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
}

function QuickAccessCard({
  icon: Icon,
  title,
  value,
  link,
  accent = 'blue',
  ariaLabel,
}: QuickAccessCardProps) {
  const navigate = useNavigate()
  const colors = accentClasses[accent]

  return (
    <button
      type="button"
      onClick={() => navigate(link)}
      className={`flex w-full flex-col rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 ${colors.hover}`}
      aria-label={ariaLabel ?? `Ir a ${title}: ${value}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.iconBg}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </button>
  )
}

export default memo(QuickAccessCard)
