const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

// Wandelt eine Adresse/Stadt in Koordinaten um (Nominatim).
export async function geocodeAddress(query) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'de' } })
  if (!res.ok) throw new Error(`Geocoding fehlgeschlagen (${res.status})`)
  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error(`Geocoding-Fehler: ${data.error ?? 'unerwartete API-Antwort'}`)
  }
  if (!data.length) throw new Error('Adresse nicht gefunden (nichts gefunden)')
  const { lat, lon, display_name } = data[0]
  const result = { lat: parseFloat(lat), lon: parseFloat(lon), label: display_name }
  if (Number.isNaN(result.lat) || Number.isNaN(result.lon)) {
    throw new Error('Ungültige Koordinaten aus Geocoder')
  }
  return result
}
