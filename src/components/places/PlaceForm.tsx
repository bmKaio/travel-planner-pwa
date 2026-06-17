import { useEffect, useMemo, useState } from 'react'
import { X, Navigation, Upload, Trash2 } from 'lucide-react'
import type { Place, PlaceCategory } from '../../types'
import { FILTER_CATEGORIES, parseCommaSeparated, joinCommaSeparated } from '../../utils/places'
import Button from '../common/Button'

interface PlaceFormProps {
  place?: Place | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

interface FormErrors {
  name?: string
  description?: string
}

function PlaceForm({ place, isOpen, onClose, onSave }: PlaceFormProps) {
  const isEditing = Boolean(place)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<PlaceCategory>('other')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [openingHours, setOpeningHours] = useState('')
  const [tips, setTips] = useState('')
  const [funFacts, setFunFacts] = useState('')
  const [culturalContext, setCulturalContext] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (place) {
      setName(place.name)
      setCategory(place.category)
      setDescription(place.description)
      setLocationName(place.location.name)
      setAddress(place.location.address ?? '')
      setLat(place.location.lat?.toString() ?? '')
      setLng(place.location.lng?.toString() ?? '')
      setOpeningHours(place.openingHours ?? '')
      setTips(joinCommaSeparated(place.tips))
      setFunFacts(joinCommaSeparated(place.funFacts))
      setCulturalContext(place.culturalContext ?? '')
      setImages(place.images ?? [])
    } else {
      setName('')
      setCategory('other')
      setDescription('')
      setLocationName('')
      setAddress('')
      setLat('')
      setLng('')
      setOpeningHours('')
      setTips('')
      setFunFacts('')
      setCulturalContext('')
      setImages([])
    }
    setErrors({})
    setIsSaving(false)
  }, [place, isOpen])

  const title = useMemo(() => (isEditing ? 'Edit place' : 'Add place'), [isEditing])

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}
    if (!name.trim()) nextErrors.name = 'Name is required'
    if (!description.trim()) nextErrors.description = 'Description is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }
    setIsGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6))
        setLng(position.coords.longitude.toFixed(6))
        setIsGeolocating(false)
      },
      () => {
        alert('Unable to retrieve your location')
        setIsGeolocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string | undefined
        if (result) {
          setImages((prev) => [...prev, result])
        }
      }
      reader.readAsDataURL(file)
    })
    event.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    const parsedLat = lat.trim() ? parseFloat(lat) : undefined
    const parsedLng = lng.trim() ? parseFloat(lng) : undefined

    const data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      category,
      description: description.trim(),
      location: {
        name: locationName.trim() || name.trim(),
        address: address.trim() || undefined,
        lat: parsedLat,
        lng: parsedLng,
      },
      openingHours: openingHours.trim() || undefined,
      tips: parseCommaSeparated(tips),
      funFacts: parseCommaSeparated(funFacts),
      culturalContext: culturalContext.trim() || undefined,
      images: images.length > 0 ? images : undefined,
    }

    try {
      setIsSaving(true)
      await onSave(data)
      onClose()
    } catch (error) {
      setIsSaving(false)
      alert(error instanceof Error ? error.message : 'Failed to save place')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-form-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800">
          <h2 id="place-form-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
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
              htmlFor="place-name"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="place-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Angkor Wat"
              required
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          <div>
            <label
              htmlFor="place-category"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Category
            </label>
            <select
              id="place-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PlaceCategory)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {FILTER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="place-description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="place-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Brief description of the place"
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
                  htmlFor="place-location-name"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Location name
                </label>
                <input
                  id="place-location-name"
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Siem Reap"
                />
              </div>

              <div>
                <label
                  htmlFor="place-address"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Address
                </label>
                <input
                  id="place-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="Street address or directions"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="place-lat"
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
                  >
                    Latitude
                  </label>
                  <input
                    id="place-lat"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="13.4125"
                  />
                </div>
                <div>
                  <label
                    htmlFor="place-lng"
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
                  >
                    Longitude
                  </label>
                  <input
                    id="place-lng"
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="103.8667"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleGeolocation}
                disabled={isGeolocating}
                className="px-3 py-2 text-xs"
              >
                <Navigation className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {isGeolocating ? 'Locating...' : 'Get current location'}
              </Button>
            </div>
          </div>

          <div>
            <label
              htmlFor="place-hours"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Opening hours
            </label>
            <input
              id="place-hours"
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. 08:00 - 17:30"
            />
          </div>

          <div>
            <label
              htmlFor="place-tips"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Tips <span className="text-gray-400">(comma separated)</span>
            </label>
            <input
              id="place-tips"
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Tip 1, tip 2, tip 3"
            />
          </div>

          <div>
            <label
              htmlFor="place-facts"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Fun facts <span className="text-gray-400">(comma separated)</span>
            </label>
            <input
              id="place-facts"
              type="text"
              value={funFacts}
              onChange={(e) => setFunFacts(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Fact 1, fact 2"
            />
          </div>

          <div>
            <label
              htmlFor="place-cultural"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Cultural context
            </label>
            <textarea
              id="place-cultural"
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Historical or cultural background"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Images
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload images
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleImageUpload}
              />
            </label>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((src, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700"
                  >
                    <img
                      src={src}
                      alt={`Uploaded preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

export default PlaceForm
