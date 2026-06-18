import { memo } from 'react'
import type { TripMeta } from '../../types'
import { getTripStatus, formatCountdownDays } from '../../utils/dashboard'

interface TripCountdownProps {
  trip: TripMeta
}

function TripCountdown({ trip }: TripCountdownProps) {
  const status = getTripStatus(trip.startDate, trip.endDate)

  const containerClasses = {
    before: 'bg-gradient-to-br from-travel-blue-600 to-travel-blue-800 text-white',
    during: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white',
    after: 'bg-gradient-to-br from-slate-500 to-slate-700 text-white',
  }

  const progressColor = {
    before: 'bg-white/30',
    during: 'bg-white/30',
    after: 'bg-white/20',
  }

  return (
    <section
      className={`relative overflow-hidden rounded-2xl p-5 shadow-md sm:p-6 ${containerClasses[status.phase]}`}
      aria-label="Estado del viaje"
    >
      <div className="relative z-10">
        {status.phase === 'before' && (
          <>
            <p className="text-sm font-medium opacity-90">Faltan para el viaje</p>
            <div className="mt-1 flex flex-col items-start">
              <span className="text-5xl font-bold leading-none tracking-tight sm:text-6xl">
                {status.daysUntilStart}
              </span>
              <span className="text-lg font-medium opacity-90">
                {formatCountdownDays(status.daysUntilStart)}
              </span>
            </div>
            <p className="mt-2 text-sm opacity-80">Salida el {trip.startDate}</p>
          </>
        )}

        {status.phase === 'during' && (
          <>
            <p className="text-sm font-medium opacity-90">Estamos de viaje</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight sm:text-6xl">
                Día {status.currentDay}
              </span>
              <span className="text-lg font-medium opacity-90">de {status.totalDays}</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor[status.phase]}`}
                style={{ width: `${status.progress}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-xs opacity-80">{Math.round(status.progress)}% completado</p>
          </>
        )}

        {status.phase === 'after' && (
          <>
            <p className="text-sm font-medium opacity-90">Viaje finalizado</p>
            <div className="mt-1">
              <span className="text-4xl font-bold tracking-tight sm:text-5xl">
                ¡Viaje completado!
              </span>
            </div>
            <p className="mt-2 text-sm opacity-80">{trip.route.join(' · ')}</p>
          </>
        )}
      </div>
    </section>
  )
}

export default memo(TripCountdown)
