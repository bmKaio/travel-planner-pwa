import { describe, expect, it } from 'vitest'
import { TRIPS } from '../registry'
import { weatherPlaceForDay } from '../domain/weather'
import { loadTripContent } from './index'
import { WEATHER_PLACES } from './weatherPlaces'

const v2Trips = TRIPS.filter((trip) => trip.engine === 'v2')

describe('WEATHER_PLACES', () => {
  it.each(v2Trips)('gives every $id day a weather place', async (trip) => {
    const content = await loadTripContent(trip.id)
    for (const day of content.days) {
      expect(weatherPlaceForDay(day, WEATHER_PLACES), day.date).toBeDefined()
    }
  })

  it('names each place after its key and keeps coordinates in range', () => {
    for (const [city, place] of Object.entries(WEATHER_PLACES)) {
      expect(place.name).toBe(city)
      expect(Math.abs(place.latitude)).toBeLessThanOrEqual(90)
      expect(Math.abs(place.longitude)).toBeLessThanOrEqual(180)
    }
  })

  it('picks the overnight city of a Peru day', async () => {
    const content = await loadTripContent('peru-2026')
    const byDate = new Map(content.days.map((day) => [day.date, day]))
    const placeOn = (date: string) => weatherPlaceForDay(byDate.get(date)!, WEATHER_PLACES)?.name
    expect(placeOn('2026-10-17')).toBe('Lima')
    expect(placeOn('2026-10-20')).toBe('Yanque')
    expect(placeOn('2026-10-25')).toBe('Aguas Calientes')
    expect(placeOn('2026-10-27')).toBe('Cusco')
  })
})
