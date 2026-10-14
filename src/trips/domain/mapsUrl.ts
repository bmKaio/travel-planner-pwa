import type { Leg, TravelMode } from '../types'

const enc = encodeURIComponent

export function directionsUrl(destination: string, travelMode?: TravelMode): string {
  const mode = travelMode ? `&travelmode=${travelMode}` : ''
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(destination)}${mode}`
}

export function searchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${enc(query)}`
}

/** Route when the leg has both ends, otherwise a search for its place. */
export function legUrl(leg: Leg): string {
  if (leg.from && leg.to) {
    return `https://www.google.com/maps/dir/?api=1&origin=${enc(leg.from)}&destination=${enc(leg.to)}&travelmode=${leg.travel ?? 'driving'}`
  }
  return searchUrl(leg.q ?? leg.title)
}

/** Directions to a plan item, or null when the item is not a place to go. */
export function planItemUrl(item: { q?: string }): string | null {
  const q = item.q?.trim()
  return q ? directionsUrl(q) : null
}
