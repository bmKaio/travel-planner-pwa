import { tripsDb } from '../db'
import type { GuideEntry } from '../types'
import { useTripQuery } from './useTripQuery'

const NO_ENTRIES: GuideEntry[] = []

export interface UseGuideResult {
  entries: GuideEntry[]
  loading: boolean
  error: Error | null
}

/** The trip's guide entries in authored order. */
export function useGuide(tripId: string): UseGuideResult {
  const { data, loading, error } = useTripQuery(
    () => tripsDb.guideEntries.where('tripId').equals(tripId).sortBy('order'),
    [tripId]
  )
  return { entries: data ?? NO_ENTRIES, loading, error }
}
