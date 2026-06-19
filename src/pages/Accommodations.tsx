import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BedDouble, MapPin, Navigation, ExternalLink, Calendar } from 'lucide-react'
import { useDocuments } from '../hooks/useDocuments'
import Loading from '../components/common/Loading'
import type { DocumentItem } from '../types'

function getFirstNightIso(doc: DocumentItem): string {
  const { nights, night } = doc.data
  if (Array.isArray(nights) && nights.length > 0) return String(nights[0])
  if (typeof night === 'string') return night
  return ''
}

function getCheckoutIso(doc: DocumentItem): string | null {
  const { nights, night } = doc.data
  const last =
    Array.isArray(nights) && nights.length > 0
      ? String(nights[nights.length - 1])
      : typeof night === 'string'
        ? night
        : null
  if (!last) return null
  const d = new Date(last)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split('T')[0]
}

function getNightCount(doc: DocumentItem): number {
  const { nights, night } = doc.data
  if (Array.isArray(nights)) return nights.length
  return night ? 1 : 0
}

function areConsecutive(doc: DocumentItem): boolean {
  const { nights } = doc.data
  if (!Array.isArray(nights) || nights.length < 2) return true
  for (let i = 1; i < nights.length; i++) {
    const prev = new Date(String(nights[i - 1]))
    const curr = new Date(String(nights[i]))
    if ((curr.getTime() - prev.getTime()) / 86_400_000 !== 1) return false
  }
  return true
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function AccommodationCard({ doc }: { doc: DocumentItem }) {
  const firstNight = getFirstNightIso(doc)
  const checkout = getCheckoutIso(doc)
  const nightCount = getNightCount(doc)
  const consecutive = areConsecutive(doc)

  const location = typeof doc.data.location === 'string' ? doc.data.location : null
  const bookingUrl = typeof doc.data.bookingUrl === 'string' ? doc.data.bookingUrl : null
  const googleMapsUrl = typeof doc.data.googleMapsUrl === 'string' ? doc.data.googleMapsUrl : null
  const notes = typeof doc.data.notes === 'string' ? doc.data.notes : null

  const nights = doc.data.nights

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-orange-100 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900/60">
            <BedDouble
              className="h-5 w-5 text-orange-600 dark:text-orange-400"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{doc.title}</h2>
            {location && (
              <div className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{location}</span>
              </div>
            )}
          </div>
          {nightCount > 0 && (
            <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              {nightCount} {nightCount === 1 ? 'noche' : 'noches'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {firstNight && consecutive && checkout && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {shortDate(firstNight)} — {shortDate(checkout)}
            </span>
          </div>
        )}

        {firstNight && !consecutive && Array.isArray(nights) && (
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <div className="space-y-1">
              {(nights as string[]).map((n) => {
                const co = new Date(n)
                co.setUTCDate(co.getUTCDate() + 1)
                return (
                  <p key={n} className="font-medium text-gray-800 dark:text-gray-200">
                    {shortDate(n)} — {shortDate(co.toISOString().split('T')[0])}
                  </p>
                )
              })}
            </div>
          </div>
        )}

        {notes && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-slate-800 dark:text-gray-400">
            {notes}
          </p>
        )}

        {(bookingUrl ?? googleMapsUrl) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Ver en Booking
              </a>
            )}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
              >
                <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                Cómo llegar
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function Accommodations() {
  const navigate = useNavigate()
  const { documents, loading } = useDocuments()

  const accommodations = useMemo(
    () =>
      documents
        .filter((doc) => doc.type === 'accommodation')
        .sort((a, b) => getFirstNightIso(a).localeCompare(getFirstNightIso(b))),
    [documents]
  )

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loading label="Cargando alojamientos..." />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-400"
        aria-label="Volver"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alojamientos</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {accommodations.length} reservas · ordenadas por fecha
        </p>
      </div>

      {accommodations.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <BedDouble className="h-12 w-12 text-gray-300 dark:text-slate-600" aria-hidden="true" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay alojamientos guardados.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {accommodations.map((doc) => (
            <li key={doc.id}>
              <AccommodationCard doc={doc} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Accommodations
