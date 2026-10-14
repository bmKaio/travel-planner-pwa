import { Navigate, useParams } from 'react-router-dom'
import { TRIPS } from '../registry'
import { resolveTripRoute } from '../domain/landing'
import TripErrorBoundary from '../components/TripErrorBoundary'
import V2TripShell from './V2TripShell'

/** `/trips/:tripId/*`: unknown ids → switcher, legacy ids → their legacy home. */
function TripShell() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  const route = resolveTripRoute(TRIPS, tripId)
  if (route.kind === 'redirect') return <Navigate to={route.to} replace />
  // Keyed by trip so switching trips never shows (or keeps a failed state of) the previous one.
  return (
    <TripErrorBoundary key={route.trip.id}>
      <V2TripShell key={route.trip.id} trip={route.trip} />
    </TripErrorBoundary>
  )
}

export default TripShell
