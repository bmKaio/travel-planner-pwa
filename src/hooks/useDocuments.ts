import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { DocumentItem, DocumentType } from '../types'

export interface UseDocumentsResult {
  documents: DocumentItem[]
  loading: boolean
  error: Error | null
  create: (item: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  update: (id: string, changes: Partial<DocumentItem>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleFavorite: (id: string, current: boolean) => Promise<void>
  getByType: (type: DocumentType) => DocumentItem[]
}

export function useDocuments(): UseDocumentsResult {
  const [error, setError] = useState<Error | null>(null)

  const documents = useLiveQuery<DocumentItem[]>(
    () => db.documents.orderBy('updatedAt').reverse().toArray(),
    []
  )

  const create = useCallback(async (item: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const now = new Date()
      const id = crypto.randomUUID()
      await db.documents.add({ ...item, id, createdAt: now, updatedAt: now })
      return id
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const update = useCallback(async (id: string, changes: Partial<DocumentItem>) => {
    try {
      setError(null)
      await db.documents.update(id, { ...changes, updatedAt: new Date() })
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      setError(null)
      await db.documents.delete(id)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const toggleFavorite = useCallback(async (id: string, current: boolean) => {
    try {
      setError(null)
      await db.documents.update(id, { favorite: !current, updatedAt: new Date() })
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  const getByType = useCallback(
    (type: DocumentType) => {
      return (documents ?? []).filter((doc) => doc.type === type)
    },
    [documents]
  )

  return {
    documents: documents ?? [],
    loading: documents === undefined,
    error,
    create,
    update,
    remove,
    toggleFavorite,
    getByType,
  }
}
