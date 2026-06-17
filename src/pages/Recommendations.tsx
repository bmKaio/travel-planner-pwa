import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { useRecommendations } from '../hooks/useRecommendations'
import type { Recommendation, RecommendationPriority, RecommendationType } from '../types'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import RecommendationCard from '../components/recommendations/RecommendationCard'
import RecommendationForm from '../components/recommendations/RecommendationForm'
import { ToastContainer, type Toast } from '../components/common/Toast'
import {
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_TYPES,
  getRecommendationPriorityConfig,
} from '../utils/recommendations'

type TypeFilter = RecommendationType | 'all'
type PriorityFilter = RecommendationPriority | 'all'

function Recommendations() {
  const navigate = useNavigate()
  const { recommendations, loading, create } = useRecommendations()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const toast: Toast = { id: crypto.randomUUID(), message, type }
    setToasts((prev) => [...prev, toast])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const filteredRecommendations = useMemo(() => {
    let result = [...recommendations]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter((r) => r.type === typeFilter)
    }

    if (priorityFilter !== 'all') {
      result = result.filter((r) => r.priority === priorityFilter)
    }

    result.sort((a, b) => {
      const priorityOrder = {
        'must-see': 1,
        'if-time': 2,
        optional: 3,
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    return result
  }, [recommendations, searchQuery, typeFilter, priorityFilter])

  const activeFiltersCount = (typeFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setPriorityFilter('all')
  }

  const handleSave = async (data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await create(data)
    addToast('Recommendation added', 'success')
    navigate(`/recommendations/${id}`)
  }

  if (loading) {
    return <Loading fullScreen label="Cargando recomendaciones..." />
  }

  return (
    <div className="space-y-4 pb-20">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Recommendations</h1>
        <span className="rounded-full bg-travel-blue-100 px-2.5 py-1 text-xs font-semibold text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300">
          {recommendations.length}
        </span>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recommendations..."
          className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-9 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          aria-label="Search recommendations"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-travel-blue-100 px-1.5 py-0.5 text-[10px] text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-travel-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200"
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {RECOMMENDATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-travel-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200"
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          {RECOMMENDATION_PRIORITIES.map((priority) => {
            const config = getRecommendationPriorityConfig(priority)
            return (
              <option key={priority} value={priority}>
                {config.label}
              </option>
            )
          })}
        </select>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-300"
          >
            Clear
          </button>
        )}
      </div>

      {recommendations.length === 0 ? (
        <Card className="text-center">
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-travel-blue-50 dark:bg-travel-blue-900/30">
              <SlidersHorizontal className="h-7 w-7 text-travel-blue-500" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                No recommendations yet
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Add your first recommendation to keep track of restaurants, activities, and places.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="mt-2 px-4 py-2.5 text-sm">
              Add your first recommendation
            </Button>
          </div>
        </Card>
      ) : filteredRecommendations.length === 0 ? (
        <Card className="text-center">
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800">
              <Search className="h-7 w-7 text-gray-500" aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              No recommendations match your filters
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Try changing your search or filters.
            </p>
            <Button variant="secondary" onClick={clearFilters} className="mt-2 px-4 py-2.5 text-sm">
              Clear filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onClick={() => navigate(`/recommendations/${recommendation.id}`)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-travel-blue-600 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-travel-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        aria-label="Add recommendation"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

      <RecommendationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />
    </div>
  )
}

export default Recommendations
