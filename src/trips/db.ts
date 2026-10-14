import Dexie, { type EntityTable, type Table } from 'dexie'
import type { ChecklistItem, ContentState, GuideEntry, HelpInfo, TripDay, TripNote } from './types'

export const TRIPS_DB_NAME = 'TripsDB'

/**
 * Database of the v2 trip engine. Separate from the legacy TravelPlannerDB (Vietnam),
 * which is never migrated. Every table is keyed by tripId, so new trips need no schema change.
 */
export class TripsDatabase extends Dexie {
  days!: Table<TripDay, [string, string]>
  checklistItems!: EntityTable<ChecklistItem, 'id'>
  notes!: EntityTable<TripNote, 'tripId'>
  helpInfo!: EntityTable<HelpInfo, 'tripId'>
  contentState!: EntityTable<ContentState, 'tripId'>
  guideEntries!: Table<GuideEntry, [string, string]>

  constructor(name: string = TRIPS_DB_NAME) {
    super(name)
    this.version(1).stores({
      days: '[tripId+date], tripId',
      checklistItems: 'id, tripId',
      notes: 'tripId',
      helpInfo: 'tripId',
      contentState: 'tripId',
    })
    // v2: guide entries. Additive; Dexie keeps every v1 table and its data.
    this.version(2).stores({
      guideEntries: '[tripId+key], tripId',
    })
  }
}

export const tripsDb = new TripsDatabase()
