import { afterEach, beforeEach } from 'vitest'
import { TripsDatabase } from '../db'

/** A TripsDatabase with a unique name, so it never shares state with another test. */
export function createTestTripsDb(): TripsDatabase {
  return new TripsDatabase(`TripsDB-test-${crypto.randomUUID()}`)
}

/**
 * Registers beforeEach/afterEach hooks that give every test a fresh, empty TripsDB and delete it
 * afterwards (fake-indexeddb is global, so this is what keeps tests from leaking state).
 * Call once at the top level of a test file; read the current database with the returned getter.
 */
export function setupTestTripsDb(): () => TripsDatabase {
  let db: TripsDatabase | undefined

  beforeEach(() => {
    db = createTestTripsDb()
  })

  afterEach(async () => {
    await db?.delete()
    db = undefined
  })

  return () => {
    if (!db) throw new Error('setupTestTripsDb: the database is only available inside a test')
    return db
  }
}
