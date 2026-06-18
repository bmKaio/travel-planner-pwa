import { CalendarDays } from 'lucide-react'

interface DayPlanCardProps {
  description: string
}

export function DayPlanCard({ description }: DayPlanCardProps) {
  return (
    <div className="rounded-2xl border border-travel-blue-100 bg-travel-blue-50 p-4 dark:border-travel-blue-900/40 dark:bg-travel-blue-950/20">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-travel-blue-600 dark:bg-travel-blue-500">
          <CalendarDays className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-travel-blue-700 dark:text-travel-blue-300">
          Plan del día
        </span>
      </div>
      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{description}</p>
    </div>
  )
}
