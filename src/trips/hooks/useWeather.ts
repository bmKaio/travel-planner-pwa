import { useEffect, useMemo, useState } from 'react'
import { WEATHER_PLACES } from '../content/weatherPlaces'
import { toLocalIsoDate } from '../domain/dates'
import { getBrowserStorage } from '../domain/lastTrip'
import {
  forecastRequests,
  forecastUrl,
  isCacheFresh,
  mergeForecasts,
  parseForecast,
  readWeatherCache,
  WEATHER_MAX_AGE_MS,
  weatherCells,
  weatherSlots,
  type DailyForecast,
  type WeatherCacheEntry,
  type WeatherCell,
} from '../domain/weather'
import { useNow } from './useNow'
import { useTripDays } from './useTripDays'

const cacheKey = (placeName: string): string => `travel-planner-weather:${placeName}`

function readCache(placeName: string): WeatherCacheEntry | undefined {
  try {
    return readWeatherCache(getBrowserStorage()?.getItem(cacheKey(placeName)) ?? null)
  } catch {
    return undefined
  }
}

function writeCache(placeName: string, entry: WeatherCacheEntry): void {
  try {
    getBrowserStorage()?.setItem(cacheKey(placeName), JSON.stringify(entry))
  } catch {
    // Storage unavailable: the forecast still shows until the page is reloaded.
  }
}

/**
 * Forecast cells (today, tomorrow, day after) for the trip's cities. Reads the last forecast
 * from localStorage first so it works offline, and refetches from Open-Meteo when it is older
 * than three hours or misses a date. Network errors keep whatever is cached.
 */
export function useWeather(tripId: string): WeatherCell[] {
  const { days } = useTripDays(tripId)
  const now = useNow()
  const today = toLocalIsoDate(now)
  // Changes every three hours, so a long-open app refetches without a date change.
  const refreshWindow = Math.floor(now.getTime() / WEATHER_MAX_AGE_MS)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [forecasts, setForecasts] = useState<ReadonlyMap<string, DailyForecast[]>>(new Map())

  const slots = useMemo(() => weatherSlots(days, today, WEATHER_PLACES), [days, today])
  const requests = useMemo(() => forecastRequests(slots), [slots])
  const requestKey = requests.map((r) => `${r.place.name}:${r.dates.join(',')}`).join('|')

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const store = (placeName: string, list: DailyForecast[]) =>
      setForecasts((previous) => new Map(previous).set(placeName, list))

    for (const { place, dates } of requests) {
      const cached = readCache(place.name)
      if (cached) store(place.name, cached.days)
      if (!online || isCacheFresh(cached, dates, Date.now())) continue

      fetch(forecastUrl(place, dates[0], dates[dates.length - 1]), { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          return response.json()
        })
        .then((json: unknown) => {
          const merged = mergeForecasts(cached?.days ?? [], parseForecast(json), today)
          writeCache(place.name, { fetchedAt: Date.now(), days: merged })
          store(place.name, merged)
        })
        .catch(() => {
          // Offline, aborted or a bad answer: keep the cached forecast (or none).
        })
    }
    return () => controller.abort()
    // requestKey stands for `requests`; refreshWindow and online trigger a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, refreshWindow, online, today])

  return useMemo(() => weatherCells(slots, forecasts), [slots, forecasts])
}
