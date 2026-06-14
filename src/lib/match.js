import { haversineKm } from './distance.js'
import { parseFreetext } from './features.js'

// Bewertet jedes Gym nach Passung zu den Wünschen und ergänzt Entfernung.
// Sortierung: matchScore absteigend, dann Entfernung aufsteigend.
export function matchGyms(gyms, { selectedFeatures = [], freetext = '', origin }) {
  const wanted = new Set([...selectedFeatures, ...parseFreetext(freetext)])

  const ranked = gyms.map((g) => {
    const distanceKm =
      origin && g.lat != null && g.lon != null
        ? haversineKm(origin.lat, origin.lon, g.lat, g.lon)
        : Infinity
    const matchedFeatures = (g.features || []).filter((f) => wanted.has(f))
    return { ...g, distanceKm, matchedFeatures, matchScore: matchedFeatures.length }
  })

  ranked.sort((a, b) => b.matchScore - a.matchScore || a.distanceKm - b.distanceKm)
  return ranked
}
