import { useEffect } from 'react'
import { getBrowserStorage, writeLastTripId } from '../domain/lastTrip'

export function useRecordLastTrip(tripId: string): void {
  useEffect(() => {
    writeLastTripId(getBrowserStorage(), tripId)
  }, [tripId])
}
