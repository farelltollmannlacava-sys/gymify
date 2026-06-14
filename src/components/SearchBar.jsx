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
