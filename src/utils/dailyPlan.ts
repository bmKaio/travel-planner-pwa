import type { CountryCode, ItineraryItem, Place, Recommendation } from '../types'

export const CITY_KEYWORDS: Record<string, string[]> = {
  Hanoi: [
    'hanoi',
    'hanói',
    'old quarter',
    'hoan kiem',
    'temple of literature',
    'ho chi minh mausoleum',
    'one pillar pagoda',
    'giang café',
    'dong xuan',
  ],
  'Pu Luong': ['pu luong', 'pu-luong', 'hieu waterfall', 'ban hieu', 'ban don', 'thai and muong'],
  'Ninh Binh': ['ninh binh', 'ninh-binh', 'tam coc', 'trang an', 'hang mua', 'bich dong'],
  'Cat Ba': ['cat ba', 'cat-ba', 'lan ha bay', 'beo dock', 'viet hai', 'cat co'],
  Hue: [
    'hue',
    'imperial city',
    'perfume river',
    'tomb of khai dinh',
    'tomb of tu duc',
    'thien mu',
    'bun bo hue',
  ],
  'Hoi An': ['hoi an', 'hoi-an', 'ancient town', 'japanese covered bridge', 'an bang', 'tra que'],
  'Da Nang': ['da nang', 'da-nang', 'marble mountains'],
  'Siem Reap': [
    'siem reap',
    'siem-reap',
    'angkor',
    'srah srang',
    'banteay srei',
    'kbal spean',
    'banteay samre',
  ],
  'Phnom Penh': ['phnom penh', 'phnom-penh', 'kampong phluk'],
}

export const CITY_COUNTRY_MAP: Record<string, CountryCode> = {
  Hanoi: 'vietnam',
  'Pu Luong': 'vietnam',
  'Ninh Binh': 'vietnam',
  'Cat Ba': 'vietnam',
  Hue: 'vietnam',
  'Hoi An': 'vietnam',
  'Da Nang': 'vietnam',
  'Siem Reap': 'cambodia',
  'Phnom Penh': 'cambodia',
}

export function determineDayLocation(items: ItineraryItem[]): string | null {
  if (items.length === 0) return null

  const scores = new Map<string, number>()

  for (const item of items) {
    const text = [
      item.title,
      item.description,
      item.location?.name,
      item.notes,
      item.tags?.join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    for (const [city, keywords] of Object.entries(CITY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          scores.set(city, (scores.get(city) ?? 0) + 1)
        }
      }
    }
  }

  if (scores.size === 0) return null

  return Array.from(scores.entries()).sort((a, b) => b[1] - a[1])[0][0]
}

export function getPlacesForLocation(places: Place[], location: string | null): Place[] {
  if (!location) return []

  const keywords = CITY_KEYWORDS[location] ?? [location.toLowerCase()]

  return places.filter((place) => {
    const text = `${place.name} ${place.location.name}`.toLowerCase()
    return keywords.some((keyword) => text.includes(keyword.toLowerCase()))
  })
}

export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'unknown'

export function getPeriodFromTime(time?: string): DayPeriod {
  if (!time) return 'unknown'
  const hour = Number(time.split(':')[0])
  if (Number.isNaN(hour)) return 'unknown'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export function groupItemsByPeriod(items: ItineraryItem[]): Record<DayPeriod, ItineraryItem[]> {
  const groups: Record<DayPeriod, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    unknown: [],
  }

  for (const item of items) {
    groups[getPeriodFromTime(item.startTime)].push(item)
  }

  return groups
}

export function groupPlacesByPeriod(
  places: Place[],
  items: ItineraryItem[]
): Record<DayPeriod, Place[]> {
  const groups: Record<DayPeriod, Place[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    unknown: [],
  }

  const placeTimeMap = new Map<string, DayPeriod>()

  for (const item of items) {
    if (!item.location?.name) continue
    const period = getPeriodFromTime(item.startTime)
    placeTimeMap.set(item.location.name.toLowerCase(), period)
  }

  for (const place of places) {
    const key = place.name.toLowerCase()
    const period = placeTimeMap.get(key) ?? 'unknown'
    groups[period].push(place)
  }

  return groups
}

export function findPlaceForRecommendation(
  recommendation: Recommendation,
  places: Place[]
): Place | undefined {
  if (!recommendation.location?.name) return undefined

  const target = recommendation.location.name.toLowerCase()
  return places.find((place) => place.name.toLowerCase().includes(target))
}
