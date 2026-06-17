import Dexie, { type EntityTable } from 'dexie'
import type {
  CountryInfo,
  DailyPlan,
  DocumentItem,
  ItineraryItem,
  PackingItem,
  Place,
  PreTravelSection,
  Recommendation,
  Traveler,
} from '../types'
import { DB_NAME, DB_VERSION, TABLE_SCHEMAS } from './schema'
import { getSeedData } from './seed'

const SEED_FLAG_KEY = 'travel-planner-seeded'

export class TravelPlannerDatabase extends Dexie {
  documents!: EntityTable<DocumentItem, 'id'>
  itineraryItems!: EntityTable<ItineraryItem, 'id'>
  places!: EntityTable<Place, 'id'>
  dailyPlans!: EntityTable<DailyPlan, 'date'>
  recommendations!: EntityTable<Recommendation, 'id'>
  countryInfo!: EntityTable<CountryInfo, 'id'>
  packingItems!: EntityTable<PackingItem, 'id'>
  preTravelSections!: EntityTable<PreTravelSection, 'id'>
  travelers!: EntityTable<Traveler, 'id'>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores(TABLE_SCHEMAS)
  }
}

export const db = new TravelPlannerDatabase()

export function hasBeenSeeded(): boolean {
  try {
    return localStorage.getItem(SEED_FLAG_KEY) === 'true'
  } catch {
    return false
  }
}

export function markSeeded(): void {
  try {
    localStorage.setItem(SEED_FLAG_KEY, 'true')
  } catch {
    // ignore
  }
}

export function clearSeededFlag(): void {
  try {
    localStorage.removeItem(SEED_FLAG_KEY)
  } catch {
    // ignore
  }
}

export async function isDatabaseEmpty(): Promise<boolean> {
  const counts = await Promise.all([
    db.travelers.count(),
    db.itineraryItems.count(),
    db.places.count(),
  ])
  return counts.every((count) => count === 0)
}

export async function seedDatabase(): Promise<void> {
  const seed = getSeedData()

  await db.transaction(
    'rw',
    [
      db.documents,
      db.itineraryItems,
      db.places,
      db.dailyPlans,
      db.recommendations,
      db.countryInfo,
      db.packingItems,
      db.preTravelSections,
      db.travelers,
    ],
    async () => {
      await Promise.all([
        db.documents.bulkAdd(seed.documents),
        db.itineraryItems.bulkAdd(seed.itineraryItems),
        db.places.bulkAdd(seed.places),
        db.dailyPlans.bulkAdd(seed.dailyPlans),
        db.recommendations.bulkAdd(seed.recommendations),
        db.countryInfo.bulkAdd(seed.countryInfo),
        db.packingItems.bulkAdd(seed.packingItems),
        db.preTravelSections.bulkAdd(seed.preTravelSections),
        db.travelers.bulkAdd(seed.travelers),
      ])
    }
  )

  markSeeded()
}

export async function initializeDatabase(): Promise<void> {
  const empty = await isDatabaseEmpty()
  if (empty) {
    await seedDatabase()
  } else if (!hasBeenSeeded()) {
    markSeeded()
  }
}

export async function resetDatabase(): Promise<void> {
  await db.delete()
  await db.open()
  clearSeededFlag()
  await seedDatabase()
}

export async function clearDatabase(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.documents,
      db.itineraryItems,
      db.places,
      db.dailyPlans,
      db.recommendations,
      db.countryInfo,
      db.packingItems,
      db.preTravelSections,
      db.travelers,
    ],
    async () => {
      await Promise.all([
        db.documents.clear(),
        db.itineraryItems.clear(),
        db.places.clear(),
        db.dailyPlans.clear(),
        db.recommendations.clear(),
        db.countryInfo.clear(),
        db.packingItems.clear(),
        db.preTravelSections.clear(),
        db.travelers.clear(),
      ])
    }
  )
  clearSeededFlag()
}

export { DB_NAME, DB_VERSION }
