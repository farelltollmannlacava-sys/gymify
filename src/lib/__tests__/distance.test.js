import { describe, it, expect } from 'vitest'
import { haversineKm } from '../distance.js'

describe('haversineKm', () => {
  it('ist 0 für identische Punkte', () => {
    expect(haversineKm(52.52, 13.405, 52.52, 13.405)).toBe(0)
  })

  it('berechnet ~287 km zwischen Berlin und Hamburg', () => {
    const d = haversineKm(52.52, 13.405, 53.55, 9.993)
    expect(d).toBeGreaterThan(250)
    expect(d).toBeLessThan(320)
  })
})
