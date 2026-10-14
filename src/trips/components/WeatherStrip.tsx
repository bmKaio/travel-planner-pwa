import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import {
  describeWeather,
  meteoblueUrl,
  weatherAriaLabel,
  type WeatherCell,
  type WeatherKind,
} from '../domain/weather'

const ICONS: Record<WeatherKind, LucideIcon> = {
  clear: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
}

/** Header forecast: up to three days; the whole strip links to meteoblue for the first day. */
function WeatherStrip({ cells }: { cells: WeatherCell[] }) {
  if (cells.length === 0) return null
  const showCity = cells.some((cell) => cell.place.name !== cells[0].place.name)

  return (
    <a
      href={meteoblueUrl(cells[0].place)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={weatherAriaLabel(cells)}
      className="mx-auto grid max-w-md grid-cols-3 gap-2 px-5 pb-2 text-trip-ink no-underline md:max-w-3xl"
    >
      {cells.map((cell) => {
        const Icon = ICONS[describeWeather(cell.forecast.code).kind]
        return (
          <span
            key={cell.date}
            className="flex min-h-[48px] min-w-0 flex-col items-center justify-center rounded-xl bg-trip-soft px-2 py-1"
          >
            <span className="text-sm font-semibold text-trip-ink2">{cell.label}</span>
            <span className="flex items-center gap-1.5">
              <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span className="text-base font-bold">{cell.forecast.max}°</span>
              <span className="text-sm text-trip-ink2">{cell.forecast.min}°</span>
            </span>
            {showCity && (
              <span className="w-full truncate text-center text-sm text-trip-ink2">
                {cell.place.name}
              </span>
            )}
          </span>
        )
      })}
    </a>
  )
}

export default WeatherStrip
