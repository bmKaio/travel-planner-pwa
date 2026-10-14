import type { ContentDay, TripContent } from '../types'

export function makeDay(date: string, title = `Día ${date}`): ContentDay {
  return { date, title, cities: ['Lima'], stay: null, legs: [], plan: [], eat: [], see: [] }
}

export function makeContent(overrides: Partial<TripContent> = {}): TripContent {
  return {
    tripId: 'peru-2026',
    seedVersion: 1,
    emergency: { label: 'Emergencias en Perú', number: '105', description: 'Policía' },
    days: [makeDay('2026-10-17'), makeDay('2026-10-18')],
    checklist: [
      { key: 'g1', group: 'shared', label: 'Contratar el seguro', order: 1 },
      { key: 'p1', group: 'private', label: 'Pasaporte', order: 2 },
    ],
    ...overrides,
  }
}
