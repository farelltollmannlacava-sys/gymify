import { describe, it, expect, vi, afterEach } from 'vitest'
import { geocodeAddress } from '../geocode.js'

afterEach(() => vi.restoreAllMocks())

describe('geocodeAddress', () => {
  it('liefert lat/lon/label für ein Ergebnis', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [{ lat: '41.38', lon: '2.17', display_name: 'Barcelona, Spanien' }],
      }))
    )
    const res = await geocodeAddress('Barcelona')
    expect(res).toEqual({ lat: 41.38, lon: 2.17, label: 'Barcelona, Spanien' })
  })

  it('wirft Fehler, wenn nichts gefunden wird', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [] })))
    await expect(geocodeAddress('asdfqwer')).rejects.toThrow(/nichts gefunden|not found/i)
  })

  it('wirft Geocoding-Fehler bei API-Fehlerobjekt', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ error: 'Unable to geocode' }) })))
    await expect(geocodeAddress('xyz')).rejects.toThrow(/Geocoding-Fehler/)
  })

  it('wirft Fehler bei HTTP-Fehlerstatus', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })))
    await expect(geocodeAddress('Berlin')).rejects.toThrow(/500/)
  })
})
