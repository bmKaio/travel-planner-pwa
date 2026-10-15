import type { TripDay } from '../types'
import { daysBetween } from './dates'

export interface WeatherPlace {
  name: string
  latitude: number
  longitude: number
}

export type WeatherLabel = 'Hoy' | 'Mañana' | 'Pasado'

export interface WeatherSlot {
  date: string
  label: WeatherLabel
  place: WeatherPlace
}

export interface DailyForecast {
  date: string
  code: number
  /** Rounded °C. */
  max: number
  min: number
  /** Max precipitation probability in %, when the model gives one. */
  rainChance: number | null
}

export interface WeatherCacheEntry {
  fetchedAt: number
  days: DailyForecast[]
}

export interface WeatherCell extends WeatherSlot {
  forecast: DailyForecast
}

export type WeatherKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm'

const LABELS: WeatherLabel[] = ['Hoy', 'Mañana', 'Pasado']

/** A forecast older than this is refetched when online. */
export const WEATHER_MAX_AGE_MS = 3 * 3_600_000

/**
 * City whose weather matters for a day: where you sleep (last known city) when the day has a
 * stay; on a travel day without one, where the day starts (first known city).
 */
export function weatherPlaceForDay(
  day: Pick<TripDay, 'cities' | 'stay'>,
  places: Record<string, WeatherPlace>
): WeatherPlace | undefined {
  const known = day.cities.filter((city) => Object.prototype.hasOwnProperty.call(places, city))
  const city = day.stay ? known[known.length - 1] : known[0]
  return city === undefined ? undefined : places[city]
}

/** Today, tomorrow and the day after, keeping only trip days with a known place. */
export function weatherSlots(
  days: Pick<TripDay, 'date' | 'cities' | 'stay'>[],
  today: string,
  places: Record<string, WeatherPlace>
): WeatherSlot[] {
  const slots: WeatherSlot[] = []
  for (const day of days) {
    const offset = daysBetween(today, day.date)
    if (offset < 0 || offset >= LABELS.length) continue
    const place = weatherPlaceForDay(day, places)
    if (place) slots.push({ date: day.date, label: LABELS[offset], place })
  }
  return slots.sort((a, b) => a.date.localeCompare(b.date))
}

const coord = (value: number): string => value.toFixed(3)

