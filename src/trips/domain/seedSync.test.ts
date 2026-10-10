import { describe, expect, it } from 'vitest'
import { makeContent, makeDay } from '../testing/makeContent'
import { setupTestTripsDb } from '../testing/testTripsDb'
import { checklistItemId, syncTripContent } from './seedSync'

const getDb = setupTestTripsDb()

describe('syncTripContent', () => {
  it('writes days, namespaced checklist items, emergency info and the version', async () => {
    const db = getDb()
    expect(await syncTripContent(db, makeContent())).toBe(true)

    const days = await db.days.where('tripId').equals('peru-2026').sortBy('date')
    expect(days.map((d) => [d.tripId, d.date])).toEqual([
      ['peru-2026', '2026-10-17'],
      ['peru-2026', '2026-10-18'],
    ])
    expect(await db.checklistItems.get('peru-2026:g1')).toEqual({
      id: 'peru-2026:g1',
      tripId: 'peru-2026',
      group: 'shared',
      label: 'Contratar el seguro',
      order: 1,
      done: false,
    })
    expect(await db.helpInfo.get('peru-2026')).toEqual({
      tripId: 'peru-2026',
      emergency: { label: 'Emergencias en Perú', number: '105', description: 'Policía' },
      cards: [],
      contacts: [],
      docs: [],
    })
    expect(await db.contentState.get('peru-2026')).toEqual({ tripId: 'peru-2026', seedVersion: 1 })
  })

  it('does nothing when the stored version is the same', async () => {
    const db = getDb()
    await syncTripContent(db, makeContent())
    const changed = makeContent({ days: [makeDay('2026-10-17', 'Cambiado')] })
    expect(await syncTripContent(db, changed)).toBe(false)
    expect((await db.days.get(['peru-2026', '2026-10-17']))?.title).toBe('Día 2026-10-17')
  })

  it('does nothing when the content is older than the stored version (rollback)', async () => {
    const db = getDb()
    await syncTripContent(db, makeContent({ seedVersion: 3 }))
    expect(await syncTripContent(db, makeContent({ seedVersion: 2 }))).toBe(false)
    expect(await db.contentState.get('peru-2026')).toEqual({ tripId: 'peru-2026', seedVersion: 3 })
  })

  it('keeps checklist ticks across a version bump, including renamed items', async () => {
    const db = getDb()
    await syncTripContent(db, makeContent())
    await db.checklistItems.update('peru-2026:g1', { done: true })

    await syncTripContent(
      db,
      makeContent({
        seedVersion: 2,
        checklist: [
          { key: 'g1', group: 'shared', label: 'Contratar el seguro de viaje', order: 1 },
          { key: 'p1', group: 'private', label: 'Pasaporte', order: 2 },
        ],
      })
    )

    expect(await db.checklistItems.get('peru-2026:g1')).toMatchObject({
      label: 'Contratar el seguro de viaje',
      done: true,
    })
    expect(await db.checklistItems.get('peru-2026:p1')).toMatchObject({ done: false })
  })

  it('deletes checklist items removed from the content', async () => {
    const db = getDb()
    await syncTripContent(db, makeContent())
    await syncTripContent(
      db,
      makeContent({
        seedVersion: 2,
        checklist: [{ key: 'g1', group: 'shared', label: 'Contratar el seguro', order: 1 }],
      })
    )
    expect(await db.checklistItems.get('peru-2026:p1')).toBeUndefined()
  })

  it('replaces the days of the trip and leaves other trips alone', async () => {
    const db = getDb()
    await syncTripContent(db, makeContent())
    await syncTripContent(db, makeContent({ tripId: 'chile-2027', days: [makeDay('2027-02-10')] }))

    await syncTripContent(db, makeContent({ seedVersion: 2, days: [makeDay('2026-10-18')] }))

    const peruDays = await db.days.where('tripId').equals('peru-2026').toArray()
    expect(peruDays.map((d) => d.date)).toEqual(['2026-10-18'])
    expect(await db.days.get(['chile-2027', '2027-02-10'])).toBeDefined()
  })

  it('never touches notes or imported help data, but updates the emergency info', async () => {
    const db = getDb()
    await syncTripContent(db, makeContent())
    await db.notes.put({ tripId: 'peru-2026', text: 'Llevar dólares', updatedAt: new Date() })
    await db.helpInfo.update('peru-2026', {
      cards: [{ title: 'Seguro', sub: '24 h', cta: 'Llamar', phone: '+34900000000' }],
      contacts: [{ name: 'Ana', role: 'Organiza' }],
      docs: [{ name: 'Pasaportes', where: 'Riñonera', who: 'Embajada' }],
    })

    await syncTripContent(
      db,
      makeContent({
        seedVersion: 2,
        emergency: {
          label: 'Emergencias en Perú',
          number: '105',
          description: 'Policía. SAMU 106',
        },
      })
    )

    expect((await db.notes.get('peru-2026'))?.text).toBe('Llevar dólares')
    const help = await db.helpInfo.get('peru-2026')
    expect(help?.cards).toHaveLength(1)
    expect(help?.contacts).toEqual([{ name: 'Ana', role: 'Organiza' }])
    expect(help?.docs).toHaveLength(1)
    expect(help?.emergency?.description).toBe('Policía. SAMU 106')
  })

  it('rolls everything back when the content is invalid', async () => {
    const db = getDb()
    await syncTripContent(db, makeContent())
    const invalidDay = { ...makeDay('2026-10-19'), date: undefined as unknown as string }

    await expect(
      syncTripContent(db, makeContent({ seedVersion: 2, days: [invalidDay] }))
    ).rejects.toThrow()

    expect(await db.days.where('tripId').equals('peru-2026').count()).toBe(2)
    expect(await db.contentState.get('peru-2026')).toEqual({ tripId: 'peru-2026', seedVersion: 1 })
  })
})

describe('checklistItemId', () => {
  it('namespaces the key with the trip id', () => {
    expect(checklistItemId('peru-2026', 'g1')).toBe('peru-2026:g1')
  })
})
