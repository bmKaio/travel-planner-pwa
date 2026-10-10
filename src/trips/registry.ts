import type { TripMeta } from './types'

export const VIETNAM_HOME_PATH = '/trips/vietnam-2026'

// Adding a trip to the history = one entry here (+ a content file for v2 trips).
export const TRIPS: TripMeta[] = [
  {
    id: 'vietnam-2026',
    name: 'Vietnam y Camboya',
    startDate: '2026-07-04',
    endDate: '2026-07-20',
    countries: ['Vietnam', 'Camboya'],
    engine: 'legacy',
    legacyHomePath: VIETNAM_HOME_PATH,
  },
  {
    id: 'peru-2026',
    name: 'Perú',
    startDate: '2026-10-17',
    endDate: '2026-10-28',
    countries: ['Perú'],
    engine: 'v2',
  },
]

export function getTrip(id: string, trips: TripMeta[] = TRIPS): TripMeta | undefined {
  return trips.find((trip) => trip.id === id)
}
