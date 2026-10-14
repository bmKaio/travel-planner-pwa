import { useMemo } from 'react'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { guideTopics } from '../domain/guide'
import PageHeader from '../components/PageHeader'
import GuideTopicCard from '../components/GuideTopicCard'
import TripStatusMessage from '../components/TripStatusMessage'

function GuidePage() {
  const trip = useTrip()
  const { entries, loading, error } = useGuide(trip.id)
  const topics = useMemo(() => guideTopics(entries), [entries])

  if (error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  if (loading) return <TripStatusMessage message="Cargando la guía…" />

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Guía" subtitle={trip.name} />
      {topics.length === 0 ? (
        <TripStatusMessage message="Este viaje todavía no tiene guía." />
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {topics.map((topic) => (
            <li key={topic.category}>
              <GuideTopicCard topic={topic} tripId={trip.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GuidePage
