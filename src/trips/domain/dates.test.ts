import { describe, expect, it } from 'vitest'
import { daysBetween, toLocalIsoDate } from './dates'

describe('test environment', () => {
  it('runs in the America/Lima time zone (UTC-5)', () => {
    expect(new Date('2026-10-18T04:30:00Z').getTimezoneOffset()).toBe(300)
  })
})

describe('toLocalIsoDate', () => {
  it('formats the local calendar date with zero padding', () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5, 9, 0))).toBe('2026-01-05')
  })

  it('uses the device time zone, not UTC, near midnight', () => {
    // 04:30 UTC on 18 Oct is 23:30 on 17 Oct in Lima.
    expect(toLocalIsoDate(new Date('2026-10-18T04:30:00Z'))).toBe('2026-10-17')
  })
})

describe('daysBetween', () => {
  it('counts whole days forward', () => {
    expect(daysBetween('2026-10-10', '2026-10-17')).toBe(7)
  })

  it('crosses month boundaries', () => {
    expect(daysBetween('2026-11-28', '2026-12-01')).toBe(3)
  })

  it('is negative when the target is earlier', () => {
    expect(daysBetween('2026-10-28', '2026-10-26')).toBe(-2)
  })
})
