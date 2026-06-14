# Gymify — Prototyp Design-Spec

**Datum:** 2026-06-14
**Status:** Genehmigt (Brainstorming abgeschlossen)

## Vision (Kontext, nicht Teil des Prototyps)

Gymify (gesprochen „Dschimmifai") ist eine Fitness-App, mit der man einfach Gyms
in beliebigen Märkten/Städten findet. Langfristziel: ein **Premium-Abo**, mit dem
Mitglieder Zugang zu allen auf der Plattform gelisteten Gyms bekommen.

Login, echtes Abo und Bezahlung sind **nicht** Teil dieses Prototyps.

## Ziel des Prototyps

Ein voll vorzeigbarer, kostenloser Web-Prototyp für den Kern-Use-Case **Reisende**:
Adresse / Reiseziel eingeben → passende Gyms in der Nähe sehen → sich leicht für
eines entscheiden.

## Funktionsumfang

1. **Zwei Such-Ebenen oben:**
   - **Adresse / Reiseziel** eingeben („wo bist du?") — z.B. „Barcelona" oder eine konkrete Straße.
   - **„Was suchst du?"** — Freitextfeld (z.B. „Crossfit mit Sauna") **plus** antippbare
     Merkmals-Tags darunter (z.B. Crossfit, Powerlifting, 24/7, Sauna, Frauenbereich, Kurse, günstig).
2. **Ergebnisse** als **Liste und Karte**, sortiert nach **Passung + Entfernung**.
   Best passende Vorschläge oben, mit kleinen Badges, welche der gewünschten Merkmale erfüllt sind.
3. **Pro Gym (Karte/Listeneintrag):** Name, Entfernung, Abopreis, Bewertung (Sterne), Foto.
4. **Detailansicht:** größere Bilder, mehr Infos, Bewertungen, Adresse, „Auf Karte zeigen".

## Datenstrategie

- **Echte Standorte** aus OpenStreetMap — kostenlos, kein API-Key:
  - **Nominatim**: Adresse → Koordinaten (Geocoding).
  - **Overpass**: echte Gyms in der Nähe (`leisure=fitness_centre`, `sport=fitness` u.ä.).
- **Mock-Anreicherung** (deterministisch pro Gym, gleiche ID = immer gleiche Werte):
  - Abopreis, Bewertung + Bewertungstexte, Foto(s).
  - Merkmale/Tags (Crossfit, 24/7, Sauna, Frauenbereich, Kurse, Preis-Level, …) für den Filter.
  - Determinismus z.B. über einen Hash der OSM-ID, damit die Demo stabil und glaubwürdig wirkt.

## Technik

- **React + Vite** — Web-App, läuft im Browser, mobil gut bedienbar; erweiterbar Richtung echtes Produkt.
- **Leaflet** für die interaktive Karte (passt zu OSM, kostenlos).
- Kein Backend nötig; alle Aufrufe gehen direkt an die offenen OSM-Dienste.

## Architektur (klar getrennte Bausteine)

| Baustein         | Aufgabe |
|------------------|---------|
| `SearchBar`      | Adresseingabe ("wo") |
| `PreferenceBar`  | Freitext + antippbare Merkmals-Tags ("was") |
| `gymService`     | Holt echte Gyms (Nominatim-Geocoding + Overpass-Suche) |
| `mockEnrichment` | Ergänzt Preis, Bewertung, Foto und Merkmale deterministisch pro Gym |
| `matchGyms`      | Bewertet Passung zu den Wünschen → Ranking + erfüllte-Merkmale-Badges |
| `GymList` / `GymCard` | Listenansicht der Ergebnisse |
| `GymMap`         | Kartenansicht (Leaflet, Marker je Gym) |
| `GymDetail`      | Detailseite eines Gyms |

Jeder Baustein hat eine klar umrissene Aufgabe und eine definierte Schnittstelle,
sodass er unabhängig verstanden und getestet werden kann.

## Look & Feel (Momentum-Designsprache: Gold & Schwarz, premium)

Übernommen aus dem Momentum-Styleguide:

- **Hintergrund (Schwarz):** `#14110F` (sehr dunkel: `#0E0E0C`)
- **Akzent (Gold):** `#B0925A`
- **Sekundär-Akzent (Rosé):** `#BC7E6C`
- **Helle Schrift / Creme:** `#F8F5EF`
- **Gedämpfte Töne:** `#a59e92`, `#e9e1d2`
- **Headlines:** Didot (serif, edel) — Fallback „Hoefler Text", Georgia.
- **Fließtext:** Avenir Next (sans) — Fallback „Helvetica Neue", Arial.
- Großzügiger Weißraum, große Bilder, ruhige und hochwertige Anmutung.

## Bewusst ausgeschlossen (YAGNI)

- Login / Benutzerkonten
- Echtes Abo / Bezahlung / Premium-Zugang
- Eigenes Backend / Datenbank
- Echte Gym-Fotos und echte Bewertungen (Google-only; im Prototyp gemockt)
