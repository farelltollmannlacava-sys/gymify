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
