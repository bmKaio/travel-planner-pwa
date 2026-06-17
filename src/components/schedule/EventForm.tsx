import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { ItineraryItem, ItineraryItemType, Location } from '../../types'
import Button from '../common/Button'
import { EVENT_TYPE_CONFIG, EVENT_TYPE_ORDER, toDateInputValue } from '../../utils/schedule'

interface EventFormProps {
  isOpen: boolean
  event?: ItineraryItem | null
  defaultDate?: string
  onClose: () => void
  onSubmit: (values: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  isSaving?: boolean
}

interface FormState {
  date: string
  startTime: string
  endTime: string
  type: ItineraryItemType
  title: string
  description: string
  locationName: string
  lat: string
  lng: string
  notes: string
  tags: string
}

interface FormErrors {
  date?: string
  startTime?: string
  title?: string
  lat?: string
  lng?: string
}

const EMPTY_STATE: FormState = {
  date: '',
  startTime: '',
  endTime: '',
  type: 'activity',
  title: '',
  description: '',
  locationName: '',
  lat: '',
  lng: '',
  notes: '',
  tags: '',
}

export function EventForm({
  isOpen,
  event,
  defaultDate,
  onClose,
  onSubmit,
  isSaving = false,
}: EventFormProps) {
  const isEditMode = Boolean(event)

  const initialState: FormState = useMemo(() => {
    if (!event) {
      return {
        ...EMPTY_STATE,
        date: defaultDate ?? toDateInputValue(new Date()),
        startTime: '09:00',
      }
    }
    return {
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime ?? '',
      type: event.type,
      title: event.title,
      description: event.description ?? '',
      locationName: event.location?.name ?? '',
      lat: event.location?.lat?.toString() ?? '',
      lng: event.location?.lng?.toString() ?? '',
      notes: event.notes ?? '',
      tags: event.tags?.join(', ') ?? '',
    }
  }, [event, defaultDate])

  const [values, setValues] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setValues(initialState)
      setErrors({})
    }
  }, [isOpen, initialState])

  if (!isOpen) return null

  const handleChange = (field: keyof FormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}

    if (!values.date.trim()) {
      nextErrors.date = 'La fecha es obligatoria'
    }
    if (!values.startTime.trim()) {
      nextErrors.startTime = 'La hora de inicio es obligatoria'
    }
    if (!values.title.trim()) {
      nextErrors.title = 'El título es obligatorio'
    }

    if (values.lat && Number.isNaN(Number(values.lat))) {
      nextErrors.lat = 'Latitud no válida'
    }
    if (values.lng && Number.isNaN(Number(values.lng))) {
      nextErrors.lng = 'Longitud no válida'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildLocation = (): Location | undefined => {
    if (!values.locationName.trim()) return undefined
    const lat = values.lat ? Number(values.lat) : undefined
    const lng = values.lng ? Number(values.lng) : undefined
    const hasCoords = lat !== undefined && lng !== undefined
    return {
      name: values.locationName.trim(),
      ...(hasCoords ? { lat, lng } : {}),
      ...(hasCoords ? { googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}&z=15` } : {}),
    }
  }

  const handleSubmit = async (eventForm: React.FormEvent) => {
    eventForm.preventDefault()
    if (!validate() || isSaving) return

    const payload: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'> = {
      date: values.date,
      startTime: values.startTime,
      ...(values.endTime ? { endTime: values.endTime } : {}),
      type: values.type,
      title: values.title.trim(),
      ...(values.description.trim() ? { description: values.description.trim() } : {}),
      ...buildLocation(),
      ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
      ...(values.tags.trim()
        ? {
            tags: values.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          }
        : {}),
    }

    await onSubmit(payload)
  }

  const TypeIcon = EVENT_TYPE_CONFIG[values.type].icon

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-title"
    >
      <header className="safe-top sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
        <h1 id="event-form-title" className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditMode ? 'Editar evento' : 'Nuevo evento'}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
          aria-label="Cerrar formulario"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-date"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Fecha <span aria-hidden="true">*</span>
              </label>
              <input
                id="event-date"
                type="date"
                value={values.date}
                onChange={(event) => handleChange('date', event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? 'date-error' : undefined}
              />
              {errors.date && (
                <p id="date-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="event-type"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Tipo <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <select
                  id="event-type"
                  value={values.type}
                  onChange={(event) => handleChange('type', event.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                >
                  {EVENT_TYPE_ORDER.map((type) => (
                    <option key={type} value={type}>
                      {EVENT_TYPE_CONFIG[type].label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <TypeIcon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-start"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Hora inicio <span aria-hidden="true">*</span>
              </label>
              <input
                id="event-start"
                type="time"
                value={values.startTime}
                onChange={(event) => handleChange('startTime', event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                aria-invalid={Boolean(errors.startTime)}
                aria-describedby={errors.startTime ? 'start-error' : undefined}
              />
              {errors.startTime && (
                <p id="start-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors.startTime}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="event-end"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Hora fin <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                id="event-end"
                type="time"
                value={values.endTime}
                onChange={(event) => handleChange('endTime', event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="event-title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Título <span aria-hidden="true">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              value={values.title}
              onChange={(event) => handleChange('title', event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Ej. Visita a Angkor Wat"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Descripción
            </label>
            <textarea
              id="event-description"
              rows={3}
              value={values.description}
              onChange={(event) => handleChange('description', event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Añade una breve descripción..."
            />
          </div>

          <fieldset className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <legend className="text-sm font-semibold text-gray-900 dark:text-white">
              Ubicación
            </legend>

            <div>
              <label
                htmlFor="event-location-name"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Nombre del lugar
              </label>
              <input
                id="event-location-name"
                type="text"
                value={values.locationName}
                onChange={(event) => handleChange('locationName', event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="Ej. Templo de la Literatura"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="event-lat"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Latitud
                </label>
                <input
                  id="event-lat"
                  type="text"
                  inputMode="decimal"
                  value={values.lat}
                  onChange={(event) => handleChange('lat', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="21.0341"
                  aria-invalid={Boolean(errors.lat)}
                  aria-describedby={errors.lat ? 'lat-error' : undefined}
                />
                {errors.lat && (
                  <p id="lat-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {errors.lat}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="event-lng"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Longitud
                </label>
                <input
                  id="event-lng"
                  type="text"
                  inputMode="decimal"
                  value={values.lng}
                  onChange={(event) => handleChange('lng', event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="105.8494"
                  aria-invalid={Boolean(errors.lng)}
                  aria-describedby={errors.lng ? 'lng-error' : undefined}
                />
                {errors.lng && (
                  <p id="lng-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {errors.lng}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="event-notes"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Notas
            </label>
            <textarea
              id="event-notes"
              rows={3}
              value={values.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Notas adicionales..."
            />
          </div>

          <div>
            <label
              htmlFor="event-tags"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Etiquetas
            </label>
            <input
              id="event-tags"
              type="text"
              value={values.tags}
              onChange={(event) => handleChange('tags', event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="hanoi, cultura, unesco"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separa las etiquetas con comas.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              isFullWidth
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" isFullWidth disabled={isSaving}>
              {isSaving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Guardar evento'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
