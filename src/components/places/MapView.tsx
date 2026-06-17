import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Place, PlaceCategory } from '../../types'
import { CATEGORY_CONFIG, getCategoryConfig, truncate } from '../../utils/places'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER: [number, number] = [16.0, 106.0]
const DEFAULT_ZOOM = 6

interface MapViewProps {
  places: Place[]
  focusedPlaceId?: string | null
}

function createMarkerIcon(category: PlaceCategory): L.DivIcon {
  const config = getCategoryConfig(category)
  const initial = config.label.charAt(0).toUpperCase()

  return L.divIcon({
    className: '',
    html: `
      <div
        style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: ${config.markerColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        "
      >
        ${initial}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

function MapController({
  places,
  focusedPlaceId,
}: {
  places: Place[]
  focusedPlaceId?: string | null
}) {
  const map = useMap()

  useEffect(() => {
    if (focusedPlaceId) {
      const place = places.find((p) => p.id === focusedPlaceId)
      if (place?.location.lat !== undefined && place?.location.lng !== undefined) {
        map.flyTo([place.location.lat, place.location.lng], 15, {
          duration: 1.2,
        })
      }
      return
    }

    const withCoords = places.filter(
      (p) => p.location.lat !== undefined && p.location.lng !== undefined
    )

    if (withCoords.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      return
    }

    if (withCoords.length === 1) {
      const [place] = withCoords
      map.setView([place.location.lat!, place.location.lng!], 12)
      return
    }

    const bounds = L.latLngBounds(
      withCoords.map((p) => [p.location.lat!, p.location.lng!] as [number, number])
    )
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 })
  }, [map, places, focusedPlaceId])

  return null
}

function PopupActions({ place }: { place: Place }) {
  const navigate = useNavigate()

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => navigate(`/places/${place.id}`)}
        className="rounded-lg bg-travel-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-travel-blue-700 focus:outline-none focus:ring-2 focus:ring-travel-blue-500"
      >
        View details
      </button>
      <a
        href={getGoogleMapsUrl(place)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-700"
      >
        Open in Google Maps
      </a>
    </div>
  )
}

function getGoogleMapsUrl(place: Place): string {
  const { lat, lng, address } = place.location

  if (lat !== undefined && lng !== undefined) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15`
  }

  if (address) {
    return `https://www.google.com/maps/search/${encodeURIComponent(address)}`
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(place.name)}`
}

function CategoryBadge({ category }: { category: PlaceCategory }) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.bgClass} ${config.textClass}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  )
}

function MapView({ places, focusedPlaceId }: MapViewProps) {
  const markers = useMemo(
    () =>
      places.filter(
        (place) => place.location.lat !== undefined && place.location.lng !== undefined
      ),
    [places]
  )

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController places={places} focusedPlaceId={focusedPlaceId} />
        {markers.map((place) => (
          <Marker
            key={place.id}
            position={[place.location.lat!, place.location.lng!]}
            icon={createMarkerIcon(place.category)}
          >
            <Popup>
              <div className="min-w-[10rem] max-w-[14rem]">
                <CategoryBadge category={place.category} />
                <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {place.name}
                </h3>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                  {truncate(place.description, 100)}
                </p>
                <PopupActions place={place} />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapView
