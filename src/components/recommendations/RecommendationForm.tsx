import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { Recommendation, RecommendationPriority, RecommendationType } from '../../types'
import {
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_TYPES,
  joinTags,
  parseTags,
} from '../../utils/recommendations'
import Button from '../common/Button'

interface RecommendationFormProps {
  recommendation?: Recommendation | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

interface FormErrors {
  title?: string
  description?: string
}

function RecommendationForm({ recommendation, isOpen, onClose, onSave }: RecommendationFormProps) {
  const isEditing = Boolean(recommendation)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<RecommendationType>('place')
  const [priority, setPriority] = useState<RecommendationPriority>('if-time')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [tags, setTags] = useState('')
  const [whyVisit, setWhyVisit] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (recommendation) {
      setTitle(recommendation.title)
      setType(recommendation.type)
      setPriority(recommendation.priority)
      setDescription(recommendation.description)
      setLocationName(recommendation.location?.name ?? '')
      setLat(recommendation.location?.lat?.toString() ?? '')
      setLng(recommendation.location?.lng?.toString() ?? '')
      setTags(joinTags(recommendation.tags))
      setWhyVisit(recommendation.whyVisit ?? '')
    } else {
      setTitle('')
      setType('place')
      setPriority('if-time')
      setDescription('')
      setLocationName('')
      setLat('')
      setLng('')
      setTags('')
      setWhyVisit('')
    }
    setErrors({})
    setIsSaving(false)
  }, [recommendation, isOpen])

  const formTitle = useMemo(
    () => (isEditing ? 'Edit recommendation' : 'Add recommendation'),
    [isEditing]
  )

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}
    if (!title.trim()) nextErrors.title = 'Title is required'
    if (!description.trim()) nextErrors.description = 'Description is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    const parsedLat = lat.trim() ? parseFloat(lat) : undefined
    const parsedLng = lng.trim() ? parseFloat(lng) : undefined

    const data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      type,
      priority,
      description: description.trim(),
      location:
        locationName.trim() || parsedLat !== undefined || parsedLng !== undefined
          ? {
              name: locationName.trim() || title.trim(),
              lat: parsedLat,
              lng: parsedLng,
            }
          : undefined,
      tags: parseTags(tags),
      whyVisit: whyVisit.trim() || undefined,
    }

    try {
      setIsSaving(true)
      await onSave(data)
      onClose()
    } catch (error) {
      setIsSaving(false)
      alert(error instanceof Error ? error.message : 'Failed to save recommendation')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recommendation-form-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800">
          <h2
            id="recommendation-form-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {formTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-slate-800"
            aria-label="Close form"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label
              htmlFor="rec-title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="rec-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Giang Café"
              required
            />
            {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="rec-type"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Type
              </label>
              <select
                id="rec-type"
                value={type}
                onChange={(e) => setType(e.target.value as RecommendationType)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {RECOMMENDATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="rec-priority"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Priority
              </label>
              <select
                id="rec-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as RecommendationPriority)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {RECOMMENDATION_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p === 'must-see' ? 'Must-see' : p === 'if-time' ? 'If time' : 'Optional'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="rec-description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="rec-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Brief description"
              required
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500">{errors.description}</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Location</h3>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="rec-location-name"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Location name
                </label>
                <input
                  id="rec-location-name"
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Hanoi"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="rec-lat"
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
                  >
                    Latitude
                  </label>
                  <input
                    id="rec-lat"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="21.0341"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rec-lng"
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
                  >
                    Longitude
                  </label>
                  <input
                    id="rec-lng"
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="105.8494"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="rec-tags"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Tags <span className="text-gray-400">(comma separated)</span>
            </label>
            <input
              id="rec-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="hanoi, gastronomía, café"
            />
          </div>

          <div>
            <label
              htmlFor="rec-why"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Why visit? <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="rec-why"
              value={whyVisit}
              onChange={(e) => setWhyVisit(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="What makes this place special"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" isFullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isFullWidth disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecommendationForm
