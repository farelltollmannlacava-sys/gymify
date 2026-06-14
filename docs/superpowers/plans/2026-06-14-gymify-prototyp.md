# Gymify-Prototyp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein kostenloser, vorzeigbarer Web-Prototyp, der zu einer eingegebenen Adresse echte Gyms in der Nähe (OpenStreetMap) findet und sie mit gemockten Fotos/Preisen/Bewertungen sowie einem Präferenz-Filter als sortierte Liste + Karte anzeigt.

**Architecture:** Reine Frontend-App (React + Vite), kein Backend. Echte Standorte kommen live von den offenen OSM-Diensten Nominatim (Adresse→Koordinaten) und Overpass (Gyms in der Nähe). Eine deterministische Mock-Schicht reichert jedes Gym anhand seiner OSM-ID stabil mit Preis, Bewertung, Fotos und Merkmalen an. Eine reine Ranking-Funktion sortiert Gyms nach Passung zu den Wünschen + Entfernung. UI besteht aus klar getrennten Komponenten.

**Tech Stack:** React 18, Vite, Vitest (+ jsdom) für Logik-Tests, Leaflet + react-leaflet für die Karte. Styling über plain CSS mit Design-Tokens (Gold/Schwarz, Momentum-Look). Keine API-Keys.

---

## Teststrategie

- **Logik-Module** (`src/lib/*`, `src/services/*`): strikt TDD mit Vitest. `fetch` wird in Service-Tests gemockt.
- **UI-Komponenten** (`src/components/*`, `App.jsx`): keine Test-First-Pflicht; Verifikation visuell im Dev-Server (`npm run dev`). Jede UI-Task nennt einen konkreten manuellen Verifikationsschritt.

## Dateistruktur (wird über die Tasks angelegt)

```
Gymify/
├─ index.html
├─ package.json
├─ vite.config.js
├─ src/
│  ├─ main.jsx                # Einstiegspunkt
│  ├─ App.jsx                 # State + Layout, verbindet alle Teile
│  ├─ styles/
│  │  └─ theme.css            # Design-Tokens (Gold/Schwarz) + Basis-Styles
│  ├─ lib/
│  │  ├─ distance.js          # haversineKm()
│  │  ├─ hash.js              # hashString(), mulberry32()
│  │  ├─ features.js          # FEATURES, FEATURE_KEYWORDS, parseFreetext()
│  │  ├─ enrich.js            # enrichGym()  (Mock-Schicht)
│  │  └─ match.js             # matchGyms()  (Ranking)
│  ├─ services/
│  │  ├─ geocode.js           # geocodeAddress()  (Nominatim)
│  │  └─ gymService.js        # fetchGyms()       (Overpass)
│  └─ components/
│     ├─ SearchBar.jsx        # Adresseingabe ("wo")
│     ├─ PreferenceBar.jsx    # Freitext + Tag-Auswahl ("was")
│     ├─ GymCard.jsx          # ein Listeneintrag
│     ├─ GymList.jsx          # Liste der Ergebnisse
│     ├─ GymMap.jsx           # Leaflet-Karte
│     └─ GymDetail.jsx        # Detailansicht
└─ src/**/__tests__/*.test.js # Vitest-Tests neben der Logik
```

### Zentrale Datentypen (über alle Tasks konsistent)

```
RawGym      = { id: string, name: string, lat: number, lon: number, tags: object }
EnrichedGym = RawGym & {
  price: number,            // €/Monat
  rating: number,           // 1.0–5.0, eine Nachkommastelle
  reviewCount: number,
  photos: string[],         // Bild-URLs
  features: string[],       // Teilmenge von FEATURES
  reviews: { author: string, rating: number, text: string }[]
}
RankedGym   = EnrichedGym & {
  distanceKm: number,
  matchedFeatures: string[],
  matchScore: number
}
```

---

### Task 0: Projekt-Scaffold (Vite + React + Vitest)

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

- [ ] **Step 1: Vite-React-Projekt im aktuellen Ordner erzeugen**

