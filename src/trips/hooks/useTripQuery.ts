import { useLiveQuery } from 'dexie-react-hooks'
import { toError } from './toError'

type QueryOutcome<T> = { data: T; error: null } | { data: undefined; error: Error }

export interface TripQueryResult<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
}

/**
 * useLiveQuery rethrows querier errors during render and the app has no error boundary around
 * data hooks. This catches inside the querier so a failed read surfaces as an `error` value.
 * `data` is undefined while loading or after a failure.
 */
export function useTripQuery<T>(querier: () => Promise<T>, deps: unknown[]): TripQueryResult<T> {
  const outcome = useLiveQuery<QueryOutcome<T>>(
    () =>
      querier().then(
        (data): QueryOutcome<T> => ({ data, error: null }),
        (err: unknown): QueryOutcome<T> => ({ data: undefined, error: toError(err) })
      ),
    deps
  )
  return { data: outcome?.data, loading: outcome === undefined, error: outcome?.error ?? null }
}
