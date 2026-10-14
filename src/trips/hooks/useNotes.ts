import { useCallback } from 'react'
import { tripsDb } from '../db'
import { useAction } from './useAction'
import { useTripQuery } from './useTripQuery'

export interface UseNotesResult {
  text: string
  loading: boolean
  error: Error | null
  save: (text: string) => Promise<void>
}

export function useNotes(tripId: string): UseNotesResult {
  // null = loaded but empty; undefined = still loading (or failed, see `error`).
  const query = useTripQuery(
    () => tripsDb.notes.get(tripId).then((found) => found ?? null),
    [tripId]
  )
  const action = useAction()
  const { run } = action

  const save = useCallback(
    (text: string) =>
      run(async () => void (await tripsDb.notes.put({ tripId, text, updatedAt: new Date() }))),
    [run, tripId]
  )

  return {
    text: query.data?.text ?? '',
    loading: query.loading,
    error: action.error ?? query.error,
    save,
  }
}