Run:
```bash
cd "/Users/farell.ceo/Desktop/Gymify"
npm create vite@latest . -- --template react
```
Wenn gefragt wird, ob im nicht-leeren Ordner fortgefahren werden soll: bestehende Dateien (docs/, .git/, .gitignore) **behalten** ("Ignore files and continue").

- [ ] **Step 2: Abhängigkeiten installieren**

Run:
```bash
npm install
npm install leaflet react-leaflet
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Vitest in `vite.config.js` aktivieren**

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 4: Test-Script in `package.json` ergänzen**

Im `"scripts"`-Block ergänzen:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Smoke-Test, dass Dev-Server startet**

Run: `npm run dev`
Expected: Vite startet, gibt eine lokale URL aus (z.B. `http://localhost:5173`). Im Browser erscheint die Vite-Standardseite. Danach mit Strg+C beenden.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: Vite-React-Scaffold + Vitest aufgesetzt"
```

---

### Task 1: Entfernungsberechnung (`haversineKm`)

**Files:**
- Create: `src/lib/distance.js`
- Test: `src/lib/__tests__/distance.test.js`

- [ ] **Step 1: Failing test**

`src/lib/__tests__/distance.test.js`:
```js
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
```

- [ ] **Step 2: Test schlägt fehl**

Run: `npm test -- distance`
Expected: FAIL ("haversineKm is not a function" / Modul nicht gefunden).

- [ ] **Step 3: Implementierung**

`src/lib/distance.js`:
```js
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Erdradius in km
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
```

- [ ] **Step 4: Test grün**

Run: `npm test -- distance`
Expected: PASS (2 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/distance.js src/lib/__tests__/distance.test.js
git commit -m "feat: haversineKm Entfernungsberechnung"
```

---

### Task 2: Deterministischer Hash + PRNG (`hash.js`)

**Files:**
- Create: `src/lib/hash.js`
- Test: `src/lib/__tests__/hash.test.js`

- [ ] **Step 1: Failing test**

`src/lib/__tests__/hash.test.js`:
```js
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
```

- [ ] **Step 2: Test schlägt fehl**

Run: `npm test -- hash`
Expected: FAIL (Modul/Funktionen nicht gefunden).

- [ ] **Step 3: Implementierung**

`src/lib/hash.js`:
```js
// 32-Bit-String-Hash (deterministisch, einfache Variante)
export function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Seeded PRNG: gibt eine Funktion zurück, die Werte in [0,1) liefert
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
```

- [ ] **Step 4: Test grün**

Run: `npm test -- hash`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/hash.js src/lib/__tests__/hash.test.js
git commit -m "feat: deterministischer Hash + mulberry32 PRNG"
```

---

### Task 3: Merkmals-Katalog + Freitext-Parsing (`features.js`)

**Files:**
- Create: `src/lib/features.js`
- Test: `src/lib/__tests__/features.test.js`

- [ ] **Step 1: Failing test**

`src/lib/__tests__/features.test.js`:
```js
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
```

- [ ] **Step 2: Test schlägt fehl**

Run: `npm test -- features`
Expected: FAIL (Modul nicht gefunden).

- [ ] **Step 3: Implementierung**

`src/lib/features.js`:
```js
// Fester Merkmals-Katalog für die Tag-Auswahl und das Ranking.
export const FEATURES = [
  'Crossfit',
  'Powerlifting',
  '24/7 geöffnet',
  'Sauna',
  'Frauenbereich',
  'Kurse',
  'Pool',
  'Functional Training',
]

// Stichwörter (lowercase) -> Merkmal, für Freitext-Erkennung.
export const FEATURE_KEYWORDS = {
  crossfit: 'Crossfit',
  powerlifting: 'Powerlifting',
  kraftdreikampf: 'Powerlifting',
  '24/7': '24/7 geöffnet',
  '24h': '24/7 geöffnet',
  'rund um die uhr': '24/7 geöffnet',
  sauna: 'Sauna',
  wellness: 'Sauna',
  frauen: 'Frauenbereich',
  frauenbereich: 'Frauenbereich',
  women: 'Frauenbereich',
  kurse: 'Kurse',
  classes: 'Kurse',
  pool: 'Pool',
  schwimmen: 'Pool',
  functional: 'Functional Training',
  funktional: 'Functional Training',
}

