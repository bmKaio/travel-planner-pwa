import { db } from '../db'
import type { DiaryEntry } from '../types'
import { readJsonFile } from './export'

export interface DiaryImportFile {
  version: number
  type: 'travel-diary'
  diaryEntries: DiaryEntry[]
}

function isDiaryImportFile(value: unknown): value is DiaryImportFile {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return obj.type === 'travel-diary' && Array.isArray(obj.diaryEntries)
}

function reviveEntry(raw: DiaryEntry): DiaryEntry {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

// Merge/upsert into diaryEntries ONLY. Never touches other tables, so the
// private diary is fully decoupled from the general backup/restore.
export async function importDiary(json: unknown): Promise<{ imported: number; errors: string[] }> {
  if (!isDiaryImportFile(json)) {
    throw new Error('Formato de archivo de diario no válido')
  }
  const errors: string[] = []
  let imported = 0
  await db.transaction('rw', db.diaryEntries, async () => {
    try {
      const entries = json.diaryEntries.map(reviveEntry)
      await db.diaryEntries.bulkPut(entries)
      imported = entries.length
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  })
  return { imported, errors }
}

export async function importDiaryFromFile(
  file: File
): Promise<{ imported: number; errors: string[] }> {
  const json = await readJsonFile(file)
  return importDiary(json)
}
