import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import type { Recommendation, RecommendationPriority, Place } from '../../types'

interface DailyRecommendationProps {
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
    label: 'Must-see',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    border: 'border-rose-200 dark:border-rose-800',
  },
  'if-time': {
    label: 'If time',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    border: 'border-blue-200 dark:border-blue-800',
  },
  optional: {
    label: 'Optional',
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
  },
}

export function DailyRecommendation({ recommendations, places }: DailyRecommendationProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(true)

  if (recommendations.length === 0) return null

  const handleClick = (recommendation: Recommendation) => {
    const place = recommendation.location?.name
      ? places.find((p) =>
          p.name.toLowerCase().includes(recommendation.location!.name.toLowerCase())
        )
      : undefined

    if (place) {
      navigate(`/places/${place.id}`)
    }
  }

  return (
    <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={expanded}
        aria-label="Recommendations"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900/40">
            <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recommendations</h3>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <ul className="mt-3 space-y-3">
          {recommendations.map((recommendation) => {
            const config = PRIORITY_CONFIG[recommendation.priority]
            const hasLink =
              recommendation.location?.name &&
              places.some((p) =>
                p.name.toLowerCase().includes(recommendation.location!.name.toLowerCase())
              )

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
                {hasLink ? (
                  <button
                    type="button"
                    onClick={() => handleClick(recommendation)}
                    className="w-full text-left"
                    aria-label={`View ${recommendation.title}`}
                  >
                    {content}
                  </button>
                ) : (
                  <div className="w-full">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
