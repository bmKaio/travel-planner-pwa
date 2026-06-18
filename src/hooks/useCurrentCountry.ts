import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import type { CountryCode, ItineraryItem } from '../types'
import { CITY_COUNTRY_MAP, determineDayLocation } from '../utils/dailyPlan'

export interface CountryGreeting {
  country: CountryCode | null
  title: string
  subtitle: string
}

const GREETING_STRINGS: Record<CountryCode, CountryGreeting> = {
  vietnam: {
    country: 'vietnam',
    title: 'Xin chào',
    subtitle: 'Bienvenido a Vietnam',
  },
  cambodia: {
    country: 'cambodia',
    title: 'សួស្តី',
    subtitle: 'Bienvenido a Camboya',
  },
}

const FALLBACK_GREETING: CountryGreeting = {
  country: null,
  title: 'Hola',
  subtitle: '',
}

function findItemsForDate(items: ItineraryItem[], date: string): ItineraryItem[] {
  return items.filter((item) => item.date === date)
}

function findNearestItem(items: ItineraryItem[], date: string): ItineraryItem | null {
  if (items.length === 0) return null

  const target = parseISO(date)
  const targetTime = target.getTime()

  let nearest: ItineraryItem | null = null
  let nearestDiff = Infinity

  for (const item of items) {
    const itemTime = parseISO(item.date).getTime()
    const diff = Math.abs(itemTime - targetTime)
    if (diff < nearestDiff) {
      nearestDiff = diff
      nearest = item
    }
  }

  return nearest
}

function detectCountry(items: ItineraryItem[]): CountryCode | null {
  const city = determineDayLocation(items)
  if (!city) return null
  return CITY_COUNTRY_MAP[city] ?? null
}

export function useCurrentCountry(items: ItineraryItem[]): CountryGreeting {
  const today = format(new Date(), 'yyyy-MM-dd')

  return useMemo(() => {
    const todayItems = findItemsForDate(items, today)
    const nearestItem = todayItems.length > 0 ? null : findNearestItem(items, today)
    const itemsToUse = todayItems.length > 0 ? todayItems : nearestItem ? [nearestItem] : []

    const country = detectCountry(itemsToUse)

    if (!country) return FALLBACK_GREETING
    return GREETING_STRINGS[country]
  }, [items, today])
}

export default useCurrentCountry
