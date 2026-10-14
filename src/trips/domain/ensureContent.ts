import type { TripsDatabase } from '../db'
import type { TripContent } from '../types'
import { syncTripContent } from './seedSync'

export type EnsureResult = 'synced' | 'unchanged' | 'stale'

/**
 * Loads and syncs a trip's public content. If loading fails (offline and the chunk is not
 * cached) but the trip was synced before, the stored content is used instead of failing.
 */
export async function ensureTripContent(
  db: TripsDatabase,
  tripId: string,
  load: (tripId: string) => Promise<TripContent>
): Promise<EnsureResult> {
  let content: TripContent
  try {
    content = await load(tripId)
  } catch (err) {
    const state = await db.contentState.get(tripId)
    if (state) return 'stale'
    throw err
  }
  return (await syncTripContent(db, content)) ? 'synced' : 'unchanged'
}
