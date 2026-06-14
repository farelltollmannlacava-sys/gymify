import { describe, it, expect } from 'vitest'
import { matchGyms } from '../match.js'

const origin = { lat: 52.5, lon: 13.4 }
const gymA = { id: 'a', name: 'A', lat: 52.5, lon: 13.4, features: ['Sauna', 'Kurse'] }
const gymB = { id: 'b', name: 'B', lat: 52.6, lon: 13.4, features: ['Crossfit'] }

describe('matchGyms', () => {
  it('ergänzt distanceKm relativ zum Ursprung', () => {
    const res = matchGyms([gymA], { selectedFeatures: [], freetext: '', origin })
    expect(res[0].distanceKm).toBe(0)
  })

  it('sortiert höhere Passung nach oben', () => {
    const res = matchGyms([gymB, gymA], {
      selectedFeatures: ['Sauna', 'Kurse'],
      freetext: '',
      origin,
    })
    expect(res[0].id).toBe('a') // erfüllt 2 Wünsche
    expect(res[0].matchedFeatures).toEqual(expect.arrayContaining(['Sauna', 'Kurse']))
    expect(res[0].matchScore).toBe(2)
  })

  it('berücksichtigt Freitext zusätzlich zu Tags', () => {
    const res = matchGyms([gymB], {
      selectedFeatures: [],
      freetext: 'crossfit',
      origin,
    })
    expect(res[0].matchedFeatures).toContain('Crossfit')
  })

  it('sortiert bei Gleichstand nach Entfernung', () => {
    const res = matchGyms([gymB, gymA], { selectedFeatures: [], freetext: '', origin })
    expect(res[0].id).toBe('a') // gleiche Passung (0), aber näher
  })
})
