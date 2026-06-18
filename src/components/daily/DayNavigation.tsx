import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface DayNavigationProps {
  dayNumber: number
  totalDays: number
  onPrevDay: () => void
  onNextDay: () => void
}

export function DayNavigation({ dayNumber, totalDays, onPrevDay, onNextDay }: DayNavigationProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={onPrevDay}
        className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
        aria-label="Día anterior"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">Navegación</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Día {dayNumber} de {totalDays}
        </p>
      </div>
      <button
        type="button"
        onClick={onNextDay}
        className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
        aria-label="Día siguiente"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
