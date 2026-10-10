import { describe, expect, it } from 'vitest'
import { directionsUrl, legUrl, searchUrl } from './mapsUrl'

describe('directionsUrl', () => {
  it('builds a directions link to the destination', () => {
    expect(directionsUrl('Plaza de Armas, Cusco')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Plaza%20de%20Armas%2C%20Cusco'
    )
  })

  it('adds the travel mode when given', () => {
    expect(directionsUrl('Machu Picchu', 'walking')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Machu%20Picchu&travelmode=walking'
    )
  })
})

describe('searchUrl', () => {
  it('builds a search link', () => {
    expect(searchUrl('Museo Larco, Lima')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Museo%20Larco%2C%20Lima'
    )
  })
})

describe('legUrl', () => {
  it('builds a route between origin and destination, driving by default', () => {
    expect(
      legUrl({ mode: 'bus', title: 'Arequipa → Chivay', meta: '', from: 'Arequipa', to: 'Chivay' })
    ).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=Arequipa&destination=Chivay&travelmode=driving'
    )
  })

  it('keeps an explicit travel mode', () => {
    expect(
      legUrl({
        mode: 'train',
        title: 'Tren',
        meta: '',
        from: 'Ollantaytambo',
        to: 'Aguas Calientes',
        travel: 'transit',
      })
    ).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=Ollantaytambo&destination=Aguas%20Calientes&travelmode=transit'
    )
  })

  it('searches the query when there is no origin/destination', () => {
    expect(legUrl({ mode: 'plane', title: 'Vuelo', meta: '', q: 'Aeropuerto Jorge Chávez' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=Aeropuerto%20Jorge%20Ch%C3%A1vez'
    )
  })

  it('falls back to the title when there is no query', () => {
    expect(legUrl({ mode: 'walk', title: 'Paseo por Barranco', meta: '' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=Paseo%20por%20Barranco'
    )
  })
})
