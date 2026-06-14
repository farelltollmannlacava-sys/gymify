import { describe, it, expect } from 'vitest'
import { enrichGym } from '../enrich.js'
import { FEATURES } from '../features.js'

const raw = { id: 'node/123', name: 'Test Gym', lat: 52.5, lon: 13.4, tags: {} }

describe('enrichGym', () => {
  it('ist deterministisch (gleiche ID -> gleiche Werte)', () => {
    const a = enrichGym(raw)
    const b = enrichGym({ ...raw })
    expect(a).toEqual(b)
  })

  it('liefert plausiblen Preis (15–60 €)', () => {
    const g = enrichGym(raw)
    expect(g.price).toBeGreaterThanOrEqual(15)
    expect(g.price).toBeLessThanOrEqual(60)
  })

  it('liefert Bewertung zwischen 3.5 und 5.0', () => {
    const g = enrichGym(raw)
    expect(g.rating).toBeGreaterThanOrEqual(3.5)
    expect(g.rating).toBeLessThanOrEqual(5.0)
  })

  it('liefert mindestens ein Foto und gültige Merkmale', () => {
    const g = enrichGym(raw)
    expect(g.photos.length).toBeGreaterThanOrEqual(1)
    expect(g.features.length).toBeGreaterThanOrEqual(1)
    g.features.forEach((f) => expect(FEATURES).toContain(f))
  })

  it('behält Basisfelder bei', () => {
    const g = enrichGym(raw)
    expect(g.id).toBe('node/123')
    expect(g.name).toBe('Test Gym')
    expect(g.lat).toBe(52.5)
  })

  it('crasht nicht bei fehlender id und bleibt deterministisch', () => {
    const noId = { name: 'Ohne ID', lat: 52.5, lon: 13.4, tags: {} }
    const a = enrichGym({ ...noId })
    const b = enrichGym({ ...noId })
    expect(a).toEqual(b)
    expect(a.price).toBeGreaterThanOrEqual(15)
  })

  it('liefert Bewertungen ohne doppelte Autoren', () => {
    const g = enrichGym({ id: 'node/999', name: 'G', lat: 1, lon: 2, tags: {} })
    const authors = g.reviews.map((r) => r.author)
    expect(new Set(authors).size).toBe(authors.length)
  })
})
