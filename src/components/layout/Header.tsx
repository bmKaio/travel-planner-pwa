import { MapPin, Wifi, WifiOff } from 'lucide-react'
import { useOfflineStatus } from '../../hooks/useOfflineStatus'

function Header() {
  const { isOnline } = useOfflineStatus()

  return (
    <header className="safe-top sticky top-0 z-30 bg-travel-blue-800 text-white shadow-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-travel-amber-300" aria-hidden="true" />
          <h1 className="text-base font-semibold tracking-tight sm:text-lg">Travel Planner</h1>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            isOnline ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-white/90'
          }`}
          aria-live="polite"
          aria-label={isOnline ? 'Conexión disponible' : 'Modo offline'}
        >
          {isOnline ? (
            <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
