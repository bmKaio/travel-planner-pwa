import { describe, expect, it } from 'vitest'
import { GUIDE_TOPIC_STYLE } from './guideTopicStyle'
import {
  COVER_FALLBACK,
  NAV_STYLE,
  SECTION_STYLE,
  tripStripe,
  type NavKey,
  type SectionKey,
} from './sectionStyle'
import {
  contrastRatio,
  readTripTokens,
  tailwindDefinesTripColour,
  type ThemeMode,
} from '../testing/tripTokens'

// The spec's colour map (§2): the token each section takes. Pinning it here means a section
// added or recoloured in the code must also change the spec table.
const SECTION_TOKEN: Record<SectionKey, string> = {
  plan: 'topic-city',
  eat: 'topic-food',
  see: 'topic-history',
  leg: 'topic-tip',
  stay: 'topic-drink',
  emergency: 'urgent',
  consular: 'topic-tip',
  health: 'topic-food',
  private: 'topic-drink',
  checklist: 'done',
  notes: 'topic-history',
}

// Spec §2 "Nav": colour of the active item.
const NAV_TOKEN: Record<NavKey, string> = {
  today: 'action',
  itinerary: 'topic-city',
  guide: 'topic-curiosity',
  help: 'urgent',
}

const MODES: ThemeMode[] = ['light', 'dark']
const sectionKeys = Object.keys(SECTION_TOKEN) as SectionKey[]
const navKeys = Object.keys(NAV_TOKEN) as NavKey[]
const palette = { light: readTripTokens('light'), dark: readTripTokens('dark') }
const strongTokens = [...new Set([...Object.values(SECTION_TOKEN), ...Object.values(NAV_TOKEN)])]
const softTokens = [...new Set(Object.values(SECTION_TOKEN))].map((token) => `${token}-soft`)

describe('SECTION_STYLE', () => {
  it('covers exactly the sections of the spec table', () => {
    expect(Object.keys(SECTION_STYLE).sort()).toEqual([...sectionKeys].sort())
    expect(sectionKeys).toHaveLength(11)
  })

  it.each(sectionKeys)('%s takes the colour fixed by the spec, with literal classes', (key) => {
    const token = SECTION_TOKEN[key]
    const style = SECTION_STYLE[key]
    expect(style.ink).toBe(`text-trip-${token}`)
    expect(style.soft).toBe(`bg-trip-${token}-soft`)
    expect(style.edge).toBe(`border-l-trip-${token}`)
    expect(style.stripe).toBe(`border-t-trip-${token}`)
    expect(style.icon).toBeDefined()
  })
})

describe('NAV_STYLE', () => {
  it('has exactly the four nav items of the spec', () => {
    expect(Object.keys(NAV_STYLE).sort()).toEqual([...navKeys].sort())
  })

  it.each(navKeys)('%s colours its top bar and icon with the spec token', (key) => {
    expect(NAV_STYLE[key].bar).toBe(`before:bg-trip-${NAV_TOKEN[key]}`)
    expect(NAV_STYLE[key].ink).toBe(`text-trip-${NAV_TOKEN[key]}`)
  })
})

describe('palette', () => {
  it.each(MODES)('%s mode defines every strong and soft colour the maps use', (mode) => {
    for (const token of [...strongTokens, ...softTokens]) {
      expect(palette[mode][token], `${mode} --trip-${token}`).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('registers every strong and soft colour with Tailwind', () => {
    for (const token of [...strongTokens, ...softTokens]) {
      expect(tailwindDefinesTripColour(token), `tailwind.config.js ${token}`).toBe(true)
    }
  })

  it.each(MODES)(
    '%s mode: each strong tone reaches 3:1 on its soft tone and on the card',
    (mode) => {
      const colours = palette[mode]
      for (const key of sectionKeys) {
        const token = SECTION_TOKEN[key]
        expect(
          contrastRatio(colours[token], colours[`${token}-soft`]),
          `${key} on soft`
        ).toBeGreaterThanOrEqual(3)
        expect(
          contrastRatio(colours[token], colours.card),
          `${key} on card`
        ).toBeGreaterThanOrEqual(3)
      }
    }
  )

  it.each(MODES)('%s mode: the active nav tones reach 3:1 on the nav card', (mode) => {
    const colours = palette[mode]
    for (const key of navKeys) {
      const token = NAV_TOKEN[key]
      expect(contrastRatio(colours[token], colours.card), `${key} on card`).toBeGreaterThanOrEqual(
        3
      )
    }
  })
})

describe('tripStripe', () => {
  const count = Object.keys(GUIDE_TOPIC_STYLE).length

  it('follows the guide topic order, one stripe per trip', () => {
    expect(tripStripe(0)).toBe(GUIDE_TOPIC_STYLE.history.stripe)
    expect(tripStripe(1)).toBe(GUIDE_TOPIC_STYLE.city.stripe)
  })

  it('cycles when there are more trips than topic colours', () => {
    expect(tripStripe(count)).toBe(tripStripe(0))
    expect(tripStripe(count + 1)).toBe(tripStripe(1))
  })

  it('never returns undefined, even for a trip missing from the registry (index -1)', () => {
    expect(tripStripe(-1)).toBe(GUIDE_TOPIC_STYLE.tip.stripe)
  })
})

describe('COVER_FALLBACK', () => {
  const surfaceToken = COVER_FALLBACK.surface.replace('bg-trip-', '')
  const textToken = COVER_FALLBACK.text.replace('text-trip-', '')

  it('is the turquoise section tone', () => {
    expect(surfaceToken).toBe(SECTION_TOKEN.plan)
  })

  it.each(MODES)('%s mode: its text reaches 4.5:1 on its surface', (mode) => {
    const colours = palette[mode]
    expect(colours[textToken], `${mode} --trip-${textToken}`).toBeDefined()
    expect(contrastRatio(colours[textToken], colours[surfaceToken])).toBeGreaterThanOrEqual(4.5)
  })
})
