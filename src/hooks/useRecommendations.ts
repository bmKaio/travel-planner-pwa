import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Recommendation, RecommendationPriority, RecommendationType } from '../types'

export interface UseRecommendationsResult {
  recommendations: Recommendation[]
  loading: boolean
  error: Error | null
  create: (item: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  update: (id: string, changes: Partial<Recommendation>) => Promise<void>
  remove: (id: string) => Promise<void>
  getByType: (type: RecommendationType) => Recommendation[]
  getByPriority: (priority: RecommendationPriority) => Recommendation[]
}

export function useRecommendations(): UseRecommendationsResult {
  const [error, setError] = useState<Error | null>(null)

  const recommendations = useLiveQuery<Recommendation[]>(() => db.recommendations.toArray(), [])

  const create = useCallback(
    async (item: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setError(null)
        const now = new Date()
        const id = crypto.randomUUID()
        await db.recommendations.add({ ...item, id, createdAt: now, updatedAt: now })
        return id
      } catch (err) {
        const wrapped = err instanceof Error ? err : new Error(String(err))
        setError(wrapped)
        throw wrapped
      }
    },
    []
  )

  const update = useCallback(async (id: string, changes: Partial<Recommendation>) => {
    try {
      setError(null)
      await db.recommendations.update(id, { ...changes, updatedAt: new Date() })
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      setError(null)
      await db.recommendations.delete(id)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const getByType = useCallback(
    (type: RecommendationType) => {
      return (recommendations ?? []).filter((r) => r.type === type)
    },
    [recommendations]
  )

  const getByPriority = useCallback(
    (priority: RecommendationPriority) => {
      return (recommendations ?? []).filter((r) => r.priority === priority)
    },
    [recommendations]
  )

  return {
    recommendations: recommendations ?? [],
    loading: recommendations === undefined,
    error,
    create,
    update,
    remove,
    getByType,
    getByPriority,
  }
}
