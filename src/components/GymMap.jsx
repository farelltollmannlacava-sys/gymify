import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

// Zentriert die Karte neu, wenn sich der Ursprung ändert.
function Recenter({ center }) {
  const map = useMap()
  map.setView(center, map.getZoom())
  return null
}

// Karte mit Markern je Gym. Props: origin {lat,lon}, gyms (RankedGym[]), onSelect(gym)
export default function GymMap({ origin, gyms, onSelect }) {
  if (!origin) return null
  const center = [origin.lat, origin.lon]
  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: 14 }}>
      <Recenter center={center} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {gyms.map((g) => (
        <Marker key={g.id} position={[g.lat, g.lon]} eventHandlers={{ click: () => onSelect(g) }}>
          <Popup>
            <strong>{g.name}</strong>
            <br />
            {g.price} €/Mon. · ★ {g.rating}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
