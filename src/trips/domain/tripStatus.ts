import type { TripMeta, TripStatus } from '../types'

export function getTripStatus(
  trip: Pick<TripMeta, 'startDate' | 'endDate'>,
  today: string
): TripStatus {
  if (today < trip.startDate) return 'upcoming'
  if (today > trip.endDate) return 'past'
  return 'current'
}

export interface SwitcherSections {
  active: TripMeta[]
  past: TripMeta[]
}

/** Current trips first, then upcoming by start date; past trips most recent first. */
export function sortTripsForSwitcher(trips: TripMeta[], today: string): SwitcherSections {
  const byStatus = (status: TripStatus) => trips.filter((t) => getTripStatus(t, today) === status)
  const current = byStatus('current').sort((a, b) => a.startDate.localeCompare(b.startDate))
  const upcoming = byStatus('upcoming').sort((a, b) => a.startDate.localeCompare(b.startDate))
  const past = byStatus('past').sort((a, b) => b.endDate.localeCompare(a.endDate))
  return { active: [...current, ...upcoming], past }
}

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  upcoming: 'Próximo',
  current: 'En curso',
  past: 'Terminado',
}
