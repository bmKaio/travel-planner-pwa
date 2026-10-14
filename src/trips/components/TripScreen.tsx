import '@fontsource-variable/geist'
import type { ReactNode } from 'react'

/** Root of every v2 screen: scopes the trip palette and the Geist font. */
function TripScreen({ children }: { children: ReactNode }) {
  return (
    <div className="trip-app min-h-screen-safe bg-trip-bg font-trip text-trip-ink">{children}</div>
  )
}

export default TripScreen
