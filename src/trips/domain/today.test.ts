import { describe, expect, it } from 'vitest'
import type { PlanItem } from '../types'
import { computeNow, formatBanner, minutesOf, resolveTodayView } from './today'

const item = (t: string, title: string): PlanItem => ({ t, title, place: title, q: title })
const plan = [item('08:30', 'A'), item('10:00', 'B'), item('13:00', 'C')]

describe('minutesOf', () => {
  it('converts HH:mm to minutes', () => {
    expect(minutesOf('00:00')).toBe(0)
    expect(minutesOf('13:05')).toBe(785)
  })
})

describe('computeNow', () => {
  it('shows the first item as next before the day starts', () => {
    const result = computeNow(plan, minutesOf('07:00'))
    expect(result.label).toBe('Siguiente')
    expect(result.item).toMatchObject({ title: 'A', range: '08:30 – 10:00' })
    expect(result.rest.map((p) => p.title)).toEqual(['B', 'C'])
  })

  it('shows the item in progress as now', () => {
    const result = computeNow(plan, minutesOf('10:15'))
    expect(result.label).toBe('Ahora')
    expect(result.item).toMatchObject({ title: 'B', range: '10:00 – 13:00' })
    expect(result.rest.map((p) => p.title)).toEqual(['C'])
  })

  it('treats the start minute as now and the last item as open-ended', () => {
    const result = computeNow(plan, minutesOf('13:00'))
    expect(result.label).toBe('Ahora')
    expect(result.item).toMatchObject({ title: 'C', range: 'Desde las 13:00' })
    expect(result.rest).toEqual([])
  })

  it('handles an empty plan', () => {
    expect(computeNow([], 600)).toEqual({ label: 'Siguiente', item: null, rest: [] })
  })
})

describe('resolveTodayView', () => {
  const dates = ['2026-10-17', '2026-10-18', '2026-10-19']

  it('selects today with the current minute during the trip', () => {
    expect(resolveTodayView(dates, new Date(2026, 9, 18, 10, 15))).toEqual({
      dayIndex: 1,
      banner: null,
      nowMinutes: 615,
    })
  })

  it('shows day 1 with a countdown before the trip', () => {
    expect(resolveTodayView(dates, new Date(2026, 9, 10, 9, 0))).toEqual({
      dayIndex: 0,
      banner: { kind: 'before', daysLeft: 7 },
      nowMinutes: null,
    })
  })

  it('shows the last day after the trip', () => {
    expect(resolveTodayView(dates, new Date(2026, 9, 30, 9, 0))).toEqual({
      dayIndex: 2,
      banner: { kind: 'after' },
      nowMinutes: null,
    })
  })

  it('shows the previous day without a now marker when today has no entry', () => {
    expect(resolveTodayView(['2026-10-17', '2026-10-19'], new Date(2026, 9, 18, 9, 0))).toEqual({
      dayIndex: 0,
      banner: null,
      nowMinutes: null,
    })
  })

  it('handles a trip without days', () => {
    expect(resolveTodayView([], new Date(2026, 9, 18))).toEqual({
      dayIndex: -1,
      banner: null,
      nowMinutes: null,
    })
  })

  it('uses the local day near midnight in Peru, not the UTC day', () => {
    // 04:30 UTC on 18 Oct = 23:30 on 17 Oct in Lima.
    expect(resolveTodayView(dates, new Date('2026-10-18T04:30:00Z'))).toEqual({
      dayIndex: 0,
      banner: null,
      nowMinutes: 23 * 60 + 30,
    })
  })
})

describe('formatBanner', () => {
  it('formats the countdown and the end of the trip', () => {
    expect(formatBanner({ kind: 'before', daysLeft: 1 })).toBe('Falta 1 día')
    expect(formatBanner({ kind: 'before', daysLeft: 7 })).toBe('Faltan 7 días')
    expect(formatBanner({ kind: 'after' })).toBe('Viaje terminado')
    expect(formatBanner(null)).toBeNull()
  })
})
