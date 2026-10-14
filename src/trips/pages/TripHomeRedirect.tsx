import { Navigate, useParams } from 'react-router-dom'

/** Index and unknown sub-routes of a v2 trip go to its "Hoy" screen (absolute, no loops). */
function TripHomeRedirect() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  return <Navigate to={`/trips/${tripId}/today`} replace />
}

export default TripHomeRedirect
