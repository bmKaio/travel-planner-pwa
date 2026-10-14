import { describe, expect, it } from 'vitest'
import type { GuideCategory, GuideEntry } from '../types'
import {
  GUIDE_SECTIONS,
  formatReadingCount,
  groupGuide,
  guideBackTarget,
  guideCategoryLabel,
  guideDayLinks,
  guideForDay,
  guideForHelp,
  guideTopicEntries,
  guideTopics,
  isGuideCategory,
  readFromDay,
  sourceLabel,
} from './guide'

let order = 0
function entry(key: string, category: GuideCategory, dates?: string[]): GuideEntry {
  return {
    tripId: 'peru-2026',
    order: order++,
    key,
    category,
    title: key,
    summary: `${key} summary`,
    body: [`${key} body`],
    dates,
    sources: ['https://example.org'],
  }
}

const keys = (entries: GuideEntry[]) => entries.map((e) => e.key)

describe('GUIDE_SECTIONS', () => {
  it('lists every category once, in reading order', () => {
    expect(GUIDE_SECTIONS.map((s) => s.label)).toEqual([
      'Historia',
      'Ciudades',
      'Gastronomía',
      'Bebidas',
      'Curiosidades',
      'Consejos',
    ])
  })

  it('labels a category', () => {
    expect(guideCategoryLabel('food')).toBe('Gastronomía')
  })
})

describe('groupGuide', () => {
  it('returns sections in fixed order and drops empty ones', () => {
    const sections = groupGuide([
      entry('pisco', 'drink'),
      entry('incas', 'history'),
      entry('ceviche', 'food'),
    ])
    expect(sections.map((s) => s.category)).toEqual(['history', 'food', 'drink'])
  })

  it('keeps authored order within a non-city section', () => {
    const sections = groupGuide([entry('lomo', 'food'), entry('ceviche', 'food')])
    expect(keys(sections[0].entries)).toEqual(['lomo', 'ceviche'])
  })

  it('sorts cities by their earliest date and puts undated cities last in authored order', () => {
    const sections = groupGuide([
      entry('cusco', 'city', ['2026-10-24', '2026-10-23']),
      entry('peru-andino', 'city'),
      entry('lima', 'city', ['2026-10-18']),
      entry('selva', 'city'),
      entry('arequipa', 'city', ['2026-10-19']),
    ])
    expect(keys(sections[0].entries)).toEqual(['lima', 'arequipa', 'cusco', 'peru-andino', 'selva'])
  })

  it('returns no sections for no entries', () => {
    expect(groupGuide([])).toEqual([])
  })
})

describe('guideForDay', () => {
  const all = [
    entry('pisco', 'drink', ['2026-10-18']),
    entry('lima', 'city', ['2026-10-18', '2026-10-19']),
    entry('incas', 'history'),
    entry('uros', 'curiosity', ['2026-10-22']),
  ]

  it('returns the entries dated on that day, in section order', () => {
    expect(keys(guideForDay(all, '2026-10-18'))).toEqual(['lima', 'pisco'])
  })

  it('returns nothing for a day without entries', () => {
    expect(guideForDay(all, '2026-10-28')).toEqual([])
  })
})

describe('guideForHelp', () => {
  it('keeps only the entries marked for Ayuda, in authored order', () => {
    const health = { ...entry('health', 'tip'), inHelp: true }
    const altitude = { ...entry('altitude', 'tip'), inHelp: true }
    const entries = [entry('ceviche', 'food'), health, entry('chifa', 'tip'), altitude]
    expect(keys(guideForHelp(entries))).toEqual(['health', 'altitude'])
  })

  it('returns nothing when no entry is marked', () => {
    expect(guideForHelp([entry('ceviche', 'food')])).toEqual([])
  })
})

describe('guideDayLinks', () => {
  const days = [
    { date: '2026-10-21', title: 'Cañón del Colca → Puno' },
    { date: '2026-10-22', title: 'Lago Titicaca: Uros y Taquile' },
  ]

  it('labels each trip day with its date and title, in trip order', () => {
    expect(guideDayLinks(['2026-10-22', '2026-10-21'], days)).toEqual([
      { date: '2026-10-21', label: 'mié 21 oct · Cañón del Colca → Puno' },
      { date: '2026-10-22', label: 'jue 22 oct · Lago Titicaca: Uros y Taquile' },
    ])
  })

  it('skips dates that are not trip days and handles no dates', () => {
    expect(guideDayLinks(['2026-12-01'], days)).toEqual([])
    expect(guideDayLinks(undefined, days)).toEqual([])
  })
})

