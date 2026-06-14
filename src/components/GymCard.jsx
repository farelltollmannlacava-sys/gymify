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
