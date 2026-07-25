import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react'
import { useDiary } from '../hooks/useDiary'
import type { DiaryEntry } from '../types'

interface TextSectionProps {
  title: string
  body?: string
}

function TextSection({ title, body }: TextSectionProps) {
  if (!body) return null
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      <p className="whitespace-pre-line text-sm text-gray-800 dark:text-gray-200">{body}</p>
    </section>
  )
}

function PlacesSection({ entry }: { entry: DiaryEntry }) {
  if (!entry.places?.length) return null
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Dónde estuve
      </h2>
      <ul className="space-y-2">
        {entry.places.map((place, i) => (
          <li key={`${place.name}-${i}`} className="flex items-center gap-2">
            <MapPin
              className="h-4 w-4 shrink-0 text-travel-blue-600 dark:text-travel-blue-300"
              aria-hidden="true"
            />
            {place.googleMapsUrl ? (
              <a
                href={place.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-travel-blue-700 hover:underline dark:text-travel-blue-300"
              >
                {place.name}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : (
              <span className="text-sm text-gray-800 dark:text-gray-200">{place.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function DiaryDetail() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const { getByDate, loading } = useDiary()
  const entry = date ? getByDate(date) : undefined

  if (loading) {
    return <p className="py-8 text-center text-sm text-gray-500">Cargando...</p>
  }

  if (!entry) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay entrada de diario para este día.
        </p>
        <button
          type="button"
          onClick={() => navigate('/diary')}
          className="inline-flex items-center gap-2 text-sm font-medium text-travel-blue-700 dark:text-travel-blue-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al diario
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <button
        type="button"
        onClick={() => navigate('/diary')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Diario
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{entry.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {entry.date}
          {entry.mood ? ` · ${entry.mood}` : ''}
          {entry.weather ? ` · ${entry.weather}` : ''}
        </p>
      </div>

      <PlacesSection entry={entry} />
      <TextSection title="Qué hice" body={entry.did} />
      <TextSection title="Qué comí" body={entry.ate} />
      <TextSection title="Momento destacado" body={entry.highlight} />
      <TextSection title="Recomendación del día" body={entry.recommendation} />
      <TextSection title="Notas / Reflexiones" body={entry.notes} />
    </div>
  )
}

export default DiaryDetail