describe('sourceLabel', () => {
  it('shows the host without www', () => {
    expect(sourceLabel('https://www.peru.travel/es/gastronomia')).toBe('peru.travel')
  })

  it('falls back to the raw text when it is not a URL', () => {
    expect(sourceLabel('no es una url')).toBe('no es una url')
  })
})

describe('guideTopics', () => {
  it('returns non-empty topics in reading order with their entry count', () => {
    const topics = guideTopics([
      entry('pisco', 'drink'),
      entry('incas', 'history'),
      entry('chicha', 'drink'),
    ])
    expect(topics).toEqual([
      { category: 'history', label: 'Historia', count: 1 },
      { category: 'drink', label: 'Bebidas', count: 2 },
    ])
  })

  it('returns no topics for no entries', () => {
    expect(guideTopics([])).toEqual([])
  })
})

describe('isGuideCategory', () => {
  it('accepts every known category', () => {
    for (const { category } of GUIDE_SECTIONS) expect(isGuideCategory(category)).toBe(true)
  })

  it('rejects unknown ids, other casing, prototype keys, empty and undefined', () => {
    expect(isGuideCategory('places')).toBe(false)
    expect(isGuideCategory('Food')).toBe(false)
    expect(isGuideCategory('constructor')).toBe(false)
    expect(isGuideCategory('')).toBe(false)
    expect(isGuideCategory(undefined)).toBe(false)
  })
})

describe('guideTopicEntries', () => {
  it('returns only the entries of the topic, in authored order', () => {
    const entries = [entry('lomo', 'food'), entry('pisco', 'drink'), entry('ceviche', 'food')]
    expect(keys(guideTopicEntries(entries, 'food'))).toEqual(['lomo', 'ceviche'])
  })

  it('keeps cities in route order', () => {
    const entries = [
      entry('cusco', 'city', ['2026-10-23']),
      entry('selva', 'city'),
      entry('lima', 'city', ['2026-10-18']),
    ]
    expect(keys(guideTopicEntries(entries, 'city'))).toEqual(['lima', 'cusco', 'selva'])
  })

  it('returns an empty list for a topic without entries', () => {
    expect(guideTopicEntries([entry('lomo', 'food')], 'tip')).toEqual([])
  })
})

describe('formatReadingCount', () => {
  it('uses the singular for one entry', () => {
    expect(formatReadingCount(1)).toBe('1 lectura')
  })

  it('uses the plural otherwise', () => {
    expect(formatReadingCount(14)).toBe('14 lecturas')
    expect(formatReadingCount(0)).toBe('0 lecturas')
  })
})

describe('readFromDay', () => {
  it('reads an ISO date from router state', () => {
    expect(readFromDay({ fromDay: '2026-10-22' })).toBe('2026-10-22')
  })

  it('ignores missing, malformed or non-object state', () => {
    expect(readFromDay(undefined)).toBeUndefined()
    expect(readFromDay(null)).toBeUndefined()
    expect(readFromDay('2026-10-22')).toBeUndefined()
    expect(readFromDay({})).toBeUndefined()
    expect(readFromDay({ fromDay: 22 })).toBeUndefined()
    expect(readFromDay({ fromDay: '22/10/2026' })).toBeUndefined()
  })
})

describe('guideBackTarget', () => {
  const dayDates = ['2026-10-21', '2026-10-22']

  it('goes back to the day the entry was opened from', () => {
    expect(guideBackTarget('food', '2026-10-22', dayDates)).toEqual({
      path: 'itinerary/2026-10-22',
      label: 'Volver al día',
    })
  })

  it('goes back to the topic when there is no day', () => {
    expect(guideBackTarget('food', undefined, dayDates)).toEqual({
      path: 'guide/topic/food',
      label: 'Gastronomía',
    })
  })

  it('goes back to the topic when the day is not part of this trip', () => {
    expect(guideBackTarget('city', '2030-01-01', dayDates)).toEqual({
      path: 'guide/topic/city',
      label: 'Ciudades',
    })
  })
})
