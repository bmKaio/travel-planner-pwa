import { describe, expect, it } from 'vitest'
import { setupTestTripsDb } from '../testing/testTripsDb'
import type { TripMeta } from '../types'
import { importTripPrivate, validatePrivateImport } from './privateImport'

const trips: TripMeta[] = [
  {
    id: 'vietnam-2026',
    name: 'Vietnam y Camboya',
    startDate: '2026-07-04',
    endDate: '2026-07-20',
    countries: [],
    engine: 'legacy',
    legacyHomePath: '/trips/vietnam-2026',
  },
  {
    id: 'peru-2026',
    name: 'Perú',
    startDate: '2026-10-17',
    endDate: '2026-10-28',
    countries: [],
    engine: 'v2',
  },
  {
    id: 'chile-2027',
    name: 'Chile',
    startDate: '2027-02-10',
    endDate: '2027-02-20',
    countries: [],
    engine: 'v2',
  },
]

const validFile = () => ({
  version: 1,
  type: 'trip-private',
  tripId: 'peru-2026',
  helpInfo: {
    cards: [
      {
        title: 'Asistencia 24 h',
        sub: 'Agencia',
        cta: 'Llamar a la agencia',
        phone: '+34000000000',
      },
      {
        title: 'Hotel en Lima',
        sub: 'Miraflores',
        cta: 'Llamar al hotel',
        phone: '+5100000000',
        mapQuery: 'Miraflores, Lima',
      },
    ],
    contacts: [{ name: 'Ana', role: 'Organiza el viaje', phone: '+34600000000' }],
    docs: [{ name: 'Pasaportes', where: 'Riñonera de Ana', who: 'Embajada de España' }],
  },
})

const getDb = setupTestTripsDb()

describe('validatePrivateImport', () => {
  it('accepts a valid file', () => {
    expect(validatePrivateImport(validFile(), 'peru-2026', trips).helpInfo.cards).toHaveLength(2)
  })

  it('rejects other file types', () => {
    expect(() => validatePrivateImport({ type: 'travel-diary' }, 'peru-2026', trips)).toThrow(
      'Formato de archivo no válido'
    )
    expect(() => validatePrivateImport(null, 'peru-2026', trips)).toThrow(
      'Formato de archivo no válido'
    )
  })

  it('rejects unsupported versions', () => {
    expect(() => validatePrivateImport({ ...validFile(), version: 2 }, 'peru-2026', trips)).toThrow(
      'Versión de archivo no soportada'
    )
  })

  it('rejects unknown and legacy trips', () => {
    expect(() =>
      validatePrivateImport({ ...validFile(), tripId: 'japon-2025' }, 'peru-2026', trips)
    ).toThrow('El viaje del archivo no existe o no admite importación')
    expect(() =>
      validatePrivateImport({ ...validFile(), tripId: 'vietnam-2026' }, 'peru-2026', trips)
    ).toThrow('El viaje del archivo no existe o no admite importación')
  })

  it('rejects a file that belongs to another trip', () => {
    expect(() =>
      validatePrivateImport({ ...validFile(), tripId: 'chile-2027' }, 'peru-2026', trips)
    ).toThrow('Este archivo es del viaje "Chile", no de este viaje')
  })

  it('rejects malformed help data', () => {
    const file = validFile()
    const broken = { ...file, helpInfo: { ...file.helpInfo, contacts: [{ name: 'Ana' }] } }
    expect(() => validatePrivateImport(broken, 'peru-2026', trips)).toThrow(
      'Datos de ayuda incompletos o con formato incorrecto'
    )
  })
})

describe('importTripPrivate', () => {
  it('writes the help data and keeps the synced emergency info', async () => {
    const db = getDb()
    const emergency = { label: 'Emergencias en Perú', number: '105', description: 'Policía' }
    await db.helpInfo.put({ tripId: 'peru-2026', emergency, cards: [], contacts: [], docs: [] })

    await importTripPrivate(db, validFile(), 'peru-2026', trips)

    const help = await db.helpInfo.get('peru-2026')
    expect(help?.emergency).toEqual(emergency)
    expect(help?.cards).toHaveLength(2)
    expect(help?.contacts[0].name).toBe('Ana')
  })

  it('works before the first content sync (no emergency yet)', async () => {
    const db = getDb()
    await importTripPrivate(db, validFile(), 'peru-2026', trips)
    expect((await db.helpInfo.get('peru-2026'))?.emergency).toBeNull()
  })

  it('replaces a previous import instead of merging', async () => {
    const db = getDb()
    await importTripPrivate(db, validFile(), 'peru-2026', trips)
    const second = { ...validFile(), helpInfo: { cards: [], contacts: [], docs: [] } }
    await importTripPrivate(db, second, 'peru-2026', trips)
    expect((await db.helpInfo.get('peru-2026'))?.cards).toEqual([])
  })

  it('writes nothing when the file is rejected', async () => {
    const db = getDb()
    await importTripPrivate(db, validFile(), 'peru-2026', trips)
    const before = await db.helpInfo.get('peru-2026')

    await expect(
      importTripPrivate(db, { ...validFile(), tripId: 'chile-2027' }, 'peru-2026', trips)
    ).rejects.toThrow()

    expect(await db.helpInfo.get('peru-2026')).toEqual(before)
  })
})
