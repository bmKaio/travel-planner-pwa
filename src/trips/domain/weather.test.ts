import { describe, expect, it } from 'vitest'
import {
  describeWeather,
  forecastUrl,
  isCacheFresh,
  meteoblueUrl,
  mergeForecasts,
  parseForecast,
  readWeatherCache,
  weatherCells,
  weatherPlaceForDay,
  weatherSlots,
  type DailyForecast,
  type WeatherPlace,
} from './weather'

const LIMA: WeatherPlace = { name: 'Lima', latitude: -12.0464, longitude: -77.0428 }
const CUSCO: WeatherPlace = { name: 'Cusco', latitude: -13.5319, longitude: -71.9675 }
const MADRID: WeatherPlace = { name: 'Madrid', latitude: 40.4168, longitude: -3.7038 }
const PLACES: Record<string, WeatherPlace> = { Lima: LIMA, Cusco: CUSCO, Madrid: MADRID }

const STAY = { name: 'Hotel', meta: '', q: 'Hotel' }

describe('weatherPlaceForDay', () => {
  it('uses the last known city when the day has a stay (where you sleep)', () => {
    expect(weatherPlaceForDay({ cities: ['Madrid', 'Lima'], stay: STAY }, PLACES)).toBe(LIMA)
  })

  it('skips cities without coordinates', () => {
    expect(weatherPlaceForDay({ cities: ['Cusco', 'Moray', 'Maras'], stay: STAY }, PLACES)).toBe(
      CUSCO
    )
  })

  it('uses the first known city on a travel day without a stay', () => {
    expect(weatherPlaceForDay({ cities: ['Cusco', 'Lima', 'Madrid'], stay: null }, PLACES)).toBe(
      CUSCO
    )
  })

  it('returns undefined when no city is known', () => {
    expect(weatherPlaceForDay({ cities: ['Uros'], stay: STAY }, PLACES)).toBeUndefined()
  })
})

describe('weatherSlots', () => {
  const days = [
    { date: '2026-10-17', cities: ['Madrid', 'Lima'], stay: STAY },
    { date: '2026-10-18', cities: ['Lima'], stay: STAY },
    { date: '2026-10-19', cities: ['Cusco'], stay: STAY },
    { date: '2026-10-20', cities: ['Uros'], stay: STAY },
  ]

  it('returns today, tomorrow and the day after with their places', () => {
    expect(weatherSlots(days, '2026-10-17', PLACES)).toEqual([
      { date: '2026-10-17', label: 'Hoy', place: LIMA },
      { date: '2026-10-18', label: 'Mañana', place: LIMA },
      { date: '2026-10-19', label: 'Pasado', place: CUSCO },
    ])
  })

  it('skips dates outside the trip', () => {
    expect(weatherSlots(days, '2026-10-15', PLACES)).toEqual([
      { date: '2026-10-17', label: 'Pasado', place: LIMA },
    ])
  })

  it('skips days whose cities have no coordinates', () => {
    expect(weatherSlots(days, '2026-10-19', PLACES)).toEqual([
      { date: '2026-10-19', label: 'Hoy', place: CUSCO },
    ])
  })

  it('returns nothing after the trip', () => {
    expect(weatherSlots(days, '2026-10-25', PLACES)).toEqual([])
  })
})

describe('forecastUrl', () => {
  it('asks Open-Meteo for the daily fields between two dates in local time', () => {
    expect(forecastUrl(LIMA, '2026-10-17', '2026-10-19')).toBe(
      'https://api.open-meteo.com/v1/forecast?latitude=-12.046&longitude=-77.043' +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
        '&timezone=auto&start_date=2026-10-17&end_date=2026-10-19'
    )
  })
})

describe('meteoblueUrl', () => {
  it('links to the meteoblue week forecast with signed coordinates', () => {
    expect(meteoblueUrl(LIMA)).toBe('https://www.meteoblue.com/es/tiempo/semana/-12.046N-77.043E')
  })

  it('keeps positive coordinates unsigned', () => {
    expect(meteoblueUrl(MADRID)).toBe('https://www.meteoblue.com/es/tiempo/semana/40.417N-3.704E')
  })
})

