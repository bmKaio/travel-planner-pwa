import { describe, expect, it } from 'vitest'
import { makeContent } from '../testing/makeContent'
import { setupTestTripsDb } from '../testing/testTripsDb'
import { ensureTripContent } from './ensureContent'
import { syncTripContent } from './seedSync'

const getDb = setupTestTripsDb()

const offline = async (): Promise<never> => {
  throw new Error('Failed to fetch dynamically imported module')
}

describe('ensureTripContent', () => {
  it('syncs new content and reports unchanged afterwards', async () => {
    const load = async () => makeContent()
    expect(await ensureTripContent(getDb(), 'peru-2026', load)).toBe('synced')
    expect(await ensureTripContent(getDb(), 'peru-2026', load)).toBe('unchanged')
  })

  it('falls back to stored content when loading fails (offline, chunk not cached)', async () => {
    await syncTripContent(getDb(), makeContent())
    expect(await ensureTripContent(getDb(), 'peru-2026', offline)).toBe('stale')
  })

  it('rethrows when loading fails and nothing is stored', async () => {
    await expect(ensureTripContent(getDb(), 'peru-2026', offline)).rejects.toThrow(
      'Failed to fetch dynamically imported module'
    )
  })
})
