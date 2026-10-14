import type { TripContent } from '../types'

// Each trip's content is a separate lazy chunk (precached by the service worker).
const loaders: Record<string, () => Promise<TripContent>> = {
  'peru-2026': () => import('./peru-2026').then((module) => module.default),
}

export function hasTripContent(tripId: string): boolean {
  return Object.prototype.hasOwnProperty.call(loaders, tripId)
}

export async function loadTripContent(tripId: string): Promise<TripContent> {
  if (!hasTripContent(tripId)) throw new Error(`No hay contenido para el viaje ${tripId}`)
  return loaders[tripId]()
}
