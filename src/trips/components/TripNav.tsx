import { NavLink } from 'react-router-dom'
import { CalendarDays, LifeBuoy, ListChecks, ListOrdered } from 'lucide-react'

// Relative links: TripNav renders inside the /trips/:tripId route.
const ITEMS = [
  { to: 'today', label: 'Hoy', icon: CalendarDays },
  { to: 'itinerary', label: 'Itinerario', icon: ListOrdered },
  { to: 'checklist', label: 'Checklist', icon: ListChecks },
  { to: 'help', label: 'Ayuda', icon: LifeBuoy },
]

function TripNav() {
  return (
    <nav
      aria-label="Secciones del viaje"
      className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-trip-line bg-trip-card"
    >
      <ul className="mx-auto flex max-w-md px-2">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `relative flex min-h-[62px] flex-col items-center justify-center gap-1 text-sm no-underline ${
                  isActive
                    ? 'font-bold text-trip-ink before:absolute before:inset-x-[22%] before:top-0 before:h-[3px] before:rounded-b before:bg-trip-ink'
                    : 'font-medium text-trip-muted'
                }`
              }
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TripNav
