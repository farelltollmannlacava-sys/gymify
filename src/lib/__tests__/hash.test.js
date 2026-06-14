import { describe, it, expect } from 'vitest'
import { hashString, mulberry32 } from '../hash.js'

describe('hashString', () => {
  it('ist deterministisch', () => {
    expect(hashString('node/123')).toBe(hashString('node/123'))
  })
  it('unterscheidet verschiedene Eingaben', () => {
    expect(hashString('node/123')).not.toBe(hashString('node/124'))
  })
})

describe('mulberry32', () => {
  it('liefert reproduzierbare Folge für gleichen Seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('liefert Werte im Bereich [0,1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 100; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
