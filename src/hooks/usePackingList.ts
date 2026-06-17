import { useCallback, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { PackingCategory, PackingItem } from '../types'

export interface PackingProgress {
  total: number
  checked: number
  percentage: number
  essential: { total: number; checked: number }
}

export interface UsePackingListResult {
  items: PackingItem[]
  loading: boolean
  error: Error | null
  progress: PackingProgress
  create: (item: Omit<PackingItem, 'id'>) => Promise<string>
  update: (id: string, changes: Partial<PackingItem>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  getByCategory: (category: PackingCategory) => PackingItem[]
}

export function usePackingList(): UsePackingListResult {
  const [error, setError] = useState<Error | null>(null)

  const items = useLiveQuery<PackingItem[]>(() => db.packingItems.orderBy('category').toArray(), [])

  const list = useMemo(() => items ?? [], [items])

  const progress = useMemo<PackingProgress>(() => {
    const total = list.length
    const checked = list.filter((item) => item.checked).length
    const essentialItems = list.filter((item) => item.essential)
    const essentialChecked = essentialItems.filter((item) => item.checked).length
    return {
      total,
      checked,
      percentage: total === 0 ? 0 : Math.round((checked / total) * 100),
      essential: {
        total: essentialItems.length,
        checked: essentialChecked,
      },
    }
  }, [list])

  const create = useCallback(async (item: Omit<PackingItem, 'id'>) => {
    try {
      setError(null)
      const id = crypto.randomUUID()
      await db.packingItems.add({ ...item, id })
      return id
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const update = useCallback(async (id: string, changes: Partial<PackingItem>) => {
    try {
      setError(null)
      await db.packingItems.update(id, changes)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      setError(null)
      await db.packingItems.delete(id)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const toggle = useCallback(
    async (id: string) => {
      const item = list.find((i) => i.id === id)
      if (!item) return
      await update(id, { checked: !item.checked })
    },
    [list, update]
  )

  const getByCategory = useCallback(
    (category: PackingCategory) => {
      return list.filter((item) => item.category === category)
    },
    [list]
  )

  return {
    items: list,
    loading: items === undefined,
    error,
    progress,
    create,
    update,
    remove,
    toggle,
    getByCategory,
  }
}
