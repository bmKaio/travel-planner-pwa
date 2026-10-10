import { describe, expect, it } from 'vitest'
import {
  buildDayStrip,
  parseItineraryTab,
  resolveSelectedDate,
  tabId,
  tabPanelId,
} from './itinerary'

describe('parseItineraryTab', () => {
  it('accepts the known tabs and defaults to plan', () => {
    expect(parseItineraryTab('eat')).toBe('eat')
    expect(parseItineraryTab('see')).toBe('see')
    expect(parseItineraryTab('plan')).toBe('plan')
    expect(parseItineraryTab(null)).toBe('plan')
    expect(parseItineraryTab('comer')).toBe('plan')
  })
})

describe('buildDayStrip', () => {
  it('builds labelled pills, marking today and the selected day', () => {
    const strip = buildDayStrip(['2026-10-17', '2026-10-18'], '2026-10-18', '2026-10-17')
    expect(strip).toEqual([
      {
        date: '2026-10-17',
        weekday: 'sáb',
        dayOfMonth: '17',
        isToday: true,
        isSelected: false,
        ariaLabel: 'Día 1, sáb 17 oct, hoy',
      },
      {
        date: '2026-10-18',
        weekday: 'dom',
        dayOfMonth: '18',
        isToday: false,
        isSelected: true,
        ariaLabel: 'Día 2, dom 18 oct',
      },
    ])
  })

  it('drops the leading zero of the day of month', () => {
    expect(buildDayStrip(['2026-11-03'], '2026-11-03', '2026-10-10')[0].dayOfMonth).toBe('3')
  })
})

describe('resolveSelectedDate', () => {
  const dates = ['2026-10-17', '2026-10-18', '2026-10-19']

  it('uses a requested date that exists', () => {
    expect(resolveSelectedDate(dates, '2026-10-18', 0)).toBe('2026-10-18')
  })

  it('returns null for a requested date outside the trip', () => {
    expect(resolveSelectedDate(dates, '2026-12-01', 0)).toBeNull()
  })

  it('falls back to the today index, clamped to the trip', () => {
    expect(resolveSelectedDate(dates, undefined, 2)).toBe('2026-10-19')
    expect(resolveSelectedDate(dates, undefined, -1)).toBe('2026-10-17')
    expect(resolveSelectedDate(dates, undefined, 9)).toBe('2026-10-19')
  })

  it('returns null for a trip without days', () => {
    expect(resolveSelectedDate([], undefined, 0)).toBeNull()
  })
})

describe('tab ids', () => {
  it('derives distinct tab and panel ids from the tab', () => {
    expect(tabId('eat')).toBe('itinerary-tab-eat')
    expect(tabPanelId('eat')).toBe('itinerary-panel-eat')
  })
})