// Liest Freitext und gibt die erkannten Merkmale (ohne Duplikate) zurück.
export function parseFreetext(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const found = new Set()
  for (const [keyword, feature] of Object.entries(FEATURE_KEYWORDS)) {
    if (lower.includes(keyword)) found.add(feature)
  }
  return [...found]
}
```

- [ ] **Step 4: Test grün**

Run: `npm test -- features`
Expected: PASS (5 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/features.js src/lib/__tests__/features.test.js
git commit -m "feat: Merkmals-Katalog + Freitext-Parsing"
```

---

### Task 4: Mock-Anreicherung (`enrich.js`)

**Files:**
- Create: `src/lib/enrich.js`
- Test: `src/lib/__tests__/enrich.test.js`

- [ ] **Step 1: Failing test**

`src/lib/__tests__/enrich.test.js`:
```js
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
})
```

- [ ] **Step 2: Test schlägt fehl**

Run: `npm test -- enrich`
Expected: FAIL (Modul nicht gefunden).

- [ ] **Step 3: Implementierung**

`src/lib/enrich.js`:
```js
import { hashString, mulberry32 } from './hash.js'
import { FEATURES } from './features.js'

// Kuratiere Fitness-Fotos (Unsplash, direkte Bild-URLs, kein Key nötig).
const PHOTOS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800',
]

const REVIEW_AUTHORS = ['Lena M.', 'Tom K.', 'Sara P.', 'Jonas R.', 'Mara L.', 'Ben S.']
const REVIEW_TEXTS = [
  'Top ausgestattet und sauber. Komme gerne wieder.',
  'Gutes Equipment, manchmal etwas voll.',
  'Personal super freundlich, faire Preise.',
  'Tolle Atmosphäre, viele Kurse im Angebot.',
  'Modern und hell, alles da was man braucht.',
]

// Wählt deterministisch n Elemente aus arr anhand des PRNG.
function pickSome(arr, n, rand) {
  const copy = [...arr]
  const out = []
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

export function enrichGym(rawGym) {
  const seed = hashString(rawGym.id)
  const rand = mulberry32(seed)

  const price = 15 + Math.floor(rand() * 46) // 15–60
  const rating = Math.round((3.5 + rand() * 1.5) * 10) / 10 // 3.5–5.0
  const reviewCount = 12 + Math.floor(rand() * 488) // 12–499

  const photoCount = 2 + Math.floor(rand() * 2) // 2–3 Fotos
  const photos = pickSome(PHOTOS, photoCount, rand)

  const featureCount = 2 + Math.floor(rand() * 3) // 2–4 Merkmale
  const features = pickSome(FEATURES, featureCount, rand)

  const reviewN = 2 + Math.floor(rand() * 2) // 2–3 Bewertungen
  const reviews = []
  for (let i = 0; i < reviewN; i++) {
    reviews.push({
      author: REVIEW_AUTHORS[Math.floor(rand() * REVIEW_AUTHORS.length)],
      rating: 3 + Math.floor(rand() * 3), // 3–5
      text: REVIEW_TEXTS[Math.floor(rand() * REVIEW_TEXTS.length)],
    })
  }

  return { ...rawGym, price, rating, reviewCount, photos, features, reviews }
}
```

- [ ] **Step 4: Test grün**

