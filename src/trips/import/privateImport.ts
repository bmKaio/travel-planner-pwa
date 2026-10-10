import type { TripsDatabase } from '../db'
import { TRIPS } from '../registry'
import type { Contact, DocInfo, HelpCardInfo, TripMeta } from '../types'

export interface TripPrivateFile {
  version: 1
  type: 'trip-private'
  tripId: string
  helpInfo: { cards: HelpCardInfo[]; contacts: Contact[]; docs: DocInfo[] }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isOptionalString = (value: unknown): boolean => value === undefined || isString(value)

function isCard(value: unknown): value is HelpCardInfo {
  return (
    isObject(value) &&
    isString(value.title) &&
    isString(value.sub) &&
    isString(value.cta) &&
    isString(value.phone) &&
    isOptionalString(value.mapQuery)
  )
}

function isContact(value: unknown): value is Contact {
  return (
    isObject(value) && isString(value.name) && isString(value.role) && isOptionalString(value.phone)
  )
}

function isDoc(value: unknown): value is DocInfo {
  return isObject(value) && isString(value.name) && isString(value.where) && isString(value.who)
}

/** Validates a private file (never committed) for the trip the user is looking at. */
export function validatePrivateImport(
  json: unknown,
  expectedTripId: string,
  trips: TripMeta[] = TRIPS
): TripPrivateFile {
  if (!isObject(json) || json.type !== 'trip-private') {
    throw new Error('Formato de archivo no válido')
  }
  if (json.version !== 1) throw new Error('Versión de archivo no soportada')

  const trip = trips.find((t) => t.id === json.tripId)
  if (!trip || trip.engine !== 'v2') {
    throw new Error('El viaje del archivo no existe o no admite importación')
  }
  if (trip.id !== expectedTripId) {
    throw new Error(`Este archivo es del viaje "${trip.name}", no de este viaje`)
  }

  const help = json.helpInfo
  if (
    !isObject(help) ||
    !Array.isArray(help.cards) ||
    !Array.isArray(help.contacts) ||
    !Array.isArray(help.docs) ||
    !help.cards.every(isCard) ||
    !help.contacts.every(isContact) ||
    !help.docs.every(isDoc)
  ) {
    throw new Error('Datos de ayuda incompletos o con formato incorrecto')
  }

  return {
    version: 1,
    type: 'trip-private',
    tripId: trip.id,
    helpInfo: { cards: help.cards, contacts: help.contacts, docs: help.docs },
  }
}

/** Replaces the private help data of a trip. Keeps the emergency info from public content. */
export async function importTripPrivate(
  db: TripsDatabase,
  json: unknown,
  expectedTripId: string,
  trips: TripMeta[] = TRIPS
): Promise<void> {
  const file = validatePrivateImport(json, expectedTripId, trips)
  await db.transaction('rw', db.helpInfo, async () => {
    const existing = await db.helpInfo.get(file.tripId)
    await db.helpInfo.put({
      tripId: file.tripId,
      emergency: existing?.emergency ?? null,
      ...file.helpInfo,
    })
  })
}
