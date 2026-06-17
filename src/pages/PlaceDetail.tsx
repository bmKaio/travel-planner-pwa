import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Share2,
  MapPin,
  ExternalLink,
  Clock,
  Lightbulb,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { usePlaces } from '../hooks/usePlaces'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import PlaceForm from '../components/places/PlaceForm'
import { getCategoryConfig, formatCoordinates, getGoogleMapsUrl } from '../utils/places'

function PlaceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { places, loading, remove, update } = usePlaces()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const place = useMemo(() => places.find((p) => p.id === id), [places, id])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const toast: Toast = { id: crypto.randomUUID(), message, type }
    setToasts((prev) => [...prev, toast])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      addToast('Link copied to clipboard', 'success')
    } catch {
      addToast('Could not copy link', 'error')
    }
  }

  const handleDelete = async () => {
    if (!place) return
    try {
      await remove(place.id)
      setShowDeleteConfirm(false)
      navigate('/places')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to delete place', 'error')
    }
  }

  if (loading) {
    return <Loading fullScreen label="Cargando lugar..." />
  }

  if (!place) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/places')}
          className="px-3 py-2 text-xs"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <Card>
          <p className="text-gray-600 dark:text-gray-300">Place not found.</p>
        </Card>
      </div>
    )
  }

  const config = getCategoryConfig(place.category)
  const CategoryIcon = config.icon
  return (
    <div className="space-y-4 pb-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={() => navigate('/places')}
          className="px-3 py-2 text-xs"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl border border-gray-300 bg-white p-2.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
            aria-label="Share place"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl border border-gray-300 bg-white p-2.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
            aria-label="Edit place"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-700 shadow-sm hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-rose-900/40 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
            aria-label="Delete place"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.bgClass} ${config.textClass}`}
          >
            <CategoryIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.bgClass} ${config.textClass}`}
            >
              {config.label}
            </span>
            <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{place.name}</h1>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {place.description}
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="primary"
            className="px-4 py-2.5 text-sm"
            onClick={() => window.open(getGoogleMapsUrl(place), '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
            Open in Google Maps
          </Button>
          <Button
            variant="secondary"
            className="px-4 py-2.5 text-sm"
            onClick={() => navigate('/places')}
          >
            <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
            View on map
          </Button>
        </div>
      </Card>

      <Card title="Location">
        <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
          <div>
            <p className="font-medium">{place.location.name}</p>
            {place.location.address && <p>{place.location.address}</p>}
            <p className="text-gray-500 dark:text-gray-400">
              {formatCoordinates(place.location.lat, place.location.lng)}
            </p>
          </div>
        </div>
      </Card>

      {place.openingHours && (
        <Card title="Opening hours">
          <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <p>{place.openingHours}</p>
          </div>
        </Card>
      )}

      {place.tips && place.tips.length > 0 && (
        <Card title="Tips">
          <ul className="space-y-2">
            {place.tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0 text-travel-amber-500"
                  aria-hidden="true"
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {place.funFacts && place.funFacts.length > 0 && (
        <Card title="Fun facts">
          <ul className="space-y-2">
            {place.funFacts.map((fact, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-travel-teal-500"
                  aria-hidden="true"
                />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {place.culturalContext && (
        <Card title="Cultural context">
          <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <p className="whitespace-pre-wrap leading-relaxed">{place.culturalContext}</p>
          </div>
        </Card>
      )}

      {place.images && place.images.length > 0 && (
        <Card title="Images">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {place.images.map((src, index) => (
              <a
                key={index}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700"
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={src}
                  alt={`${place.name} image ${index + 1}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </Card>
      )}

      <PlaceForm
        place={place}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (data) => {
          await update(place.id, data)
          addToast('Place updated', 'success')
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete place"
        message={`Are you sure you want to delete "${place.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

export default PlaceDetail
