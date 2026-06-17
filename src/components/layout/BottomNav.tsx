import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, CalendarDays, Map, MoreHorizontal } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/pre-travel', label: 'Pre-viaje', icon: ClipboardList },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/places', label: 'Lugares', icon: Map },
  { to: '/settings', label: 'Más', icon: MoreHorizontal },
]

function BottomNav() {
  return (
    <nav
      className="safe-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:border-gray-700 dark:bg-slate-900"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-md justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors sm:py-3 sm:text-xs ${
                  isActive
                    ? 'text-travel-blue-700 dark:text-travel-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`
              }
              aria-current={undefined}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`rounded-lg p-1.5 transition-colors ${
                      isActive ? 'bg-travel-blue-50 dark:bg-travel-blue-900/30' : ''
                    }`}
                  >
                    <Icon
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      aria-hidden="true"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNav
