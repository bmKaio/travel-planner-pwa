import { lazy, Suspense, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Map, List, Plus, Search, X } from 'lucide-react'
import { usePlaces } from '../hooks/usePlaces'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import PlaceCard from '../components/places/PlaceCard'
import PlaceForm from '../components/places/PlaceForm'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import type { Place, PlaceCategory } from '../types'
import { FILTER_CATEGORIES, getCategoryConfig } from '../utils/places'

const MapView = lazy(() => import('../components/places/MapView'))

type ViewMode = 'map' | 'list'

function Places() {
  const { places, loading, create, update, remove } = usePlaces()
  const location = useLocation()
  const [view, setView] = useState<ViewMode>('map')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | 'all'>(
    (location.state as { category?: PlaceCategory } | null)?.category ?? 'all'
  )
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [deletePlace, setDeletePlace] = useState<Place | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const filteredPlaces = useMemo(() => {
    const query = search.trim().toLowerCase()
    return places.filter((place) => {
      const matchesCategory = categoryFilter === 'all' || place.category === categoryFilter
      const matchesSearch =
        !query ||
        place.name.toLowerCase().includes(query) ||
        place.description.toLowerCase().includes(query) ||
        place.location.name.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [places, search, categoryFilter])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const toast: Toast = { id: crypto.randomUUID(), message, type }
    setToasts((prev) => [...prev, toast])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const handleCenterPlace = (place: Place) => {
    setFocusedPlaceId(place.id)
    setView('map')
  }

  const handleEdit = (place: Place) => {
    setEditingPlace(place)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingPlace(null)
    setIsFormOpen(true)
  }

  const handleSave = async (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPlace) {
      await update(editingPlace.id, data)
      addToast('Place updated', 'success')
    } else {
      await create(data)
      addToast('Place added', 'success')
    }
  }

  const handleDelete = async () => {
    if (!deletePlace) return
    try {
      await remove(deletePlace.id)
      addToast('Place deleted', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to delete place', 'error')
    } finally {
      setDeletePlace(null)
    }
  }

  const clearSearch = () => setSearch('')

  const emptyState = (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <Map className="h-10 w-10 text-gray-400" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
        {search || categoryFilter !== 'all' ? 'No places match your filters' : 'No places yet'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {search || categoryFilter !== 'all'
          ? 'Try adjusting your search or filters.'
          : 'Start building your travel map by adding your first place.'}
      </p>
      {!search && categoryFilter === 'all' && (
        <Button onClick={handleAdd} className="mt-4 px-4 py-2.5 text-sm">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Add your first place
        </Button>
      )}
    </div>
  )

  if (loading) {
    return <Loading fullScreen label="Cargando lugares..." />
  }

  return (
    <div className="relative space-y-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Places</h1>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-gray-300">
            {filteredPlaces.length}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'map'
                ? 'bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
            }`}
            aria-pressed={view === 'map'}
            aria-label="Map view"
          >
            <Map className="h-3.5 w-3.5" aria-hidden="true" />
            Map
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'list'
                ? 'bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
            }`}
            aria-pressed={view === 'list'}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" aria-hidden="true" />
            List
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search places..."
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-9 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            aria-label="Search places"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PlaceCategory | 'all')}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
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

      {view === 'map' ? (
        <div className="h-[calc(100vh-120px)] w-full">
          {filteredPlaces.length === 0 ? (
            emptyState
          ) : (
            <Suspense fallback={<Loading label="Cargando mapa..." />}>
              <MapView places={filteredPlaces} focusedPlaceId={focusedPlaceId} />
            </Suspense>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlaces.length === 0
            ? emptyState
            : filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onCenter={handleCenterPlace}
                  onEdit={handleEdit}
                  onDelete={setDeletePlace}
                />
              ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-travel-blue-600 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-travel-blue-400 active:scale-95 sm:bottom-24 sm:right-6"
        aria-label="Add place"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

      <PlaceForm
        place={editingPlace ?? undefined}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={Boolean(deletePlace)}
        title="Delete place"
        message={
          deletePlace
            ? `Are you sure you want to delete "${deletePlace.name}"? This action cannot be undone.`
            : ''
        }
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletePlace(null)}
      />
    </div>
  )
}

export default Places
