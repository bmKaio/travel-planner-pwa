import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ItineraryItem } from '../../types'

interface CalendarProps {
  currentMonth: Date
  events: ItineraryItem[]
  selectedDate?: Date | null
  onChangeMonth: (date: Date) => void
  onSelectDate: (date: Date) => void
  onQuickAdd: (date: Date) => void
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function Calendar({
  currentMonth,
  events,
  selectedDate,
  onChangeMonth,
  onSelectDate,
  onQuickAdd,
}: CalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const eventsByDate = new Map<string, ItineraryItem[]>()
  events.forEach((event) => {
    const list = eventsByDate.get(event.date) ?? []
    list.push(event)
    eventsByDate.set(event.date, list)
  })

  const handleKeyDown = (date: Date, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectDate(date)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeMonth(subMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onChangeMonth(addMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            {weekday}
          </div>
        ))}

        {days.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const dayEvents = eventsByDate.get(dateKey) ?? []
          const hasEvents = dayEvents.length > 0
          const isCurrentMonth = isSameMonth(date, monthStart)
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
          const isTodayDate = isToday(date)

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(date)}
              onContextMenu={(event) => {
                event.preventDefault()
                onQuickAdd(date)
              }}
              onKeyDown={(event) => handleKeyDown(date, event)}
              className={`relative flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl p-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-travel-blue-500 sm:min-h-[4rem] ${
                isSelected
                  ? 'bg-travel-blue-600 text-white shadow-md dark:bg-travel-blue-700'
                  : isTodayDate
                    ? 'bg-travel-blue-50 text-travel-blue-700 dark:bg-travel-blue-900/30 dark:text-travel-blue-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800'
              } ${!isCurrentMonth ? 'opacity-40' : ''}`}
              aria-label={`${format(date, 'EEEE d', { locale: es })}${hasEvents ? `, ${dayEvents.length} eventos` : ''}`}
              aria-pressed={isSelected}
            >
              <span className="font-medium">{format(date, 'd')}</span>
              {hasEvents && (
                <span className="mt-1 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((event, index) => (
                    <span
                      key={`${event.id}-${index}`}
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-travel-blue-500'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Calendario de {format(currentMonth, 'MMMM yyyy', { locale: es })}
      </p>
    </div>
  )
}
