import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { useTripDays } from '../hooks/useTripDays'
import { guideCategoryLabel, guideDayLinks, sourceLabel } from '../domain/guide'
import TripStatusMessage from '../components/TripStatusMessage'

function GuideEntryPage() {
  const trip = useTrip()
  const { entryKey } = useParams<{ entryKey: string }>()
  const guide = useGuide(trip.id)
  const { days } = useTripDays(trip.id)
  const entry = guide.entries.find((candidate) => candidate.key === entryKey)
  const dayLinks = useMemo(() => guideDayLinks(entry?.dates, days), [entry, days])
  const guidePath = `/trips/${trip.id}/guide`

  if (guide.error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  if (guide.loading) return <TripStatusMessage message="Cargando la guía…" />
  // Unknown key (typo, or removed in a later content version): back to the list.
  if (!entry) return <Navigate to={guidePath} replace />

  return (
    <article className="flex flex-col gap-[18px]">
      <Link
        to={guidePath}
        className="flex items-center gap-1 self-start text-base font-semibold text-trip-ink2 no-underline"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        Guía
      </Link>

      <header className="flex flex-col gap-1">
        <p className="text-sm font-bold uppercase tracking-wider text-trip-muted">
          {guideCategoryLabel(entry.category)}
        </p>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">{entry.title}</h1>
      </header>

      <div className="flex flex-col gap-3">
        {entry.body.map((paragraph, index) => (
          <p key={index} className="text-[17px] leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {dayLinks.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">Días del viaje</h2>
          <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
            {dayLinks.map((link) => (
              <li key={link.date} className="border-t border-trip-line first:border-t-0">
                <Link
                  to={`/trips/${trip.id}/itinerary/${link.date}`}
                  className="flex items-center gap-3 py-4 text-base font-semibold text-trip-ink no-underline"
                >
                  <span className="flex-1">{link.label}</span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-trip-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="flex flex-col gap-1 text-sm text-trip-muted">
        <p className="font-semibold">Fuentes</p>
        <ul className="flex flex-col gap-1">
          {entry.sources.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="break-all">
                {sourceLabel(url)}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  )
}

export default GuideEntryPage
