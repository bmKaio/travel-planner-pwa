import { Navigate } from 'react-router-dom'
import { TRIPS } from '../registry'
import { resolveLandingTarget } from '../domain/landing'
import { getBrowserStorage, readLastTripId } from '../domain/lastTrip'
import { toLocalIsoDate } from '../domain/dates'

/** `/` (the PWA start_url): opens the most relevant trip. */
function LandingRedirect() {
  const target = resolveLandingTarget(
    TRIPS,
    readLastTripId(getBrowserStorage()),
    toLocalIsoDate(new Date())
  )
  return <Navigate to={target} replace />
}

export default LandingRedirect
