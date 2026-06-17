import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Calendar, MapPin, Compass, Clock } from 'lucide-react'
import type { ActivityItem } from '../../utils/dashboard'
import { formatTimeAgo } from '../../utils/dashboard'

interface RecentActivityProps {
  items: ActivityItem[]
}

const typeConfig = {
  document: {
    label: 'Documento',
    icon: FileText,
    color:
      'bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300',
  },
  event: {
    label: 'Evento',
    icon: Calendar,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  place: {
    label: 'Lugar',
    icon: MapPin,
    color:
      'bg-travel-amber-100 text-travel-amber-700 dark:bg-travel-amber-900/40 dark:text-travel-amber-300',
  },
  recommendation: {
    label: 'Recomendación',
    icon: Compass,
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
}

function RecentActivity({ items }: RecentActivityProps) {
  const navigate = useNavigate()

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6"
      aria-label="Actividad reciente"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad reciente</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">No hay actividad reciente</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => {
            const config = typeConfig[item.type]
            const Icon = config.icon

            return (
              <li key={`${item.type}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => navigate(item.link)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                  aria-label={`${config.label}: ${item.title}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatTimeAgo(item.date)}
                      <span className="text-gray-300 dark:text-slate-600">·</span>
                      {config.label}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default memo(RecentActivity)