Run: `npm test -- enrich`
Expected: PASS (5 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/enrich.js src/lib/__tests__/enrich.test.js
git commit -m "feat: deterministische Mock-Anreicherung der Gyms"
```

---

### Task 5: Ranking nach Passung + Entfernung (`match.js`)

**Files:**
- Create: `src/lib/match.js`
- Test: `src/lib/__tests__/match.test.js`

- [ ] **Step 1: Failing test**

`src/lib/__tests__/match.test.js`:
```js
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
```

- [ ] **Step 2: Test schlägt fehl**

Run: `npm test -- match`
Expected: FAIL (Modul nicht gefunden).

- [ ] **Step 3: Implementierung**

`src/lib/match.js`:
```js
import { haversineKm } from './distance.js'
import { parseFreetext } from './features.js'

// Bewertet jedes Gym nach Passung zu den Wünschen und ergänzt Entfernung.
// Sortierung: matchScore absteigend, dann Entfernung aufsteigend.
export function matchGyms(gyms, { selectedFeatures = [], freetext = '', origin }) {
  const wanted = new Set([...selectedFeatures, ...parseFreetext(freetext)])

  const ranked = gyms.map((g) => {
    const distanceKm = origin
      ? haversineKm(origin.lat, origin.lon, g.lat, g.lon)
      : 0
    const matchedFeatures = (g.features || []).filter((f) => wanted.has(f))
    return { ...g, distanceKm, matchedFeatures, matchScore: matchedFeatures.length }
  })

  ranked.sort((a, b) => b.matchScore - a.matchScore || a.distanceKm - b.distanceKm)
  return ranked
}
```

- [ ] **Step 4: Test grün**

Run: `npm test -- match`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/match.js src/lib/__tests__/match.test.js
git commit -m "feat: Ranking nach Passung und Entfernung"
```

---

### Task 6: Geocoding-Service (`geocode.js`)

**Files:**
- Create: `src/services/geocode.js`
- Test: `src/services/__tests__/geocode.test.js`

- [ ] **Step 1: Failing test**

`src/services/__tests__/geocode.test.js`:
```js
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
})
```

- [ ] **Step 2: Test schlägt fehl**

Run: `npm test -- geocode`
Expected: FAIL (Modul nicht gefunden).

- [ ] **Step 3: Implementierung**

`src/services/geocode.js`:
```js
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

// Wandelt eine Adresse/Stadt in Koordinaten um (Nominatim).
export async function geocodeAddress(query) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'de' } })
  if (!res.ok) throw new Error(`Geocoding fehlgeschlagen (${res.status})`)
  const data = await res.json()
  if (!data.length) throw new Error('Adresse nicht gefunden (nichts gefunden)')
  const { lat, lon, display_name } = data[0]
  return { lat: parseFloat(lat), lon: parseFloat(lon), label: display_name }
}
```

- [ ] **Step 4: Test grün**

Run: `npm test -- geocode`
Expected: PASS (2 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/services/geocode.js src/services/__tests__/geocode.test.js
git commit -m "feat: Nominatim-Geocoding-Service"
```

---

### Task 7: Gym-Suche via Overpass (`gymService.js`)

**Files:**
- Create: `src/services/gymService.js`
- Test: `src/services/__tests__/gymService.test.js`

- [ ] **Step 1: Failing test**

`src/services/__tests__/gymService.test.js`:
```js
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
})
```

- [ ] **Step 2: Test schlägt fehl**

Run: `npm test -- gymService`
Expected: FAIL (Modul nicht gefunden).

- [ ] **Step 3: Implementierung**

`src/services/gymService.js`:
```js
const OVERPASS = 'https://overpass-api.de/api/interpreter'

// Holt echte Gyms im Umkreis (Overpass) und normalisiert sie zu RawGym.
export async function fetchGyms({ lat, lon, radiusM = 5000 }) {
  const query = `
    [out:json][timeout:25];
    (
      node["leisure"="fitness_centre"](around:${radiusM},${lat},${lon});
      way["leisure"="fitness_centre"](around:${radiusM},${lat},${lon});
      node["sport"="fitness"](around:${radiusM},${lat},${lon});
      way["sport"="fitness"](around:${radiusM},${lat},${lon});
    );
    out center tags;`

  const res = await fetch(OVERPASS, { method: 'POST', body: query })
  if (!res.ok) throw new Error(`Gym-Suche fehlgeschlagen (${res.status})`)
  const data = await res.json()

  return (data.elements || []).map((el) => {
    const lat = el.lat ?? el.center?.lat
    const lon = el.lon ?? el.center?.lon
    return {
      id: `${el.type}/${el.id}`,
      name: el.tags?.name || 'Fitnessstudio',
      lat,
      lon,
      tags: el.tags || {},
    }
  })
}
```

- [ ] **Step 4: Test grün**

Run: `npm test -- gymService`
Expected: PASS (2 Tests).

- [ ] **Step 5: Commit**

```bash
git add src/services/gymService.js src/services/__tests__/gymService.test.js
git commit -m "feat: Overpass-Gym-Suche mit Normalisierung"
```

---

### Task 8: Design-Tokens & Basis-Styles (`theme.css`)

**Files:**
- Create: `src/styles/theme.css`
- Modify: `src/main.jsx` (Import der Styles)

- [ ] **Step 1: Theme-CSS anlegen**

`src/styles/theme.css`:
```css
:root {
  --bg:        #14110F;
  --bg-deep:   #0E0E0C;
  --gold:      #B0925A;
  --rose:      #BC7E6C;
  --cream:     #F8F5EF;
  --muted:     #a59e92;
  --surface:   #1d1916;
  --radius:    14px;
  --serif: "Didot", "Hoefler Text", Georgia, serif;
  --sans:  "Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--cream);
  font-family: var(--sans);
}

