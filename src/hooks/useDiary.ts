import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { DiaryEntry } from '../types'
import { importDiaryFromFile } from '../utils/diaryImport'

export interface UseDiaryResult {
  entries: DiaryEntry[]
  loading: boolean
  error: Error | null
  getByDate: (date: string) => DiaryEntry | undefined
  importFromFile: (file: File) => Promise<{ imported: number; errors: string[] }>
}

export function useDiary(): UseDiaryResult {
  const [error, setError] = useState<Error | null>(null)

  const entries = useLiveQuery<DiaryEntry[]>(
    () => db.diaryEntries.orderBy('dayNumber').toArray(),
    []
  )

  const getByDate = useCallback(
    (date: string) => (entries ?? []).find((e) => e.date === date),
    [entries]
  )

  const importFromFile = useCallback(async (file: File) => {
    try {
      setError(null)
      return await importDiaryFromFile(file)
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  return {
    entries: entries ?? [],
    loading: entries === undefined,
    error,
    getByDate,
    importFromFile,
  }
}
