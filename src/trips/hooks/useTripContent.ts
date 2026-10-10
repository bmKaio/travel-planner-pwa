import { useCallback, useEffect, useState } from 'react'
import { loadTripContent } from '../content'
import { tripsDb } from '../db'
import { ensureTripContent } from '../domain/ensureContent'

export interface UseTripContentResult {
  ready: boolean
  error: Error | null
  retry: () => void
}

export function useTripContent(tripId: string): UseTripContentResult {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setError(null)
    ensureTripContent(tripsDb, tripId, loadTripContent)
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
    return () => {
      cancelled = true
    }
  }, [tripId, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { ready, error, retry }
}
