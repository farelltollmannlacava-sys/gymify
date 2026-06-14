import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchGyms } from '../gymService.js'

afterEach(() => vi.restoreAllMocks())

const overpassResponse = {
  elements: [
    { type: 'node', id: 1, lat: 52.5, lon: 13.4, tags: { name: 'Node Gym' } },
    { type: 'way', id: 2, center: { lat: 52.6, lon: 13.5 }, tags: { name: 'Way Gym' } },
    { type: 'node', id: 3, lat: 52.7, lon: 13.6, tags: {} }, // kein Name
  ],
}

describe('fetchGyms', () => {
  it('normalisiert nodes und ways zu RawGym mit id "type/id"', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => overpassResponse })))
    const gyms = await fetchGyms({ lat: 52.5, lon: 13.4, radiusM: 5000 })
    expect(gyms[0]).toEqual({
      id: 'node/1',
      name: 'Node Gym',
      lat: 52.5,
      lon: 13.4,
      tags: { name: 'Node Gym' },
    })
    expect(gyms[1].id).toBe('way/2')
    expect(gyms[1].lat).toBe(52.6) // aus center übernommen
  })

  it('gibt namenlosen Gyms einen Fallback-Namen', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => overpassResponse })))
    const gyms = await fetchGyms({ lat: 52.5, lon: 13.4, radiusM: 5000 })
    expect(gyms[2].name).toBe('Fitnessstudio')
  })

  it('filtert Elemente ohne Koordinaten heraus', async () => {
    const resp = {
      elements: [
        { type: 'node', id: 1, lat: 52.5, lon: 13.4, tags: { name: 'OK Gym' } },
        { type: 'way', id: 2, tags: { name: 'Kaputt (kein center)' } }, // keine Koordinaten
      ],
    }
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => resp })))
    const gyms = await fetchGyms({ lat: 52.5, lon: 13.4, radiusM: 5000 })
    expect(gyms).toHaveLength(1)
    expect(gyms[0].id).toBe('node/1')
  })

  it('wirft Fehler bei HTTP-Fehlerstatus', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 502 })))
    await expect(fetchGyms({ lat: 52.5, lon: 13.4, radiusM: 5000 })).rejects.toThrow(/502/)
  })
})
