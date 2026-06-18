import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import type { Recommendation, RecommendationPriority, Place } from '../../types'

interface DayRecommendationsListProps {
  recommendations: Recommendation[]
  places: Place[]
}

const PRIORITY_CONFIG: Record<
  RecommendationPriority,
  {
    label: string
    color: string
    bg: string
    border: string
  }
> = {
  'must-see': {
    label: 'Imprescindible',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    border: 'border-rose-200 dark:border-rose-800',
  },
  'if-time': {
    label: 'Si hay tiempo',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    border: 'border-blue-200 dark:border-blue-800',
  },
  optional: {
    label: 'Opcional',
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
  },
}

export function DayRecommendationsList({ recommendations, places }: DayRecommendationsListProps) {
  const navigate = useNavigate()

  return (
    <ul className="space-y-3">
      {recommendations.map((recommendation) => {
        const config = PRIORITY_CONFIG[recommendation.priority]
        const linkedPlace = recommendation.location?.name
          ? places.find((p) =>
              p.name.toLowerCase().includes(recommendation.location!.name.toLowerCase())
            )
          : undefined

        const content = (
          <>
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {recommendation.title}
              </h4>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.bg} ${config.color} border ${config.border}`}
              >
                {config.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {recommendation.description}
            </p>
            {recommendation.location && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {recommendation.location.name}
              </div>
            )}
          </>
        )

        return (
          <li
            key={recommendation.id}
            className={`rounded-xl border ${config.border} ${config.bg} p-3`}
          >
            {linkedPlace ? (
              <button
                type="button"
                onClick={() => navigate(`/places/${linkedPlace.id}`)}
                className="w-full text-left"
                aria-label={`Ver ${recommendation.title}`}
              >
                {content}
              </button>
            ) : (
              <div>{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
