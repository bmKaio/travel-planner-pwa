import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { PreTravelCategory, PreTravelSection } from '../types'

export interface UsePreTravelResult {
  sections: PreTravelSection[]
  loading: boolean
  error: Error | null
  create: (item: Omit<PreTravelSection, 'id'>) => Promise<string>
  update: (id: string, changes: Partial<PreTravelSection>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleItem: (sectionId: string, itemId: string) => Promise<void>
  getByCategory: (category: PreTravelCategory) => PreTravelSection[]
}

export function usePreTravel(): UsePreTravelResult {
  const [error, setError] = useState<Error | null>(null)

  const sections = useLiveQuery<PreTravelSection[]>(() => db.preTravelSections.toArray(), [])

  const create = useCallback(async (item: Omit<PreTravelSection, 'id'>) => {
    try {
      setError(null)
      const id = crypto.randomUUID()
      await db.preTravelSections.add({ ...item, id })
      return id
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const update = useCallback(async (id: string, changes: Partial<PreTravelSection>) => {
    try {
      setError(null)
      await db.preTravelSections.update(id, changes)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      setError(null)
      await db.preTravelSections.delete(id)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const toggleItem = useCallback(
    async (sectionId: string, itemId: string) => {
      try {
        setError(null)
        const section = (sections ?? []).find((s) => s.id === sectionId)
        if (!section) return

        const nextItems = section.items.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
        await db.preTravelSections.update(sectionId, { items: nextItems })
      } catch (err) {
        const wrapped = err instanceof Error ? err : new Error(String(err))
        setError(wrapped)
        throw wrapped
      }
    },
    [sections]
  )

  const getByCategory = useCallback(
    (category: PreTravelCategory) => {
      return (sections ?? []).filter((section) => section.category === category)
    },
    [sections]
  )

  return {
    sections: sections ?? [],
    loading: sections === undefined,
    error,
    create,
    update,
    remove,
    toggleItem,
    getByCategory,
  }
}
