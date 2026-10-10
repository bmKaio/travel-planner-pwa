import { describe, expect, it } from 'vitest'
import { TRIPS } from '../registry'
import { minutesOf } from '../domain/today'
import { hasTripContent, loadTripContent } from './index'

const v2Trips = TRIPS.filter((trip) => trip.engine === 'v2')

describe('trip content', () => {
  it('exists for every v2 trip in the registry', () => {
    for (const trip of v2Trips) expect(hasTripContent(trip.id)).toBe(true)
  })

  it.each(v2Trips)('$id content is consistent with the registry', async (trip) => {
    const content = await loadTripContent(trip.id)
    expect(content.tripId).toBe(trip.id)
    expect(Number.isInteger(content.seedVersion) && content.seedVersion > 0).toBe(true)

    const dates = content.days.map((day) => day.date)
    expect(dates).toEqual([...dates].sort())
    expect(new Set(dates).size).toBe(dates.length)
    for (const date of dates) {
      expect(date >= trip.startDate && date <= trip.endDate).toBe(true)
    }

    const keys = content.checklist.map((item) => item.key)
    expect(new Set(keys).size).toBe(keys.length)

    for (const day of content.days) {
      for (const item of day.plan) expect(item.t).toMatch(/^\d{2}:\d{2}$/)
      const minutes = day.plan.map((item) => minutesOf(item.t))
      expect(minutes).toEqual([...minutes].sort((a, b) => a - b))
    }
  })

  it('rejects unknown trips', async () => {
    await expect(loadTripContent('japon-2025')).rejects.toThrow('No hay contenido')
  })

  it('does not treat Object prototype keys as trips', async () => {
    expect(hasTripContent('constructor')).toBe(false)
    await expect(loadTripContent('constructor')).rejects.toThrow('No hay contenido')
  })
})
