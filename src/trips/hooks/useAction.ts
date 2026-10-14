import { useCallback, useState } from 'react'
import { toError } from './toError'

export interface ActionRunner {
  error: Error | null
  /** Runs a write: clears the previous error, records a failure as `error` and rethrows it. */
  run: <T>(action: () => Promise<T>) => Promise<T>
}

export function useAction(): ActionRunner {
  const [error, setError] = useState<Error | null>(null)

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T> => {
    try {
      setError(null)
      return await action()
    } catch (err) {
      const wrapped = toError(err)
      setError(wrapped)
      throw wrapped
    }
  }, [])

  return { error, run }
}
