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
