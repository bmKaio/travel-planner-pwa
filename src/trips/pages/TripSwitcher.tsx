import { useMemo } from 'react'
import { TRIPS } from '../registry'
import { sortTripsForSwitcher } from '../domain/tripStatus'
import { toLocalIsoDate } from '../domain/dates'
import TripScreen from '../components/TripScreen'
import TripCard from '../components/TripCard'

function TripSwitcher() {
  const today = toLocalIsoDate(new Date())
  const { active, past } = useMemo(() => sortTripsForSwitcher(TRIPS, today), [today])

  return (
    <TripScreen>
      <main className="mx-auto flex max-w-md flex-col gap-6 px-5 pb-10 pt-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight">Mis viajes</h1>
          <p className="text-[17px] font-medium text-trip-ink2">Elige un viaje para abrirlo</p>
        </header>

        {active.length > 0 && (
          <section aria-labelledby="trips-active" className="flex flex-col gap-3">
            <h2 id="trips-active" className="text-xl font-bold">
              Próximos y en curso
            </h2>
            {active.map((trip) => (
              <TripCard key={trip.id} trip={trip} today={today} />
            ))}
          </section>
        )}

        {past.length > 0 && (
          <section aria-labelledby="trips-past" className="flex flex-col gap-3">
            <h2 id="trips-past" className="text-xl font-bold">
              Historial
            </h2>
            {past.map((trip) => (
              <TripCard key={trip.id} trip={trip} today={today} />
            ))}
          </section>
        )}
      </main>
    </TripScreen>
  )
}

export default TripSwitcher
