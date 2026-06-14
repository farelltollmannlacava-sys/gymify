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
