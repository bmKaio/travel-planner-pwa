import { MapPin, Phone, ExternalLink } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Embassy {
  id: string
  country: string
  city: string
  name: string
  address: string
  phone: string
  mapsUrl: string
  lat: number
  lng: number
}

const EMBASSIES: Embassy[] = [
  {
    id: 'hanoi',
    country: 'Vietnam',
    city: 'Hanoi',
    name: 'Embajada de España en Hanoi',
    address: '4 Le Duan, Ba Dinh, Hanoi, Vietnam',
    phone: '+84 24 3825 0000',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Embajada+de+España+en+Hanoi,+4+Le+Duan,+Hanoi',
    lat: 21.0348,
    lng: 105.8399,
  },
  {
    id: 'phnom-penh',
    country: 'Camboya',
    city: 'Phnom Penh',
    name: 'Embajada de España en Phnom Penh',
    address: '1 Preah Norodom Blvd, Phnom Penh, Camboya',
    phone: '+855 23 213 000',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Embajada+de+España+en+Phnom+Penh,+1+Preah+Norodom+Blvd',
    lat: 11.5629,
    lng: 104.9282,
  },
]

const EMBASSY_ICON = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#e11d48;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)">E</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function EmbassyCard() {
  return (
    <div className="space-y-3">
      {EMBASSIES.map((embassy) => (
        <article
          key={embassy.id}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{embassy.name}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{embassy.address}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${embassy.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-travel-blue-50 px-3 py-2 text-sm font-medium text-travel-blue-700 hover:bg-travel-blue-100 dark:bg-travel-blue-900/30 dark:text-travel-blue-300 dark:hover:bg-travel-blue-900/50"
                    aria-label={`Llamar a ${embassy.name}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {embassy.phone}
                  </a>

                  <a
                    href={embassy.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
                    aria-label={`Ver ubicación de ${embassy.name} en el mapa`}
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Ver en mapa
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="h-36 w-full">
            <MapContainer
              center={[embassy.lat, embassy.lng]}
              zoom={15}
              scrollWheelZoom={false}
              zoomControl={false}
              dragging={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[embassy.lat, embassy.lng]} icon={EMBASSY_ICON} />
            </MapContainer>
          </div>
        </article>
      ))}
    </div>
  )
}

export default EmbassyCard
