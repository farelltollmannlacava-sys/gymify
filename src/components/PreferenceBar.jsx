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
