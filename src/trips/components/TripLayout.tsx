import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
import TripScreen from './TripScreen'
import TripNav from './TripNav'

interface TripLayoutProps {
  tripName: string
  children: ReactNode
}

function TripLayout({ tripName, children }: TripLayoutProps) {
  return (
    <TripScreen>
      <header className="safe-top sticky top-0 z-20 border-b border-trip-line bg-trip-card">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-3 px-5">
          <p className="truncate text-base font-semibold">{tripName}</p>
          <Link
            to="/trips"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-semibold text-trip-action no-underline hover:bg-trip-action-soft"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Viajes
          </Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-md px-5 pb-28 pt-5" tabIndex={-1}>
        {children}
      </main>
      <TripNav />
    </TripScreen>
  )
}

export default TripLayout
