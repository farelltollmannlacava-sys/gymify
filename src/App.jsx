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
      setOrigin(null)
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
        <div className="results-grid">
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
