import { describe, expect, it } from 'vitest'
import { contrastRatio, readTripTokens, tailwindDefinesTripColour } from './tripTokens'

describe('contrastRatio', () => {
  it('is 21 for black on white, in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
  })

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#1b7543', '#1b7543')).toBeCloseTo(1, 5)
  })

  it('matches the WCAG reference value for #767676 on white (4.54)', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 1)
  })
})

describe('readTripTokens', () => {
  const css = `
    .trip-app {
      --trip-card: #ffffff;
      --trip-topic-city: #0f766e;
      --not-trip: #123456;
    }

    .dark .trip-app {
      --trip-card: #1a1d21;
    }
  `

  it('reads the light block without the prefix, ignoring other variables', () => {
    expect(readTripTokens('light', css)).toEqual({ card: '#ffffff', 'topic-city': '#0f766e' })
  })

  it('reads the dark block', () => {
    expect(readTripTokens('dark', css)).toEqual({ card: '#1a1d21' })
  })

  it('throws when the block is missing', () => {
    expect(() => readTripTokens('dark', '.trip-app { --trip-card: #ffffff; }')).toThrow(
      'No .trip-app block'
    )
  })

  it('reads the real palette, which defines the card colour in both modes', () => {
    expect(readTripTokens('light').card).toBe('#ffffff')
    expect(readTripTokens('dark').card).toBe('#1a1d21')
  })
})

describe('tailwindDefinesTripColour', () => {
  const config = `
    colors: {
      done: 'var(--trip-done)',
      'done-ink': 'var(--trip-done-ink)',
      'topic-city': 'var(--trip-topic-city)',
    }
  `

  it('finds quoted and unquoted keys', () => {
    expect(tailwindDefinesTripColour('done', config)).toBe(true)
    expect(tailwindDefinesTripColour('topic-city', config)).toBe(true)
  })

  it('does not mistake a longer key for the token', () => {
    expect(tailwindDefinesTripColour('done-soft', config)).toBe(false)
    expect(tailwindDefinesTripColour('city', config)).toBe(false)
  })
})