/** Open-Meteo daily forecast; `timezone=auto` makes the dates local to the place. */
export function forecastUrl(place: WeatherPlace, startDate: string, endDate: string): string {
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${coord(place.latitude)}` +
    `&longitude=${coord(place.longitude)}` +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    `&timezone=auto&start_date=${startDate}&end_date=${endDate}`
  )
}

/** meteoblue week forecast; it takes signed decimals as `{lat}N{lon}E`. */
export function meteoblueUrl(place: WeatherPlace): string {
  return `https://www.meteoblue.com/es/tiempo/semana/${coord(place.latitude)}N${coord(place.longitude)}E`
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/** Parses an Open-Meteo response; throws if it is not one. Dates with gaps are dropped. */
export function parseForecast(json: unknown): DailyForecast[] {
  const daily = (json as { daily?: Record<string, unknown> } | null)?.daily
  const time = daily?.time
  if (!daily || !Array.isArray(time)) throw new Error('Respuesta del tiempo no válida')
  const column = (name: string): unknown[] => {
    const values = daily[name]
    return Array.isArray(values) ? values : []
  }
  const codes = column('weather_code')
  const maxes = column('temperature_2m_max')
  const mins = column('temperature_2m_min')
  const rain = column('precipitation_probability_max')

  const forecasts: DailyForecast[] = []
  time.forEach((date, i) => {
    const [code, max, min, chance] = [codes[i], maxes[i], mins[i], rain[i]]
    if (typeof date !== 'string' || !isNumber(code) || !isNumber(max) || !isNumber(min)) return
    forecasts.push({
      date,
      code,
      max: Math.round(max),
      min: Math.round(min),
      rainChance: isNumber(chance) ? chance : null,
    })
  })
  return forecasts
}

/** WMO weather interpretation codes (Open-Meteo docs) → icon kind and Spanish label. */
export function describeWeather(code: number): { kind: WeatherKind; label: string } {
  if (code === 0 || code === 1) return { kind: 'clear', label: 'Despejado' }
  if (code === 2) return { kind: 'partly', label: 'Parcialmente nublado' }
  if (code === 45 || code === 48) return { kind: 'fog', label: 'Niebla' }
  if (code >= 51 && code <= 57) return { kind: 'drizzle', label: 'Llovizna' }
  if (code >= 61 && code <= 67) return { kind: 'rain', label: 'Lluvia' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { kind: 'snow', label: 'Nieve' }
  }
  if (code >= 80 && code <= 82) return { kind: 'rain', label: 'Chubascos' }
  if (code >= 95) return { kind: 'storm', label: 'Tormenta' }
  return { kind: 'cloudy', label: 'Nublado' }
}

/** Reads a stored cache entry; anything unreadable counts as no cache. */
export function readWeatherCache(raw: string | null): WeatherCacheEntry | undefined {
  if (!raw) return undefined
  try {
    const entry = JSON.parse(raw) as Partial<WeatherCacheEntry>
    if (!isNumber(entry.fetchedAt) || !Array.isArray(entry.days)) return undefined
    return { fetchedAt: entry.fetchedAt, days: entry.days }
  } catch {
    return undefined
  }
}

/** Fresh forecasts win over cached ones for the same date; dates before `from` are dropped. */
export function mergeForecasts(
  cached: DailyForecast[],
  fresh: DailyForecast[],
  from = ''
): DailyForecast[] {
  const byDate = new Map(cached.map((day) => [day.date, day]))
  for (const day of fresh) byDate.set(day.date, day)
  return [...byDate.values()]
    .filter((day) => day.date >= from)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** True when the entry is recent enough and covers every requested date. */
export function isCacheFresh(
  entry: WeatherCacheEntry | undefined,
  dates: string[],
  now: number,
  maxAgeMs = WEATHER_MAX_AGE_MS
): boolean {
  if (!entry || now - entry.fetchedAt > maxAgeMs) return false
  return dates.every((date) => entry.days.some((day) => day.date === date))
}

/** Slots that have a forecast, keyed by place name. */
export function weatherCells(
  slots: WeatherSlot[],
  forecasts: ReadonlyMap<string, DailyForecast[]>
): WeatherCell[] {
  const cells: WeatherCell[] = []
  for (const slot of slots) {
    const forecast = forecasts.get(slot.place.name)?.find((day) => day.date === slot.date)
    if (forecast) cells.push({ ...slot, forecast })
  }
  return cells
}

export interface ForecastRequest {
  place: WeatherPlace
  /** Sorted dates of the slots in this place. */
  dates: string[]
}

/** One request per place, so a day in Lima and two in Cusco cost two calls. */
export function forecastRequests(slots: WeatherSlot[]): ForecastRequest[] {
  const byPlace = new Map<string, ForecastRequest>()
  for (const slot of slots) {
    const request = byPlace.get(slot.place.name)
    if (request) request.dates.push(slot.date)
    else byPlace.set(slot.place.name, { place: slot.place, dates: [slot.date] })
  }
  return [...byPlace.values()]
}

/** Spoken text for the whole strip (the link's accessible name). */
export function weatherAriaLabel(cells: WeatherCell[]): string {
  const parts = cells.map(
    ({ label, place, forecast }) =>
      `${label} en ${place.name}: ${describeWeather(forecast.code).label}, ` +
      `máxima ${forecast.max}°, mínima ${forecast.min}°.`
  )
  return ['El tiempo.', ...parts, 'Abre la previsión de meteoblue en otra pestaña.'].join(' ')
}

export type WeatherTone = 'storm' | 'rain' | 'cold' | 'hot' | 'pleasant' | 'cloudy'

/** A night at or below this (°C) counts as cold: time to wrap up. */
export const COLD_MIN_C = 5
/** A sunny day above this max (°C) counts as hot. */
export const HOT_MAX_C = 28

/** Colour family of a forecast cell; the first matching rule wins. */
export function weatherTone(forecast: DailyForecast): WeatherTone {
  const { kind } = describeWeather(forecast.code)
  if (kind === 'storm') return 'storm'
  if (kind === 'rain' || kind === 'drizzle') return 'rain'
  if (kind === 'snow' || forecast.min <= COLD_MIN_C) return 'cold'
  if (kind === 'clear' || kind === 'partly') {
    return forecast.max > HOT_MAX_C ? 'hot' : 'pleasant'
  }
  return 'cloudy'
}
