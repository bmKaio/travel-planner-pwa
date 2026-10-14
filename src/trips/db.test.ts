import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { TripsDatabase } from './db'

describe('TripsDatabase', () => {
  it('upgrades a version 1 database without losing data and adds the guide table', async () => {
    const name = `TripsDB-upgrade-${crypto.randomUUID()}`
    const v1 = new Dexie(name)
    v1.version(1).stores({
      days: '[tripId+date], tripId',
      checklistItems: 'id, tripId',
      notes: 'tripId',
      helpInfo: 'tripId',
      contentState: 'tripId',
    })
    await v1
      .table('notes')
      .put({ tripId: 'peru-2026', text: 'Llevar dólares', updatedAt: new Date() })
    await v1.table('checklistItems').put({
      id: 'peru-2026:g1',
      tripId: 'peru-2026',
      group: 'shared',
      label: 'Contratar el seguro',
      done: true,
      order: 1,
    })
    v1.close()

    const db = new TripsDatabase(name)
    try {
      expect((await db.notes.get('peru-2026'))?.text).toBe('Llevar dólares')
      expect((await db.checklistItems.get('peru-2026:g1'))?.done).toBe(true)
      expect(await db.guideEntries.count()).toBe(0)
    } finally {
      db.close()
      await Dexie.delete(name)
    }
  })
})
