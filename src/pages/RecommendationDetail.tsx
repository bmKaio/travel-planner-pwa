import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Share2, MapPin, ExternalLink, Tag, Star } from 'lucide-react'
import { useRecommendations } from '../hooks/useRecommendations'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import RecommendationForm from '../components/recommendations/RecommendationForm'
import {
  getGoogleMapsUrl,
  getRecommendationPriorityConfig,
  getRecommendationTypeConfig,
} from '../utils/recommendations'

function RecommendationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { recommendations, loading, remove, update } = useRecommendations()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const recommendation = useMemo(
    () => recommendations.find((r) => r.id === id),
    [recommendations, id]
  )

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
    if (!recommendation) return
    try {
      await remove(recommendation.id)
      setShowDeleteConfirm(false)
      navigate('/recommendations')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to delete recommendation', 'error')
    }
  }

  if (loading) {
    return <Loading fullScreen label="Cargando recomendación..." />
  }

  if (!recommendation) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/recommendations')}
          className="px-3 py-2 text-xs"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <Card>
          <p className="text-gray-600 dark:text-gray-300">Recommendation not found.</p>
        </Card>
      </div>
    )
  }

  const typeConfig = getRecommendationTypeConfig(recommendation.type)
  const priorityConfig = getRecommendationPriorityConfig(recommendation.priority)
  const TypeIcon = typeConfig.icon

  return (
    <div className="space-y-4 pb-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={() => navigate('/recommendations')}
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
            aria-label="Share recommendation"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl border border-gray-300 bg-white p-2.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
            aria-label="Edit recommendation"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-700 shadow-sm hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-rose-900/40 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
            aria-label="Delete recommendation"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${typeConfig.bgClass} ${typeConfig.textClass}`}
          >
            <TypeIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeConfig.bgClass} ${typeConfig.textClass}`}
              >
                {typeConfig.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityConfig.bgClass} ${priorityConfig.textClass}`}
              >
                <Star className="h-3 w-3" aria-hidden="true" />
                {priorityConfig.label}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {recommendation.title}
            </h1>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {recommendation.description}
        </p>
      </Card>

      {recommendation.whyVisit && (
        <Card title="Why visit?">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {recommendation.whyVisit}
          </p>
        </Card>
      )}

      {recommendation.location && (
        <Card title="Location">
          <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <div>
              <p className="font-medium">{recommendation.location.name}</p>
              {recommendation.location.address && <p>{recommendation.location.address}</p>}
              {recommendation.location.lat !== undefined &&
                recommendation.location.lng !== undefined && (
                  <p className="text-gray-500 dark:text-gray-400">
                    {recommendation.location.lat.toFixed(5)},{' '}
                    {recommendation.location.lng.toFixed(5)}
                  </p>
                )}
            </div>
          </div>
          <Button
            variant="primary"
            className="mt-4 px-4 py-2.5 text-sm"
            onClick={() =>
              window.open(getGoogleMapsUrl(recommendation), '_blank', 'noopener,noreferrer')
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
            Open in Google Maps
          </Button>
        </Card>
      )}

      {recommendation.tags.length > 0 && (
        <Card title="Tags">
          <div className="flex flex-wrap gap-2">
            {recommendation.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-slate-800 dark:text-gray-300"
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        </Card>
      )}

      <RecommendationForm
        recommendation={recommendation}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (data) => {
          await update(recommendation.id, data)
          addToast('Recommendation updated', 'success')
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete recommendation"
        message={`Are you sure you want to delete "${recommendation.title}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

export default RecommendationDetail
