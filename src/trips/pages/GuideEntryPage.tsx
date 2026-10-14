import { useMemo } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { useTripDays } from '../hooks/useTripDays'
import {
  guideBackTarget,
  guideCategoryLabel,
  guideDayLinks,
  readFromDay,
  sourceLabel,
} from '../domain/guide'
import BackLink from '../components/BackLink'
import { GUIDE_TOPIC_STYLE } from '../components/guideTopicStyle'
import TripStatusMessage from '../components/TripStatusMessage'

function GuideEntryPage() {
  const trip = useTrip()
  const { entryKey } = useParams<{ entryKey: string }>()
  const location = useLocation()
  const guide = useGuide(trip.id)
  const { days, loading: daysLoading } = useTripDays(trip.id)
  const entry = guide.entries.find((candidate) => candidate.key === entryKey)
  const dayLinks = useMemo(() => guideDayLinks(entry?.dates, days), [entry, days])
  const dayDates = useMemo(() => days.map((day) => day.date), [days])
  const tripPath = `/trips/${trip.id}`
  const guidePath = `${tripPath}/guide`

  if (guide.error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  // Wait for the days too, so the back button does not switch from topic to day after loading.
  if (guide.loading || daysLoading) return <TripStatusMessage message="Cargando la guía…" />
  // Unknown key (typo, or removed in a later content version): back to the list.
  if (!entry) return <Navigate to={guidePath} replace />

  const back = guideBackTarget(entry.category, readFromDay(location.state), dayDates)
  const topic = GUIDE_TOPIC_STYLE[entry.category]
  const TopicIcon = topic.icon

  return (
    <article className="flex flex-col gap-[18px]">
      <BackLink to={`${tripPath}/${back.path}`} label={back.label} />

      <header className="flex flex-col gap-2">
        <Link
          to={`${guidePath}/topic/${entry.category}`}
          className={`inline-flex min-h-[40px] items-center gap-2 self-start rounded-full px-3 text-sm font-bold uppercase tracking-wider text-trip-ink no-underline ${topic.soft}`}
        >
          <TopicIcon className={`h-4 w-4 ${topic.ink}`} aria-hidden="true" />
          {guideCategoryLabel(entry.category)}
        </Link>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">{entry.title}</h1>
      </header>

      <div className="flex max-w-prose flex-col gap-3">
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
                  to={`${tripPath}/itinerary/${link.date}`}
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
