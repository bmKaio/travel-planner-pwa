import { useOutletContext } from 'react-router-dom'
import type { TripMeta } from '../types'

export interface TripOutletContext {
  trip: TripMeta
}

/** The current v2 trip, provided by V2TripShell through the router outlet. */
export function useTrip(): TripMeta {
  return useOutletContext<TripOutletContext>().trip
}
