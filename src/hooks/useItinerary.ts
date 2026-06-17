import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { ItineraryItem, ItineraryItemType } from '../types'

export interface UseItineraryResult {
  items: ItineraryItem[]
  loading: boolean
  error: Error | null
  create: (item: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  update: (id: string, changes: Partial<ItineraryItem>) => Promise<void>
  remove: (id: string) => Promise<void>
  getByDate: (date: string) => ItineraryItem[]
  getByType: (type: ItineraryItemType) => ItineraryItem[]
}

export function useItinerary(): UseItineraryResult {
  const [error, setError] = useState<Error | null>(null)

  const items = useLiveQuery<ItineraryItem[]>(
    () =>
      db.itineraryItems
        .orderBy('date')
        .toArray()
        .then((rows) =>
          rows.sort(
            (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
          )
        ),
    []
  )

  const create = useCallback(
    async (item: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setError(null)
        const now = new Date()
        const id = crypto.randomUUID()
        await db.itineraryItems.add({ ...item, id, createdAt: now, updatedAt: now })
        return id
      } catch (err) {
        const wrapped = err instanceof Error ? err : new Error(String(err))
        setError(wrapped)
        throw wrapped
      }
    },
    []
  )

  const update = useCallback(async (id: string, changes: Partial<ItineraryItem>) => {
    try {
      setError(null)
      await db.itineraryItems.update(id, { ...changes, updatedAt: new Date() })
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      setError(null)
      await db.itineraryItems.delete(id)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const getByDate = useCallback(
    (date: string) => {
      return (items ?? []).filter((item) => item.date === date)
    },
    [items]
  )

  const getByType = useCallback(
    (type: ItineraryItemType) => {
      return (items ?? []).filter((item) => item.type === type)
    },
    [items]
  )

  return {
    items: items ?? [],
    loading: items === undefined,
    error,
    create,
    update,
    remove,
    getByDate,
    getByType,
  }
}
