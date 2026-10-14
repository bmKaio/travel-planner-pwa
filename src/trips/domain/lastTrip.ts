export const LAST_TRIP_KEY = 'travel-planner-last-trip'

export function readLastTripId(storage: Pick<Storage, 'getItem'> | null): string | null {
  if (!storage) return null
  try {
    return storage.getItem(LAST_TRIP_KEY)
  } catch {
    return null
  }
}

export function writeLastTripId(storage: Pick<Storage, 'setItem'> | null, tripId: string): void {
  if (!storage) return
  try {
    storage.setItem(LAST_TRIP_KEY, tripId)
  } catch {
    // Storage unavailable (private mode, quota): the landing falls back to trip dates.
  }
}

export function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
