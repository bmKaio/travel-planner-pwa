import { useMemo } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTrip } from '../hooks/useTrip'
import { useTripDays } from '../hooks/useTripDays'
import { useNow } from '../hooks/useNow'
import { resolveTodayView } from '../domain/today'
import { formatDayHeading, toLocalIsoDate } from '../domain/dates'
import {
  buildDayStrip,
  ITINERARY_TABS,
  parseItineraryTab,
  resolveSelectedDate,
  tabId,
  tabPanelId,
} from '../domain/itinerary'
import PageHeader from '../components/PageHeader'
import DayStrip from '../components/DayStrip'
import StayRow from '../components/StayRow'
import TabBar from '../components/TabBar'
import PlanList from '../components/PlanList'
import EatList from '../components/EatList'
import SeeList from '../components/SeeList'
import LegList from '../components/LegList'
import TripStatusMessage from '../components/TripStatusMessage'

function ItineraryPage() {
  const trip = useTrip()
  const { date: requestedDate } = useParams<{ date?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { days, loading, error } = useTripDays(trip.id)
  const now = useNow()
  const dates = useMemo(() => days.map((d) => d.date), [days])
  const todayView = useMemo(() => resolveTodayView(dates, now), [dates, now])
  const tab = parseItineraryTab(searchParams.get('tab'))

  if (error) return <TripStatusMessage message="No se pudieron cargar los datos del viaje." />
  if (loading) return <TripStatusMessage message="Cargando el viaje…" />
  if (days.length === 0) {
    return <TripStatusMessage message="Este viaje todavía no tiene días planificados." />
  }

  const base = `/trips/${trip.id}/itinerary`
  const selectedDate = resolveSelectedDate(dates, requestedDate, todayView.dayIndex)
  if (selectedDate === null) return <Navigate to={base} replace />

  const index = dates.indexOf(selectedDate)
  const day = days[index]
  const todayIndex = Math.max(todayView.dayIndex, 0)

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Itinerario"
        subtitle={formatDayHeading(todayIndex, days.length, dates[todayIndex])}
      />
      <DayStrip
        items={buildDayStrip(dates, selectedDate, toLocalIsoDate(now))}
        onSelect={(date) => navigate(`${base}/${date}?tab=${tab}`)}
      />

      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-trip-muted">
          {formatDayHeading(index, days.length, day.date)}
        </p>
        <h2 className="text-2xl font-bold leading-tight">{day.title}</h2>
        <p className="text-base text-trip-ink2">{day.cities.join(' → ')}</p>
      </div>

      <StayRow stay={day.stay} />

      <TabBar
        tabs={ITINERARY_TABS}
        active={tab}
        onChange={(next) => setSearchParams({ tab: next }, { replace: true })}
      />
      <div role="tabpanel" id={tabPanelId(tab)} aria-labelledby={tabId(tab)}>
        {tab === 'plan' && (
          <PlanList items={day.plan} emptyText="No hay actividades planificadas." />
        )}
        {tab === 'eat' && <EatList items={day.eat} />}
        {tab === 'see' && <SeeList items={day.see} />}
      </div>

      {day.legs.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">Transporte</h2>
          <LegList legs={day.legs} />
        </section>
      )}
    </div>
  )
}

export default ItineraryPage
