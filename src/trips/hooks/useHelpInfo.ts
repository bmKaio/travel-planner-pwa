import { useCallback } from 'react'
import { tripsDb } from '../db'
import { readJsonFile } from '../import/readJsonFile'
import { importTripPrivate } from '../import/privateImport'
import type { HelpInfo } from '../types'
import { useAction } from './useAction'
import { useTripQuery } from './useTripQuery'

export interface UseHelpInfoResult {
  helpInfo: HelpInfo | null
  loading: boolean
  error: Error | null
  importFromFile: (file: File) => Promise<void>
}

export function useHelpInfo(tripId: string): UseHelpInfoResult {
  const query = useTripQuery(
    () => tripsDb.helpInfo.get(tripId).then((found) => found ?? null),
    [tripId]
  )
  const action = useAction()
  const { run } = action

  const importFromFile = useCallback(
    (file: File) =>
      run(async () => {
        const json = await readJsonFile(file)
        await importTripPrivate(tripsDb, json, tripId)
      }),
    [run, tripId]
  )

  return {
    helpInfo: query.data ?? null,
    loading: query.loading,
    error: action.error ?? query.error,
    importFromFile,
  }
}
