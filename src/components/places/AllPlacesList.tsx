import { useMemo, useState } from 'react'
import { List } from 'lucide-react'
import type { Place, PlaceCategory } from '../../types'
import { FILTER_CATEGORIES, getCategoryConfig } from '../../utils/places'
import { CITIES, nearestCityId } from '../../utils/cities'

interface AllPlacesListProps {
  places: Place[]
  onSelect: (place: Place) => void
}

function cityLabel(place: Place): string {
  const cityId = nearestCityId(place)
  if (!cityId) return 'Otros'
  return CITIES.find((city) => city.id === cityId)?.name ?? 'Otros'
}

function AllPlacesList({ places, onSelect }: AllPlacesListProps) {
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | 'all'>('all')

  const filteredPlaces = useMemo(() => {
    if (categoryFilter === 'all') return places
    return places.filter((place) => place.category === categoryFilter)
  }, [places, categoryFilter])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <List className="h-4 w-4 text-gray-400" aria-hidden="true" />
          Todos los lugares
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-gray-300">
            {filteredPlaces.length}
          </span>
        </h2>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PlaceCategory | 'all')}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          aria-label="Filtrar todos los lugares por categoria"
        >
          <option value="all">Todas las categorias</option>
          {FILTER_CATEGORIES.map((cat) => {
            const config = getCategoryConfig(cat)
            return (
              <option key={cat} value={cat}>
                {config.label}
              </option>
            )
          })}
        </select>
      </div>

      {filteredPlaces.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:text-gray-400">
          No hay lugares con esta categoria.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
          {filteredPlaces.map((place) => {
            const config = getCategoryConfig(place.category)
            const Icon = config.icon
            return (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onSelect(place)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bgClass}`}
                  >
                    <Icon className={`h-4 w-4 ${config.textClass}`} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                      {place.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {cityLabel(place)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AllPlacesList
