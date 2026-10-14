import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBrowserStorage, LAST_TRIP_KEY, readLastTripId, writeLastTripId } from './lastTrip'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

const brokenStorage = {
  getItem: (): string | null => {
    throw new Error('SecurityError')
  },
  setItem: (): void => {
    throw new Error('QuotaExceededError')
  },
}

describe('last opened trip', () => {
  it('round-trips the trip id', () => {
    const storage = memoryStorage()
    writeLastTripId(storage, 'peru-2026')
    expect(storage.data.get(LAST_TRIP_KEY)).toBe('peru-2026')
    expect(readLastTripId(storage)).toBe('peru-2026')
  })

  it('returns null when nothing was stored', () => {
    expect(readLastTripId(memoryStorage())).toBeNull()
  })

  it('returns null without storage', () => {
    expect(readLastTripId(null)).toBeNull()
    expect(() => writeLastTripId(null, 'peru-2026')).not.toThrow()
  })

  it('never throws when storage access fails', () => {
    expect(readLastTripId(brokenStorage)).toBeNull()
    expect(() => writeLastTripId(brokenStorage, 'peru-2026')).not.toThrow()
  })
})

describe('getBrowserStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns null when there is no window', () => {
    expect(typeof window).toBe('undefined')
    expect(getBrowserStorage()).toBeNull()
  })

  it('returns window.localStorage when available', () => {
    const localStorage = memoryStorage()
    vi.stubGlobal('window', { localStorage })
    expect(getBrowserStorage()).toBe(localStorage)
  })

  it('returns null when accessing localStorage throws', () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new Error('SecurityError')
      },
    })
    expect(getBrowserStorage()).toBeNull()
  })
})
