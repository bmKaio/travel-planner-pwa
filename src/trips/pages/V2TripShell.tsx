import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import type { TripMeta } from '../types'
import type { TripOutletContext } from '../hooks/useTrip'
import { useTripContent } from '../hooks/useTripContent'
import { useRecordLastTrip } from '../hooks/useRecordLastTrip'
import TripLayout from '../components/TripLayout'
import TripStatusMessage from '../components/TripStatusMessage'

function V2TripShell({ trip }: { trip: TripMeta }) {
  useRecordLastTrip(trip.id)
  const { ready, error, retry } = useTripContent(trip.id)
  const context: TripOutletContext = { trip }

  return (
    <TripLayout tripName={trip.name}>
      {error ? (
        <TripStatusMessage
          message="No se pudieron cargar los datos del viaje."
          actionLabel="Reintentar"
          onAction={retry}
        />
      ) : !ready ? (
        <TripStatusMessage message="Cargando el viaje…" />
      ) : (
        <Suspense fallback={<TripStatusMessage message="Cargando…" />}>
          <Outlet context={context} />
        </Suspense>
      )}
    </TripLayout>
  )
}

export default V2TripShell
