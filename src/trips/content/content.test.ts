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

  it.each(v2Trips)('$id guide entries are well-formed', async (trip) => {
    const content = await loadTripContent(trip.id)
    const guide = content.guide ?? []
    const keys = guide.map((entry) => entry.key)
    expect(new Set(keys).size).toBe(keys.length)

    const tripDates = new Set(content.days.map((day) => day.date))
    for (const entry of guide) {
      expect(entry.key).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(entry.title.trim()).not.toBe('')
      expect(entry.summary.trim()).not.toBe('')
      expect(entry.body.length).toBeGreaterThan(0)
      for (const paragraph of entry.body) expect(paragraph.trim()).not.toBe('')
      expect(entry.sources.length).toBeGreaterThan(0)
      expect(new Set(entry.sources).size).toBe(entry.sources.length)
      for (const url of entry.sources) expect(url).toMatch(/^https:\/\/\S+$/)
      for (const date of entry.dates ?? []) expect(tripDates.has(date)).toBe(true)
    }
  })

  it.each(v2Trips)('$id day covers are well-formed', async (trip) => {
    const content = await loadTripContent(trip.id)
    for (const day of content.days) {
      const { cover } = day
      if (!cover) continue
      expect(cover.place.trim(), `${day.date} place`).not.toBe('')
      expect(cover.image.trim(), `${day.date} image`).not.toBe('')
      expect(cover.alt.trim(), `${day.date} alt`).not.toBe('')
      expect(cover.credit, `${day.date} credit`).toMatch(/\S · \S/)
      expect(cover.creditUrl, `${day.date} creditUrl`).toMatch(
        /^https:\/\/commons\.wikimedia\.org\//
      )
    }
  })

  it('Peru has a guide', async () => {
    const content = await loadTripContent('peru-2026')
    expect(content.guide?.length ?? 0).toBeGreaterThan(0)
  })

  it('rejects unknown trips', async () => {
    await expect(loadTripContent('japon-2025')).rejects.toThrow('No hay contenido')
  })

  it('does not treat Object prototype keys as trips', async () => {
    expect(hasTripContent('constructor')).toBe(false)
    await expect(loadTripContent('constructor')).rejects.toThrow('No hay contenido')
  })
})
