import { describe, it, expect } from 'vitest'
import { FEATURES, parseFreetext } from '../features.js'

describe('FEATURES', () => {
  it('enthält die erwarteten Merkmale', () => {
    expect(FEATURES).toContain('Sauna')
    expect(FEATURES).toContain('Crossfit')
    expect(FEATURES).toContain('24/7 geöffnet')
  })
})

describe('parseFreetext', () => {
  it('erkennt Merkmale unabhängig von Groß-/Kleinschreibung', () => {
    expect(parseFreetext('crossfit mit SAUNA')).toEqual(
      expect.arrayContaining(['Crossfit', 'Sauna'])
    )
  })
  it('erkennt Synonyme (24h -> 24/7 geöffnet)', () => {
    expect(parseFreetext('24h geöffnet')).toContain('24/7 geöffnet')
  })
  it('liefert leeres Array bei keinem Treffer', () => {
    expect(parseFreetext('blabla irgendwas')).toEqual([])
  })
  it('liefert keine Duplikate', () => {
    const res = parseFreetext('sauna sauna sauna')
    expect(res.filter((f) => f === 'Sauna')).toHaveLength(1)
  })
})