describe('parseForecast', () => {
  it('turns the Open-Meteo daily arrays into one forecast per date', () => {
    const json = {
      daily: {
        time: ['2026-10-17', '2026-10-18'],
        weather_code: [3, 61],
        temperature_2m_max: [25.9, 24.4],
        temperature_2m_min: [20.2, 19.5],
        precipitation_probability_max: [0, null],
      },
    }
    expect(parseForecast(json)).toEqual([
      { date: '2026-10-17', code: 3, max: 26, min: 20, rainChance: 0 },
      { date: '2026-10-18', code: 61, max: 24, min: 20, rainChance: null },
    ])
  })

  it('drops dates with missing temperatures or code', () => {
    const json = {
      daily: {
        time: ['2026-10-17'],
        weather_code: [null],
        temperature_2m_max: [25],
        temperature_2m_min: [20],
        precipitation_probability_max: [0],
      },
    }
    expect(parseForecast(json)).toEqual([])
  })

  it('throws on an unexpected shape', () => {
    expect(() => parseForecast({ error: true, reason: 'bad' })).toThrow()
    expect(() => parseForecast(null)).toThrow()
  })
})

describe('describeWeather', () => {
  it.each([
    [0, 'clear', 'Despejado'],
    [2, 'partly', 'Parcialmente nublado'],
    [3, 'cloudy', 'Nublado'],
    [45, 'fog', 'Niebla'],
    [53, 'drizzle', 'Llovizna'],
    [63, 'rain', 'Lluvia'],
    [81, 'rain', 'Chubascos'],
    [73, 'snow', 'Nieve'],
    [95, 'storm', 'Tormenta'],
  ])('maps WMO code %i to %s', (code, kind, label) => {
    expect(describeWeather(code)).toEqual({ kind, label })
  })

  it('falls back to cloudy for an unknown code', () => {
    expect(describeWeather(42)).toEqual({ kind: 'cloudy', label: 'Nublado' })
  })
})

const day = (date: string, max = 20): DailyForecast => ({
  date,
  code: 0,
  max,
  min: 10,
  rainChance: 0,
})

describe('readWeatherCache', () => {
  it('reads a stored entry', () => {
    const entry = { fetchedAt: 1000, days: [day('2026-10-17')] }
    expect(readWeatherCache(JSON.stringify(entry))).toEqual(entry)
  })

  it('ignores missing or corrupt values', () => {
    expect(readWeatherCache(null)).toBeUndefined()
    expect(readWeatherCache('not json')).toBeUndefined()
    expect(readWeatherCache('{"fetchedAt":"x"}')).toBeUndefined()
  })
})

describe('mergeForecasts', () => {
  it('replaces dates that were fetched again and keeps the rest, sorted', () => {
    const merged = mergeForecasts(
      [day('2026-10-18', 20), day('2026-10-17', 20)],
      [day('2026-10-18', 25), day('2026-10-19', 22)]
    )
    expect(merged).toEqual([day('2026-10-17', 20), day('2026-10-18', 25), day('2026-10-19', 22)])
  })

  it('drops dates before the given day', () => {
    expect(mergeForecasts([day('2026-10-16')], [day('2026-10-17')], '2026-10-17')).toEqual([
      day('2026-10-17'),
    ])
  })
})

describe('isCacheFresh', () => {
  const HOUR = 3_600_000
  const entry = { fetchedAt: 10 * HOUR, days: [day('2026-10-17'), day('2026-10-18')] }

  it('is fresh when recent and covering every date', () => {
    expect(isCacheFresh(entry, ['2026-10-17', '2026-10-18'], 12 * HOUR)).toBe(true)
  })

  it('is stale after three hours', () => {
    expect(isCacheFresh(entry, ['2026-10-17'], 13 * HOUR + 1)).toBe(false)
  })

  it('is stale when a date is missing', () => {
    expect(isCacheFresh(entry, ['2026-10-19'], 11 * HOUR)).toBe(false)
  })

  it('is stale without an entry', () => {
    expect(isCacheFresh(undefined, ['2026-10-17'], 0)).toBe(false)
  })
})

describe('weatherCells', () => {
  it('pairs each slot with its cached forecast and drops slots without one', () => {
    const slots = weatherSlots(
      [
        { date: '2026-10-17', cities: ['Lima'], stay: STAY },
        { date: '2026-10-18', cities: ['Cusco'], stay: STAY },
      ],
      '2026-10-17',
      PLACES
    )
    const forecasts = new Map([[LIMA.name, [day('2026-10-17', 26)]]])
    expect(weatherCells(slots, forecasts)).toEqual([
      { date: '2026-10-17', label: 'Hoy', place: LIMA, forecast: day('2026-10-17', 26) },
    ])
  })
})
