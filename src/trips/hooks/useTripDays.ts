import { tripsDb } from '../db'
import type { TripDay } from '../types'
import { useTripQuery } from './useTripQuery'

const NO_DAYS: TripDay[] = []

export interface UseTripDaysResult {
  days: TripDay[]
  loading: boolean
  error: Error | null
}

export function useTripDays(tripId: string): UseTripDaysResult {
  const { data, loading, error } = useTripQuery(
    () => tripsDb.days.where('tripId').equals(tripId).sortBy('date'),
    [tripId]
  )
  return { days: data ?? NO_DAYS, loading, error }
}
