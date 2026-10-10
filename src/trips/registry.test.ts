import { describe, expect, it } from 'vitest'
import { getTrip, TRIPS, VIETNAM_HOME_PATH } from './registry'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

describe('trip registry', () => {
  it('has unique ids', () => {
    const ids = TRIPS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has valid ISO date ranges', () => {
    for (const trip of TRIPS) {
      expect(trip.startDate).toMatch(ISO_DATE)
      expect(trip.endDate).toMatch(ISO_DATE)
      expect(trip.startDate <= trip.endDate).toBe(true)
    }
  })

  it('gives every legacy trip a home path', () => {
    for (const trip of TRIPS.filter((t) => t.engine === 'legacy')) {
      expect(trip.legacyHomePath).toBeTruthy()
    }
  })

  it('registers Vietnam as legacy and Peru as v2', () => {
    expect(getTrip('vietnam-2026')).toMatchObject({
      engine: 'legacy',
      legacyHomePath: VIETNAM_HOME_PATH,
    })
    expect(getTrip('peru-2026')).toMatchObject({
      engine: 'v2',
      startDate: '2026-10-17',
      endDate: '2026-10-28',
    })
  })

  it('returns undefined for unknown ids', () => {
    expect(getTrip('japon-2025')).toBeUndefined()
  })
})
