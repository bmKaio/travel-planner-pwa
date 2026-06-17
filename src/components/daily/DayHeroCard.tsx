import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin } from 'lucide-react'

export interface DayHeroCardProps {
  image?: string
  date: string
  title: string
  location: string | null
  dayNumber: number
  totalDays: number
  summary?: string
}

export function DayHeroCard({
  image,
  date,
  title,
  location,
  dayNumber,
  totalDays,
  summary,
}: DayHeroCardProps) {
  const parsedDate = isValid(parseISO(date)) ? parseISO(date) : null
  const formattedDate = parsedDate
    ? format(parsedDate, "EEEE, d 'de' MMMM", { locale: es })
    : date

  return (
    <div className="-mx-4 sm:mx-0">
      <div
        className="relative flex aspect-[16/10] w-full flex-col justify-end overflow-hidden rounded-none bg-gradient-to-br from-travel-blue-600 to-travel-blue-900 sm:aspect-[16/9] sm:rounded-2xl"
        style={
          image
            ? {
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.1) 100%), url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-travel-blue-800 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:text-travel-blue-200">
            Día {dayNumber} de {totalDays}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm font-medium capitalize text-white/90">{formattedDate}</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-white sm:text-3xl">{title}</h1>
          {location && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>

      {summary && (
        <div className="px-4 pt-3 sm:px-0">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{summary}</p>
        </div>
      )}
    </div>
  )
}
