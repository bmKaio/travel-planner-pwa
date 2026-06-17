import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Place, PlaceCategory } from '../types'

export interface UsePlacesResult {
  places: Place[]
  loading: boolean
  error: Error | null
  create: (item: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  update: (id: string, changes: Partial<Place>) => Promise<void>
  remove: (id: string) => Promise<void>
  getByCategory: (category: PlaceCategory) => Place[]
}

export function usePlaces(): UsePlacesResult {
  const [error, setError] = useState<Error | null>(null)

  const places = useLiveQuery<Place[]>(() => db.places.orderBy('name').toArray(), [])

  const create = useCallback(async (item: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const now = new Date()
      const id = crypto.randomUUID()
      await db.places.add({ ...item, id, createdAt: now, updatedAt: now })
      return id
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const update = useCallback(async (id: string, changes: Partial<Place>) => {
    try {
      setError(null)
      await db.places.update(id, { ...changes, updatedAt: new Date() })
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      setError(null)
      await db.places.delete(id)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const getByCategory = useCallback(
    (category: PlaceCategory) => {
      return (places ?? []).filter((place) => place.category === category)
    },
    [places]
  )

  return {
    places: places ?? [],
    loading: places === undefined,
    error,
    create,
    update,
    remove,
    getByCategory,
  }
}
