import type { Place } from '../types'

/**
 * Trip stops (cities) in itinerary order. Places have no explicit city field,
 * so each place is assigned to the nearest city center by its coordinates.
 */
export type CityId = 'hanoi' | 'pu-luong' | 'ninh-binh' | 'cat-ba' | 'hue' | 'hoi-an' | 'siem-reap'

export interface City {
  id: CityId
  name: string
  center: { lat: number; lng: number }
}

/** Bucket for places without coordinates (e.g. user-added without lat/lng). */
export const OTHER_CITY_ID = 'other' as const

export type CityGroupId = CityId | typeof OTHER_CITY_ID

export interface CityGroup {
  id: CityGroupId
  name: string
  places: Place[]
}

export const CITIES: City[] = [
  { id: 'hanoi', name: 'Hanoi', center: { lat: 21.0341, lng: 105.8494 } },
  { id: 'pu-luong', name: 'Pu Luong', center: { lat: 20.45, lng: 105.2 } },
  { id: 'ninh-binh', name: 'Ninh Binh', center: { lat: 20.2546, lng: 105.9234 } },
  { id: 'cat-ba', name: 'Cat Ba', center: { lat: 20.7275, lng: 107.075 } },
  { id: 'hue', name: 'Hue', center: { lat: 16.4697, lng: 107.5778 } },
  { id: 'hoi-an', name: 'Hoi An', center: { lat: 15.8801, lng: 108.338 } },
  { id: 'siem-reap', name: 'Siem Reap', center: { lat: 13.45, lng: 103.89 } },
]

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Great-circle distance in kilometers between two coordinates. */
export function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRadians(bLat - aLat)
  const dLng = toRadians(bLng - aLng)
  const lat1 = toRadians(aLat)
  const lat2 = toRadians(bLat)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Nearest city to a place, or null when the place has no coordinates. */
export function nearestCityId(place: Place): CityId | null {
  const { lat, lng } = place.location
  if (lat === undefined || lng === undefined) return null

  let closest: CityId | null = null
  let minDistance = Infinity
  for (const city of CITIES) {
    const distance = haversine(lat, lng, city.center.lat, city.center.lng)
    if (distance < minDistance) {
      minDistance = distance
      closest = city.id
    }
  }
  return closest
}

/**
 * Group places by nearest city, returning all 7 cities in itinerary order
 * (even when empty) plus an "Otros" bucket only when placeless places exist.
 */
export function groupPlacesByCity(places: Place[]): CityGroup[] {
  const byCity = new Map<CityId, Place[]>(CITIES.map((city) => [city.id, []]))
  const other: Place[] = []

  for (const place of places) {
    const cityId = nearestCityId(place)
    if (cityId) {
      byCity.get(cityId)!.push(place)
    } else {
      other.push(place)
    }
  }

  const groups: CityGroup[] = CITIES.map((city) => ({
    id: city.id,
    name: city.name,
    places: byCity.get(city.id)!,
  }))

  if (other.length > 0) {
    groups.push({ id: OTHER_CITY_ID, name: 'Otros', places: other })
  }

  return groups
}
