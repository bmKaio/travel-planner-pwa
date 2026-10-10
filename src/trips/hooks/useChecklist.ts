import { useCallback } from 'react'
import { tripsDb } from '../db'
import type { ChecklistItem } from '../types'
import { useAction } from './useAction'
import { useTripQuery } from './useTripQuery'

const NO_ITEMS: ChecklistItem[] = []

export interface UseChecklistResult {
  items: ChecklistItem[]
  loading: boolean
  error: Error | null
  toggle: (id: string) => Promise<void>
}

export function useChecklist(tripId: string): UseChecklistResult {
  const query = useTripQuery(
    () => tripsDb.checklistItems.where('tripId').equals(tripId).toArray(),
    [tripId]
  )
  const action = useAction()
  const { run } = action

  const toggle = useCallback(
    (id: string) =>
      run(async () => {
        const item = await tripsDb.checklistItems.get(id)
        if (!item) return
        await tripsDb.checklistItems.update(id, { done: !item.done })
      }),
    [run]
  )

  return {
    items: query.data ?? NO_ITEMS,
    loading: query.loading,
    error: action.error ?? query.error,
    toggle,
  }
}
