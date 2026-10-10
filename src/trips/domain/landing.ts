import type { TripMeta } from '../types'
import { getTripStatus } from './tripStatus'

export function tripHomePath(trip: TripMeta): string {
  if (trip.engine === 'legacy') return trip.legacyHomePath ?? '/trips'
  return `/trips/${trip.id}/today`
}

/** Where `/` should go: last opened trip, else current, else next upcoming, else the switcher. */
export function resolveLandingTarget(
  trips: TripMeta[],
  lastTripId: string | null,
  today: string
): string {
  const last = lastTripId ? trips.find((t) => t.id === lastTripId) : undefined
  if (last) return tripHomePath(last)

  const current = trips.find((t) => getTripStatus(t, today) === 'current')
  if (current) return tripHomePath(current)

  const next = trips
    .filter((t) => getTripStatus(t, today) === 'upcoming')
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
  if (next) return tripHomePath(next)

  return '/trips'
}

export type TripRoute = { kind: 'v2'; trip: TripMeta } | { kind: 'redirect'; to: string }

/** Decides what `/trips/:tripId/*` renders. */
export function resolveTripRoute(trips: TripMeta[], tripId: string): TripRoute {
  const trip = trips.find((t) => t.id === tripId)
  if (!trip) return { kind: 'redirect', to: '/trips' }
  if (trip.engine === 'legacy') return { kind: 'redirect', to: tripHomePath(trip) }
  return { kind: 'v2', trip }
}
