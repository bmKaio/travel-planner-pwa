import { MapPin } from 'lucide-react'
import type { Recommendation } from '../../types'
import {
  getRecommendationTypeConfig,
  getRecommendationPriorityConfig,
} from '../../utils/recommendations'

interface RecommendationCardProps {
  recommendation: Recommendation
  onClick?: () => void
}

function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const typeConfig = getRecommendationTypeConfig(recommendation.type)
  const priorityConfig = getRecommendationPriorityConfig(recommendation.priority)
  const TypeIcon = typeConfig.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-travel-blue-300 dark:border-slate-700 dark:bg-slate-900 sm:p-5"
      aria-label={`View details for ${recommendation.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${typeConfig.bgClass} ${typeConfig.textClass}`}
          >
            <TypeIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {recommendation.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeConfig.bgClass} ${typeConfig.textClass}`}
              >
                {typeConfig.label}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityConfig.bgClass} ${priorityConfig.textClass}`}
              >
                {priorityConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
        {recommendation.description}
      </p>

      {recommendation.location && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{recommendation.location.name}</span>
        </div>
      )}

      {recommendation.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recommendation.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600 dark:bg-slate-800 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

export default RecommendationCard