h1, h2, h3 { font-family: var(--serif); font-weight: 500; letter-spacing: 0.3px; }

.gold { color: var(--gold); }

button {
  font-family: var(--sans);
  cursor: pointer;
}

.btn-gold {
  background: var(--gold);
  color: var(--bg-deep);
  border: none;
  border-radius: var(--radius);
  padding: 12px 18px;
  font-weight: 600;
}

.card {
  background: var(--surface);
  border: 1px solid rgba(176, 146, 90, 0.18);
  border-radius: var(--radius);
}
```

- [ ] **Step 2: Styles importieren**

`src/main.jsx` — die bestehende CSS-Import-Zeile (z.B. `import './index.css'`) ersetzen durch:
```js
import './styles/theme.css'
```

- [ ] **Step 3: Visuelle Verifikation**

Run: `npm run dev`
Expected: Seite hat schwarzen Hintergrund und cremefarbene Schrift. Danach Strg+C.

- [ ] **Step 4: Commit**

```bash
git add src/styles/theme.css src/main.jsx
git commit -m "style: Gold-Schwarz Design-Tokens (Momentum-Look)"
```

---

### Task 9: SearchBar-Komponente

**Files:**
- Create: `src/components/SearchBar.jsx`

- [ ] **Step 1: Komponente schreiben**

`src/components/SearchBar.jsx`:
```jsx
import { useState } from 'react'

