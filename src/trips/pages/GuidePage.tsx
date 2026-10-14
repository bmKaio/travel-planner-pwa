import { useMemo } from 'react'
import { useTrip } from '../hooks/useTrip'
import { useGuide } from '../hooks/useGuide'
import { groupGuide } from '../domain/guide'
import PageHeader from '../components/PageHeader'
import GuideCardList from '../components/GuideCardList'
import TripStatusMessage from '../components/TripStatusMessage'

function GuidePage() {
  const trip = useTrip()
  const { entries, loading, error } = useGuide(trip.id)
  const sections = useMemo(() => groupGuide(entries), [entries])

  if (error) return <TripStatusMessage tone="error" message="No se pudo cargar la guía." />
  if (loading) return <TripStatusMessage message="Cargando la guía…" />

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Guía" subtitle={trip.name} />
      {sections.length === 0 && <TripStatusMessage message="Este viaje todavía no tiene guía." />}
      {sections.map((section) => (
        <section key={section.category} className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">{section.label}</h2>
          <GuideCardList entries={section.entries} tripId={trip.id} />
        </section>
      ))}
    </div>
  )
}

export default GuidePage
