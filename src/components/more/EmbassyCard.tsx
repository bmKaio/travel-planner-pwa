import { MapPin, Phone, ExternalLink } from 'lucide-react'

interface Embassy {
  id: string
  country: string
  city: string
  name: string
  address: string
  phone: string
  mapsUrl: string
}

const EMBASSIES: Embassy[] = [
  {
    id: 'hanoi',
    country: 'Vietnam',
    city: 'Hanoi',
    name: 'Embajada de España en Hanoi',
    address: '4 Le Duan, Ba Dinh, Hanoi, Vietnam',
    phone: '+84 24 3825 0000',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Embajada+de+España+en+Hanoi,+4+Le+Duan,+Hanoi',
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
  },
]

function EmbassyCard() {
  return (
    <div className="space-y-3">
      {EMBASSIES.map((embassy) => (
        <article
          key={embassy.id}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
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
        </article>
      ))}
    </div>
  )
}

export default EmbassyCard
