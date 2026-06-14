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
