import { MapPin, ChevronRight } from 'lucide-react'
import type { CityGroup, CityGroupId } from '../../utils/cities'

interface CitiesGridProps {
  groups: CityGroup[]
  onSelect: (cityId: CityGroupId) => void
}

function getThumbnail(group: CityGroup): string | undefined {
  return group.places.find((place) => place.images && place.images.length > 0)?.images?.[0]
}

function formatCount(count: number): string {
  return count === 1 ? '1 lugar' : `${count} lugares`
}

function CitiesGrid({ groups, onSelect }: CitiesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => {
        const thumbnail = getThumbnail(group)
        return (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelect(group.id)}
            className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-travel-blue-400 dark:border-slate-700 dark:bg-slate-900"
            aria-label={`Ver lugares de ${group.name}`}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-travel-blue-50 text-travel-blue-600 dark:bg-travel-blue-900/30 dark:text-travel-blue-300">
              {thumbnail ? (
                <img src={thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <MapPin className="h-7 w-7" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                {group.name}
              </h3>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {formatCount(group.places.length)}
              </p>
            </div>

            <ChevronRight
              className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}

export default CitiesGrid
