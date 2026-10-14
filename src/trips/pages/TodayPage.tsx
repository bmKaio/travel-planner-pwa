import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTrip } from '../hooks/useTrip'
import { useTripDays } from '../hooks/useTripDays'
import { useNow } from '../hooks/useNow'
import { computeNow, formatBanner, resolveTodayView } from '../domain/today'
import { formatDayHeading } from '../domain/dates'
import { freeTimeIdeas } from '../domain/itinerary'
import { planItemUrl } from '../domain/mapsUrl'
import { NO_STAY_TEXT } from '../domain/stayCopy'
import PageHeader from '../components/PageHeader'
import NowCard from '../components/NowCard'
import PlanList from '../components/PlanList'
import StayCard from '../components/StayCard'
import LegList from '../components/LegList'
import TripStatusMessage from '../components/TripStatusMessage'
import SectionHeading from '../components/SectionHeading'
import { tripButtonClass } from '../components/buttonStyles'

function TodayPage() {
  const trip = useTrip()
  const { days, loading, error } = useTripDays(trip.id)
  const now = useNow()
  const view = useMemo(
    () =>
      resolveTodayView(
        days.map((d) => d.date),
        now
      ),
    [days, now]
  )

  if (error)
    return <TripStatusMessage tone="error" message="No se pudieron cargar los datos del viaje." />
  if (loading) return <TripStatusMessage message="Cargando el viaje…" />
  const day = days[view.dayIndex]
  if (!day) return <TripStatusMessage message="Este viaje todavía no tiene días planificados." />

  const banner = formatBanner(view.banner)
  const current = view.nowMinutes === null ? null : computeNow(day.plan, view.nowMinutes)
  const ideas = {
    names: freeTimeIdeas(day.see),
    to: `/trips/${trip.id}/itinerary/${day.date}?tab=see`,
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Hoy" subtitle={formatDayHeading(view.dayIndex, days.length, day.date)} />

      {banner && (
        <p
          role="status"
          className="rounded-2xl bg-trip-action-soft px-4 py-3 text-base font-semibold text-trip-action"
        >
          {banner}
        </p>
      )}

      {current?.item ? (
        <>
          <NowCard
            label={current.label}
            range={current.item.range}
            title={current.item.title}
            place={current.item.place}
            url={planItemUrl(current.item)}
            ideas={current.item.free ? ideas : undefined}
          />
          <section className="flex flex-col gap-2.5">
            <SectionHeading section="plan">Resto del día</SectionHeading>
            <PlanList items={current.rest} emptyText="No hay más actividades hoy." ideas={ideas} />
            <Link
              to={`/trips/${trip.id}/itinerary/${day.date}?tab=eat`}
              className={tripButtonClass('ghost', 'self-start')}
            >
              Ver dónde comer y qué visitar hoy
            </Link>
          </section>
        </>
      ) : (
        <section className="flex flex-col gap-2.5">
          <SectionHeading section="plan">Plan del día</SectionHeading>
          <PlanList items={day.plan} emptyText="No hay actividades planificadas." ideas={ideas} />
        </section>
      )}

      <section className="flex flex-col gap-2.5">
        <SectionHeading section="stay">Esta noche duermes en</SectionHeading>
        {day.stay ? (
          <StayCard stay={day.stay} />
        ) : (
          <p className="text-base text-trip-muted">{NO_STAY_TEXT}</p>
        )}
      </section>

      {day.legs.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <SectionHeading section="leg">Transporte de hoy</SectionHeading>
          <LegList legs={day.legs} />
        </section>
      )}
    </div>
  )
}

export default TodayPage
