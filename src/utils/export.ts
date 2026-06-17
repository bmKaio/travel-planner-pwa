import { db } from '../db'
import type { DatabaseTableName } from '../types'

export interface ExportedDatabase {
  version: number
  exportedAt: string
  tables: Record<DatabaseTableName, unknown[]>
}

const TABLE_NAMES: DatabaseTableName[] = [
  'documents',
  'itineraryItems',
  'places',
  'dailyPlans',
  'recommendations',
  'countryInfo',
  'packingItems',
  'preTravelSections',
  'travelers',
]

async function getTableRows(name: DatabaseTableName): Promise<unknown[]> {
  const table = db[name] as { toArray(): Promise<unknown[]> }
  return table.toArray()
}

async function clearTable(name: DatabaseTableName): Promise<void> {
  const table = db[name] as { clear(): Promise<void> }
  await table.clear()
}

async function bulkAddToTable(name: DatabaseTableName, rows: unknown[]): Promise<void> {
  const table = db[name] as { bulkAdd(items: unknown[]): Promise<unknown> }
  await table.bulkAdd(rows)
}

export async function exportAllData(): Promise<ExportedDatabase> {
  const entries = await Promise.all(
    TABLE_NAMES.map(async (name) => {
      const rows = await getTableRows(name)
      return [name, rows] as const
    })
  )

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tables: Object.fromEntries(entries) as Record<DatabaseTableName, unknown[]>,
  }
}

export async function exportByType(type: DatabaseTableName): Promise<unknown[]> {
  return getTableRows(type)
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportAllDataToFile(filename = 'travel-planner-data.json'): Promise<void> {
  const data = await exportAllData()
  downloadJson(data, filename)
}

export async function exportByTypeToFile(
  type: DatabaseTableName,
  filename?: string
): Promise<void> {
  const data = await exportByType(type)
  const defaultName = `${type}.json`
  downloadJson(data, filename ?? defaultName)
}

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '')
        resolve(JSON.parse(text))
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function isExportedDatabase(value: unknown): value is ExportedDatabase {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  const tables = obj.tables as Record<string, unknown> | undefined
  return typeof obj.version === 'number' && Array.isArray(tables?.travelers)
}

export interface ImportOptions {
  merge?: boolean
}

export async function importData(
  json: unknown,
  options: ImportOptions = {}
): Promise<{ imported: number; errors: string[] }> {
  const { merge = false } = options
  const errors: string[] = []
  let imported = 0

  if (!isExportedDatabase(json)) {
    throw new Error('Invalid export file format')
  }

  await db.transaction(
    'rw',
    TABLE_NAMES.map((name) => db[name]),
    async () => {
      if (!merge) {
        await Promise.all(TABLE_NAMES.map((name) => clearTable(name)))
      }

      for (const name of TABLE_NAMES) {
        const rows = json.tables[name]
        if (!Array.isArray(rows)) continue

        try {
          await bulkAddToTable(name, rows)
          imported += rows.length
        } catch (err) {
          errors.push(`${name}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
    }
  )

  return { imported, errors }
}

export async function importDataFromFile(
  file: File,
  options?: ImportOptions
): Promise<{ imported: number; errors: string[] }> {
  const json = await readJsonFile(file)
  return importData(json, options)
}
