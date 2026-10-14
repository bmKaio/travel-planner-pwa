import { describe, expect, it } from 'vitest'
import type { TripMeta } from '../types'
import { resolveLandingTarget, resolveTripRoute, tripHomePath } from './landing'

const vietnam: TripMeta = {
  id: 'vietnam-2026',
  name: 'Vietnam y Camboya',
  startDate: '2026-07-04',
  endDate: '2026-07-20',
  countries: ['Vietnam'],
  engine: 'legacy',
  legacyHomePath: '/trips/vietnam-2026',
}
const peru: TripMeta = {
  id: 'peru-2026',
  name: 'Perú',
  startDate: '2026-10-17',
  endDate: '2026-10-28',
  countries: ['Perú'],
  engine: 'v2',
}
const chile: TripMeta = {
  id: 'chile-2027',
  name: 'Chile',
  startDate: '2027-02-10',
  endDate: '2027-02-20',
  countries: ['Chile'],
  engine: 'v2',
}
const trips = [vietnam, peru, chile]

describe('tripHomePath', () => {
  it('uses the legacy home path for legacy trips', () => {
    expect(tripHomePath(vietnam)).toBe('/trips/vietnam-2026')
  })

  it('falls back to the switcher when a legacy trip has no home path', () => {
    expect(tripHomePath({ ...vietnam, legacyHomePath: undefined })).toBe('/trips')
  })

  it('opens the today screen for v2 trips', () => {
    expect(tripHomePath(peru)).toBe('/trips/peru-2026/today')
  })
})

describe('resolveLandingTarget', () => {
  it('prefers the last opened trip', () => {
    expect(resolveLandingTarget(trips, 'vietnam-2026', '2026-10-20')).toBe('/trips/vietnam-2026')
  })

  it('ignores a stale last opened id and uses the current trip', () => {
    expect(resolveLandingTarget(trips, 'japon-2025', '2026-10-20')).toBe('/trips/peru-2026/today')
  })

  it('uses the soonest upcoming trip when none is current', () => {
    expect(resolveLandingTarget(trips, null, '2026-10-10')).toBe('/trips/peru-2026/today')
  })

  it('falls back to the switcher when every trip is past', () => {
    expect(resolveLandingTarget(trips, null, '2028-01-01')).toBe('/trips')
  })

  it('falls back to the switcher with no trips', () => {
    expect(resolveLandingTarget([], null, '2026-10-10')).toBe('/trips')
  })
})

describe('resolveTripRoute', () => {
  it('renders v2 trips', () => {
    expect(resolveTripRoute(trips, 'peru-2026')).toEqual({ kind: 'v2', trip: peru })
  })

  it('redirects unknown ids to the switcher', () => {
    expect(resolveTripRoute(trips, 'japon-2025')).toEqual({ kind: 'redirect', to: '/trips' })
  })

  it('redirects legacy ids to their legacy home', () => {
    expect(resolveTripRoute(trips, 'vietnam-2026')).toEqual({
      kind: 'redirect',
      to: '/trips/vietnam-2026',
    })
  })
})
