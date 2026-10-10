import { describe, expect, it } from 'vitest'
import {
  daysBetween,
  formatDateRange,
  formatDayHeading,
  formatDayLabel,
  toLocalIsoDate,
  weekdayShort,
} from './dates'

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

describe('day labels', () => {
  it('formats a short Spanish day label', () => {
    expect(formatDayLabel('2026-10-17')).toBe('sáb 17 oct')
    expect(formatDayLabel('2026-12-01')).toBe('mar 1 dic')
  })

  it('returns the short weekday', () => {
    expect(weekdayShort('2026-10-18')).toBe('dom')
  })

  it('formats the day heading', () => {
    expect(formatDayHeading(7, 12, '2026-10-24')).toBe('Día 8 de 12 · sáb 24 oct')
  })
})

describe('formatDateRange', () => {
  it('collapses a range inside one month', () => {
    expect(formatDateRange('2026-10-17', '2026-10-28')).toBe('17–28 oct 2026')
  })

  it('shows both months inside one year', () => {
    expect(formatDateRange('2026-11-28', '2026-12-03')).toBe('28 nov – 3 dic 2026')
  })

  it('shows both years across New Year', () => {
    expect(formatDateRange('2026-12-28', '2027-01-03')).toBe('28 dic 2026 – 3 ene 2027')
  })

  it('shows a single day once', () => {
    expect(formatDateRange('2026-10-17', '2026-10-17')).toBe('17 oct 2026')
  })
})