// Adresseingabe ("wo bist du?"). Ruft onSearch(query) beim Absenden.
export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState('')

  function submit(e) {
    e.preventDefault()
    const q = value.trim()
    if (q) onSearch(q)
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Wo bist du? z.B. Barcelona"
        style={{
          flex: 1,
          padding: '12px 14px',
          borderRadius: 14,
          border: '1px solid rgba(176,146,90,0.4)',
          background: '#1d1916',
          color: '#F8F5EF',
          fontSize: 16,
        }}
      />
      <button className="btn-gold" type="submit" disabled={loading}>
        {loading ? 'Suche…' : 'Gyms finden'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Verifikation (folgt in Task 14 bei der Integration)**

Hinweis: Diese Komponente wird in Task 14 in `App.jsx` eingebunden und dort visuell geprüft.

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchBar.jsx
git commit -m "feat: SearchBar-Komponente (Adresseingabe)"
```

---

### Task 10: PreferenceBar-Komponente

**Files:**
- Create: `src/components/PreferenceBar.jsx`

- [ ] **Step 1: Komponente schreiben**

`src/components/PreferenceBar.jsx`:
```jsx
import { FEATURES } from '../lib/features.js'

// "Was suchst du?": Freitextfeld + antippbare Merkmals-Tags.
// Props: freetext, onFreetext(str), selectedFeatures (string[]), onToggleFeature(str)
export default function PreferenceBar({ freetext, onFreetext, selectedFeatures, onToggleFeature }) {
  return (
    <div style={{ marginTop: 12 }}>
      <input
        type="text"
        value={freetext}
        onChange={(e) => onFreetext(e.target.value)}
        placeholder="Was suchst du? z.B. Crossfit mit Sauna"
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 14,
          border: '1px solid rgba(176,146,90,0.3)',
          background: '#1d1916',
          color: '#F8F5EF',
          fontSize: 15,
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {FEATURES.map((f) => {
          const active = selectedFeatures.includes(f)
          return (
            <button
              key={f}
              onClick={() => onToggleFeature(f)}
              style={{
                padding: '7px 13px',
                borderRadius: 999,
                fontSize: 14,
                border: '1px solid var(--gold)',
                background: active ? 'var(--gold)' : 'transparent',
                color: active ? '#0E0E0C' : 'var(--gold)',
              }}
            >
              {f}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PreferenceBar.jsx
git commit -m "feat: PreferenceBar (Freitext + Merkmals-Tags)"
```

---

### Task 11: GymCard-Komponente

**Files:**
- Create: `src/components/GymCard.jsx`

- [ ] **Step 1: Komponente schreiben**

`src/components/GymCard.jsx`:
```jsx
// Ein Listeneintrag für ein Gym. Props: gym (RankedGym), onSelect(gym)
export default function GymCard({ gym, onSelect }) {
  return (
    <div
      className="card"
      onClick={() => onSelect(gym)}
      style={{ display: 'flex', gap: 12, padding: 12, cursor: 'pointer', overflow: 'hidden' }}
    >
      <img
        src={gym.photos[0]}
        alt={gym.name}
        style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{gym.name}</h3>
          <span className="gold" style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
            {gym.price} €/Mon.
          </span>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 2 }}>
          ★ {gym.rating} ({gym.reviewCount}) · {gym.distanceKm.toFixed(1)} km
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {gym.matchedFeatures.map((f) => (
            <span
              key={f}
              style={{
                fontSize: 12,
                padding: '3px 8px',
                borderRadius: 999,
                background: 'rgba(176,146,90,0.18)',
                color: 'var(--gold)',
              }}
            >
              ✓ {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GymCard.jsx
git commit -m "feat: GymCard-Komponente"
```

---

### Task 12: GymList-Komponente

**Files:**
- Create: `src/components/GymList.jsx`

- [ ] **Step 1: Komponente schreiben**

`src/components/GymList.jsx`:
```jsx
import GymCard from './GymCard.jsx'

// Liste der Ergebnisse. Props: gyms (RankedGym[]), onSelect(gym)
export default function GymList({ gyms, onSelect }) {
  if (!gyms.length) {
    return (
      <p style={{ color: 'var(--muted)' }}>
        Keine Gyms gefunden. Versuch eine andere Adresse oder einen größeren Ort.
      </p>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {gyms.map((g) => (
        <GymCard key={g.id} gym={g} onSelect={onSelect} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GymList.jsx
git commit -m "feat: GymList-Komponente"
```

---

### Task 13: GymMap-Komponente (Leaflet)

**Files:**
- Create: `src/components/GymMap.jsx`
- Modify: `src/styles/theme.css` (Leaflet-CSS-Import)

- [ ] **Step 1: Leaflet-CSS global einbinden**

Oben in `src/styles/theme.css` als erste Zeile einfügen:
```css
@import 'leaflet/dist/leaflet.css';
```

- [ ] **Step 2: Komponente schreiben**

`src/components/GymMap.jsx`:
```jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

// Zentriert die Karte neu, wenn sich der Ursprung ändert.
function Recenter({ center }) {
  const map = useMap()
  map.setView(center, map.getZoom())
  return null
}

// Karte mit Markern je Gym. Props: origin {lat,lon}, gyms (RankedGym[]), onSelect(gym)
export default function GymMap({ origin, gyms, onSelect }) {
  if (!origin) return null
  const center = [origin.lat, origin.lon]
  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: 14 }}>
      <Recenter center={center} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {gyms.map((g) => (
        <Marker key={g.id} position={[g.lat, g.lon]} eventHandlers={{ click: () => onSelect(g) }}>
          <Popup>
            <strong>{g.name}</strong>
            <br />
            {g.price} €/Mon. · ★ {g.rating}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

Hinweis: Falls Marker-Icons nicht erscheinen (bekanntes Leaflet/Vite-Thema), in `GymMap.jsx` ganz oben ergänzen:
```js
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GymMap.jsx src/styles/theme.css
git commit -m "feat: GymMap-Komponente (Leaflet-Karte)"
```

---

### Task 14: App-Integration (State + Layout + Such-Flow)

**Files:**
- Modify: `src/App.jsx` (vollständig ersetzen)

- [ ] **Step 1: App.jsx schreiben**

`src/App.jsx` (kompletter Inhalt):
```jsx
import { useState, useMemo } from 'react'
import SearchBar from './components/SearchBar.jsx'
import PreferenceBar from './components/PreferenceBar.jsx'
import GymList from './components/GymList.jsx'
import GymMap from './components/GymMap.jsx'
import GymDetail from './components/GymDetail.jsx'
import { geocodeAddress } from './services/geocode.js'
import { fetchGyms } from './services/gymService.js'
import { enrichGym } from './lib/enrich.js'
import { matchGyms } from './lib/match.js'

export default function App() {
  const [origin, setOrigin] = useState(null)
  const [enriched, setEnriched] = useState([])
  const [freetext, setFreetext] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedGym, setSelectedGym] = useState(null)

  async function handleSearch(query) {
    setLoading(true)
    setError('')
    try {
      const loc = await geocodeAddress(query)
      setOrigin(loc)
      const raw = await fetchGyms({ lat: loc.lat, lon: loc.lon, radiusM: 5000 })
      setEnriched(raw.map(enrichGym))
    } catch (e) {
      setError(e.message)
      setEnriched([])
    } finally {
      setLoading(false)
    }
  }

  function toggleFeature(f) {
    setSelectedFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    )
  }

  const ranked = useMemo(
    () => matchGyms(enriched, { selectedFeatures, freetext, origin }),
    [enriched, selectedFeatures, freetext, origin]
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 4px' }}>
        Gym<span className="gold">ify</span>
      </h1>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>
        Finde dein Gym – überall wo du bist.
      </p>

      <SearchBar onSearch={handleSearch} loading={loading} />
      <PreferenceBar
        freetext={freetext}
        onFreetext={setFreetext}
        selectedFeatures={selectedFeatures}
        onToggleFeature={toggleFeature}
      />

      {error && <p style={{ color: 'var(--rose)' }}>{error}</p>}

      {origin && !loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginTop: 20,
            alignItems: 'start',
          }}
        >
          <GymList gyms={ranked} onSelect={setSelectedGym} />
          <div style={{ height: 520, position: 'sticky', top: 16 }}>
            <GymMap origin={origin} gyms={ranked} onSelect={setSelectedGym} />
          </div>
        </div>
      )}

      {selectedGym && (
        <GymDetail gym={selectedGym} onClose={() => setSelectedGym(null)} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Visuelle Verifikation**

Run: `npm run dev`
Im Browser:
1. „Barcelona" eingeben → auf „Gyms finden" klicken.
Expected: Liste echter Gyms links, Karte mit Markern rechts, Gold-Schwarz-Optik.
2. Tag „Sauna" antippen.
Expected: Gyms mit Sauna rutschen nach oben und zeigen das Badge „✓ Sauna".
3. Ins „Was suchst du?"-Feld „crossfit" tippen.
Expected: Crossfit-Gyms bekommen ein „✓ Crossfit"-Badge und steigen im Ranking.

Danach Strg+C.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: App-Integration (Such-Flow, Liste + Karte, Filter)"
```

---

### Task 15: GymDetail-Komponente (Modal-Detailansicht)

**Files:**
- Create: `src/components/GymDetail.jsx`

Hinweis: In Task 14 wird `GymDetail` bereits importiert und gerendert. Diese Task liefert die Komponente; wer den Plan strikt sequentiell ausführt, legt eine minimale Platzhalter-Datei an, bevor Task 14 läuft, oder zieht diese Task vor Task 14. Empfehlung: **Task 15 vor Task 14 ausführen.**

- [ ] **Step 1: Komponente schreiben**

`src/components/GymDetail.jsx`:
```jsx
// Detailansicht als Overlay. Props: gym (RankedGym), onClose()
export default function GymDetail({ gym, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 24,
        overflowY: 'auto',
        zIndex: 1000,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640, width: '100%', padding: 20 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{gym.name}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 24 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '12px 0' }}>
          {gym.photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${gym.name} ${i + 1}`}
              style={{ width: 220, height: 150, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
            />
          ))}
        </div>

        <p className="gold" style={{ fontSize: 20, fontWeight: 600, margin: '4px 0' }}>
          {gym.price} €/Monat
        </p>
        <p style={{ color: 'var(--muted)', margin: '4px 0' }}>
          ★ {gym.rating} aus {gym.reviewCount} Bewertungen · {gym.distanceKm.toFixed(1)} km entfernt
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
          {gym.features.map((f) => (
            <span
              key={f}
              style={{
                fontSize: 13,
                padding: '4px 10px',
                borderRadius: 999,
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <h3 style={{ marginBottom: 8 }}>Bewertungen</h3>
        {gym.reviews.map((r, i) => (
          <div key={i} style={{ borderTop: '1px solid rgba(176,146,90,0.15)', padding: '8px 0' }}>
            <strong>{r.author}</strong> <span className="gold">★ {r.rating}</span>
            <p style={{ margin: '4px 0', color: 'var(--cream)' }}>{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Visuelle Verifikation**

Run: `npm run dev` → Adresse suchen → ein Gym in der Liste anklicken.
Expected: Overlay mit Fotos, Preis, Bewertung, Merkmalen und Bewertungstexten öffnet sich; Klick auf ✕ oder den Hintergrund schließt es.

- [ ] **Step 3: Commit**

```bash
git add src/components/GymDetail.jsx
git commit -m "feat: GymDetail-Overlay (Fotos, Preis, Bewertungen)"
```

---

### Task 16: Endabnahme & Aufräumen

**Files:**
- Modify: ggf. `src/App.css`/`src/index.css` entfernen, falls ungenutzt

- [ ] **Step 1: Alle Logik-Tests laufen lassen**

Run: `npm test`
Expected: Alle Suites grün (distance, hash, features, enrich, match, geocode, gymService).

- [ ] **Step 2: Ungenutzte Vite-Default-Dateien entfernen**

Falls `src/index.css` oder `src/App.css` nicht mehr importiert werden, löschen:
```bash
git rm --cached src/App.css 2>/dev/null; rm -f src/App.css src/index.css 2>/dev/null; true
```
(Vor dem Löschen prüfen, dass sie nirgends mehr importiert werden: `grep -rn "App.css\|index.css" src`.)

- [ ] **Step 3: Production-Build prüfen**

Run: `npm run build`
Expected: Build läuft ohne Fehler durch.

- [ ] **Step 4: Manueller End-to-End-Durchlauf**

Run: `npm run dev` und den kompletten Flow testen: Adresse → Liste+Karte → Tag-Filter → Freitext → Detailansicht.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: Aufräumen + Endabnahme Prototyp"
```

---

## Self-Review (vom Plan-Autor durchgeführt)

**Spec-Abdeckung:** Adresssuche → Task 6+9+14. „Was suchst du?" (Freitext+Tags) → Task 3+10+5. Liste+Karte → Task 12+13+14. Pro-Gym Name/Entfernung/Preis/Rating/Foto → Task 11. Detailansicht → Task 15. Echte Standorte via OSM → Task 6+7. Mock Preis/Rating/Foto/Merkmale deterministisch → Task 4. Ranking nach Passung+Entfernung mit Badges → Task 5+11. Gold-Schwarz-Look → Task 8. React+Vite → Task 0. Alle Spec-Punkte abgedeckt.

**Reihenfolge-Hinweis:** Task 15 (GymDetail) sollte vor Task 14 (App-Integration) ausgeführt werden, da App.jsx GymDetail importiert — im Plan an beiden Stellen vermerkt.

**Typ-Konsistenz:** `enrichGym` liefert `{price, rating, reviewCount, photos, features, reviews}`; `matchGyms` ergänzt `{distanceKm, matchedFeatures, matchScore}`; GymCard/GymDetail lesen genau diese Felder. `fetchGyms` liefert `{id, name, lat, lon, tags}` — passt zu `enrichGym`-Input. Konsistent.
