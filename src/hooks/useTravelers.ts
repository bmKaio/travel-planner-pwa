import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Traveler } from '../types'

export interface UseTravelersResult {
  travelers: Traveler[]
  loading: boolean
  error: Error | null
}

export function useTravelers(): UseTravelersResult {
  const travelers = useLiveQuery<Traveler[]>(() => db.travelers.orderBy('name').toArray(), [])

  return {
    travelers: travelers ?? [],
    loading: travelers === undefined,
    error: null,
  }
}
