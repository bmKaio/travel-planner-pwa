import { describe, expect, it } from 'vitest'
import type { DayCover } from '../types'
import { buildCoverView, visibleCover } from './dayCover'

const cover: DayCover = {
  place: 'Valle del Colca',
  image: '/assets/colca.webp',
  alt: 'Terrazas agrícolas del valle del Colca',
  credit: 'Autora · CC BY-SA 4.0',
  creditUrl: 'https://commons.wikimedia.org/wiki/File:Colca.jpg',
}

describe('buildCoverView', () => {
  it('shows the cover place with the day count and the date', () => {
    expect(buildCoverView(cover, 'Perú', 3, 12, '2026-10-20')).toEqual({
      eyebrow: 'Hoy · Día 4 de 12',
      place: 'Valle del Colca',
      dateLabel: 'mar 20 oct',
      cover,
    })
  })

  it('falls back to the trip name and no photo when the day has no cover', () => {
    expect(buildCoverView(undefined, 'Perú', 0, 12, '2026-10-17')).toEqual({
      eyebrow: 'Hoy · Día 1 de 12',
      place: 'Perú',
      dateLabel: 'sáb 17 oct',
      cover: null,
    })
  })

  it('falls back to the trip name when the cover place is blank', () => {
    const view = buildCoverView({ ...cover, place: '  ' }, 'Perú', 3, 12, '2026-10-20')
    expect(view.place).toBe('Perú')
  })
})

describe('visibleCover', () => {
  const view = buildCoverView(cover, 'Perú', 3, 12, '2026-10-20')

  it('returns the cover while its photo has not failed', () => {
    expect(visibleCover(view, null)).toBe(cover)
  })

  it('drops the cover once its own photo failed to load', () => {
    expect(visibleCover(view, '/assets/colca.webp')).toBeNull()
  })

  it('keeps the cover when a different photo failed earlier (another day)', () => {
    expect(visibleCover(view, '/assets/puno.webp')).toBe(cover)
  })

  it('returns null for a view without a cover', () => {
    expect(visibleCover(buildCoverView(undefined, 'Perú', 0, 12, '2026-10-17'), null)).toBeNull()
  })
})
