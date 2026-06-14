import { hashString, mulberry32 } from './hash.js'
import { FEATURES } from './features.js'

// Kuratiere Fitness-Fotos (Unsplash, direkte Bild-URLs, kein Key nötig).
const PHOTOS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800',
]

const REVIEW_AUTHORS = ['Lena M.', 'Tom K.', 'Sara P.', 'Jonas R.', 'Mara L.', 'Ben S.']
const REVIEW_TEXTS = [
  'Top ausgestattet und sauber. Komme gerne wieder.',
  'Gutes Equipment, manchmal etwas voll.',
  'Personal super freundlich, faire Preise.',
  'Tolle Atmosphäre, viele Kurse im Angebot.',
  'Modern und hell, alles da was man braucht.',
]

// Wählt deterministisch n Elemente aus arr anhand des PRNG.
function pickSome(arr, n, rand) {
  const copy = [...arr]
  const out = []
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

export function enrichGym(rawGym) {
  const seed = hashString(rawGym.id)
  const rand = mulberry32(seed)

  const price = 15 + Math.floor(rand() * 46) // 15–60
  const rating = Math.round((3.5 + rand() * 1.5) * 10) / 10 // 3.5–5.0
  const reviewCount = 12 + Math.floor(rand() * 488) // 12–499

  const photoCount = 2 + Math.floor(rand() * 2) // 2–3 Fotos
  const photos = pickSome(PHOTOS, photoCount, rand)

  const featureCount = 2 + Math.floor(rand() * 3) // 2–4 Merkmale
  const features = pickSome(FEATURES, featureCount, rand)

  const reviewN = 2 + Math.floor(rand() * 2) // 2–3 Bewertungen
  const reviews = []
  for (let i = 0; i < reviewN; i++) {
    reviews.push({
      author: REVIEW_AUTHORS[Math.floor(rand() * REVIEW_AUTHORS.length)],
      rating: 3 + Math.floor(rand() * 3), // 3–5
      text: REVIEW_TEXTS[Math.floor(rand() * REVIEW_TEXTS.length)],
    })
  }

  return { ...rawGym, price, rating, reviewCount, photos, features, reviews }
}
