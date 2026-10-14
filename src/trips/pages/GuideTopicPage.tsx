import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { guideCategoryLabel, guideTopicEntries, isGuideCategory } from '../domain/guide'
import BackLink from '../components/BackLink'
import GuideTopicIcon from '../components/GuideTopicIcon'
import GuideTopicList from '../components/GuideTopicList'
import TripStatusMessage from '../components/TripStatusMessage'

function GuideTopicPage() {
  const trip = useTrip()
  const { category } = useParams<{ category: string }>()
  const { entries, loading, error } = useGuide(trip.id)
  const topicEntries = useMemo(
    () => (isGuideCategory(category) ? guideTopicEntries(entries, category) : []),
    [entries, category]
  )
  const guidePath = `/trips/${trip.id}/guide`

  if (error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  if (loading) return <TripStatusMessage message="Cargando la guía…" />
  // Unknown or empty topic (typo, or content changed): back to the hub.
  if (!isGuideCategory(category) || topicEntries.length === 0) {
    return <Navigate to={guidePath} replace />
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <BackLink to={guidePath} label="Guía" />
      <header className="flex items-center gap-3">
        <GuideTopicIcon category={category} />
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">
          {guideCategoryLabel(category)}
        </h1>
      </header>
      <GuideTopicList entries={topicEntries} category={category} tripId={trip.id} />
    </div>
  )
}

export default GuideTopicPage
