import { describe, expect, it } from 'vitest'
import type { TripMeta } from '../types'
import { getTripStatus, sortTripsForSwitcher, TRIP_STATUS_LABEL } from './tripStatus'

const trip = (id: string, startDate: string, endDate: string): TripMeta => ({
  id,
  name: id,
  startDate,
  endDate,
  countries: [],
  engine: 'v2',
})

describe('getTripStatus', () => {
  const peru = trip('peru-2026', '2026-10-17', '2026-10-28')

  it('is upcoming before the first day', () => {
    expect(getTripStatus(peru, '2026-10-16')).toBe('upcoming')
  })

  it('is current on the first and last day (inclusive)', () => {
    expect(getTripStatus(peru, '2026-10-17')).toBe('current')
    expect(getTripStatus(peru, '2026-10-28')).toBe('current')
  })

  it('is past after the last day', () => {
    expect(getTripStatus(peru, '2026-10-29')).toBe('past')
  })
})

describe('sortTripsForSwitcher', () => {
  const vietnam = trip('vietnam-2026', '2026-07-04', '2026-07-20')
  const italy = trip('italy-2025', '2025-05-01', '2025-05-08')
  const peru = trip('peru-2026', '2026-10-17', '2026-10-28')
  const chile = trip('chile-2027', '2027-02-10', '2027-02-20')
  const japan = trip('japan-2026', '2026-10-01', '2026-10-20')

  it('puts current trips first, then upcoming by start date', () => {
    const { active } = sortTripsForSwitcher([chile, peru, japan, vietnam], '2026-10-10')
    expect(active.map((t) => t.id)).toEqual(['japan-2026', 'peru-2026', 'chile-2027'])
  })

  it('lists past trips most recent first', () => {
    const { past } = sortTripsForSwitcher([italy, vietnam, peru], '2026-10-10')
    expect(past.map((t) => t.id)).toEqual(['vietnam-2026', 'italy-2025'])
  })
})

describe('TRIP_STATUS_LABEL', () => {
  it('has Spanish labels', () => {
    expect(TRIP_STATUS_LABEL).toEqual({
      upcoming: 'Próximo',
      current: 'En curso',
      past: 'Terminado',
    })
  })
})
