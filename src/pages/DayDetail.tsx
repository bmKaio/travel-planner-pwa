import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  BookOpen,
  Star,
  Plus,
  CalendarX,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import { format, parseISO, isValid, addDays, subDays, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { useItinerary } from '../hooks/useItinerary'
import { usePlaces } from '../hooks/usePlaces'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { EventCard } from '../components/schedule/EventCard'
import { EventForm } from '../components/schedule/EventForm'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import { DayHeroCard } from '../components/daily/DayHeroCard'
import { CollapsibleSection } from '../components/daily/CollapsibleSection'
import { AccommodationCard } from '../components/daily/AccommodationCard'
import type { ItineraryItem, Recommendation, RecommendationPriority } from '../types'
import { TRIP_META } from '../types'
import { determineDayLocation, getPlacesForLocation } from '../utils/dailyPlan'
import { sortItemsByStartTime, toDateInputValue } from '../utils/schedule'

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
    label: 'Imprescindible',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    border: 'border-rose-200 dark:border-rose-800',
  },
  'if-time': {
    label: 'Si hay tiempo',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    border: 'border-blue-200 dark:border-blue-800',
  },
  optional: {
    label: 'Opcional',
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
  },
}

const IMPORTANT_KEYWORDS = [
  'important',
  'must',
  "don't forget",
  'always',
  'never',
  'required',
  'necessary',
  'essential',
  'critical',
  'no olvides',
  'imprescindible',
  'obligatorio',
  'siempre',
  'nunca',
]

function isImportantTip(tip: string): boolean {
  const lower = tip.toLowerCase()
  return IMPORTANT_KEYWORDS.some((keyword) => lower.includes(keyword))
}

function EmptySection({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-gray-300">
      {message}
    </p>
  )
}

function DayDetail() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { items: allItems, loading: itemsLoading, create, update, remove } = useItinerary()
  const { places: allPlaces, loading: placesLoading } = usePlaces()

  const dailyPlan = useLiveQuery(() => (date ? db.dailyPlans.get(date) : undefined), [date])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ItineraryItem | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<ItineraryItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const dayDate = useMemo(() => {
    if (!date) return null
    const parsed = parseISO(date)
    return isValid(parsed) ? parsed : null
  }, [date])

  const dayItems = useMemo(() => {
    if (!date) return []
    return sortItemsByStartTime(allItems.filter((item) => item.date === date))
  }, [allItems, date])

  const activities = useMemo(() => dayItems.filter((item) => item.type !== 'accommodation'), [dayItems])

  const accommodation = useMemo(() => dayItems.find((item) => item.type === 'accommodation'), [dayItems])

  const location = useMemo(() => determineDayLocation(dayItems), [dayItems])

  const places = useMemo(() => getPlacesForLocation(allPlaces, location), [allPlaces, location])

  const heroImage = useMemo(() => {
    if (dailyPlan?.heroImage) return dailyPlan.heroImage
    const placeWithImage = places.find((place) => place.images && place.images.length > 0)
    return placeWithImage?.images?.[0]
  }, [dailyPlan, places])

  const title = useMemo(() => {
    if (location) return location
    const firstNonAccommodation = activities.find((item) => item.type !== 'accommodation')
    return firstNonAccommodation?.title ?? activities[0]?.title ?? 'Día sin título'
  }, [location, activities])

  const dayNumber = useMemo(() => {
    if (!dayDate) return 1
    return Math.max(1, differenceInCalendarDays(dayDate, parseISO(TRIP_META.startDate)) + 1)
  }, [dayDate])

  const totalDays = useMemo(() => {
    return Math.max(1, differenceInCalendarDays(parseISO(TRIP_META.endDate), parseISO(TRIP_META.startDate)) + 1)
  }, [])

  const handleBack = () => navigate('/schedule')

  const handlePrevDay = () => {
    if (!dayDate) return
    navigate(`/schedule/${toDateInputValue(subDays(dayDate, 1))}`)
  }

  const handleNextDay = () => {
    if (!dayDate) return
    navigate(`/schedule/${toDateInputValue(addDays(dayDate, 1))}`)
  }

  const handleEdit = (event: ItineraryItem) => {
    setEditingEvent(event)
    setIsFormOpen(true)
  }

  const handleOpenNew = () => {
    setEditingEvent(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingEvent(null)
  }

  const handleSubmit = async (values: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true)
    try {
      if (editingEvent) {
        await update(editingEvent.id, values)
        addToast('Evento actualizado correctamente', 'success')
      } else {
        await create({ ...values, date: date ?? values.date })
        addToast('Evento añadido correctamente', 'success')
      }
      handleCloseForm()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al guardar el evento', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingEvent) return
    try {
      await remove(deletingEvent.id)
      addToast('Evento eliminado', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al eliminar el evento', 'error')
    } finally {
      setDeletingEvent(null)
    }
  }

  const recommendations: Recommendation[] = dailyPlan?.recommendations ?? []
  const culturalNotes: string[] = dailyPlan?.culturalNotes ?? []
  const tips: string[] = dailyPlan?.tips ?? []

  const loading = itemsLoading || placesLoading

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loading label="Cargando día..." />
      </div>
    )
  }

  if (!dayDate) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <CalendarX className="h-12 w-12 text-gray-300 dark:text-slate-600" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fecha no válida</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            La fecha indicada no es correcta.
          </p>
        </div>
        <Button onClick={handleBack}>Volver al itinerario</Button>
      </div>
    )
  }

  const formattedMonth = format(dayDate, 'MMMM yyyy', { locale: es })

  return (
    <div className="space-y-4 pb-24">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-400"
          aria-label="Volver al itinerario"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </button>
        <span className="text-xs font-medium capitalize text-gray-500 dark:text-gray-400">
          {formattedMonth}
        </span>
      </div>

      <DayHeroCard
        image={heroImage}
        date={date ?? ''}
        title={title}
        location={location}
        dayNumber={dayNumber}
        totalDays={totalDays}
        summary={dailyPlan?.summary}
      />

      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={handlePrevDay}
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
          aria-label="Día anterior"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Navegación</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Día {dayNumber} de {totalDays}
          </p>
        </div>
        <button
          type="button"
          onClick={handleNextDay}
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
          aria-label="Día siguiente"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <CollapsibleSection title="Actividades del día" icon={Clock} defaultOpen>
        {activities.length === 0 ? (
          <EmptySection message="No hay actividades programadas para este día." />
        ) : (
          <ul className="space-y-3" aria-label="Actividades del día">
            {activities.map((event) => (
              <li key={event.id}>
                <EventCard
                  event={event}
                  variant="default"
                  onEdit={() => handleEdit(event)}
                  onDelete={() => setDeletingEvent(event)}
                />
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      {accommodation && <AccommodationCard accommodation={accommodation} />}

      {tips.length > 0 && (
        <CollapsibleSection title="Tips" icon={Lightbulb} defaultOpen={false}>
          <ul className="space-y-2">
            {tips.map((tip, index) => {
              const important = isImportantTip(tip)
              return (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  {important ? (
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <Lightbulb
                      className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500"
                      aria-hidden="true"
                    />
                  )}
                  <span className={important ? 'font-medium text-gray-900 dark:text-white' : ''}>
                    {tip}
                  </span>
                </li>
              )
            })}
          </ul>
        </CollapsibleSection>
      )}

      {culturalNotes.length > 0 && (
        <CollapsibleSection title="Consejos culturales" icon={BookOpen} defaultOpen={false}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {culturalNotes.join('\n\n')}
          </div>
        </CollapsibleSection>
      )}

      {recommendations.length > 0 && (
        <CollapsibleSection title="Recomendaciones" icon={Star} defaultOpen={false}>
          <ul className="space-y-3">
            {recommendations.map((recommendation) => {
              const config = PRIORITY_CONFIG[recommendation.priority]
              const linkedPlace = recommendation.location?.name
                ? allPlaces.find((p) =>
                    p.name.toLowerCase().includes(recommendation.location!.name.toLowerCase())
                  )
                : undefined

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
                  {linkedPlace ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/places/${linkedPlace.id}`)}
                      className="w-full text-left"
                      aria-label={`Ver ${recommendation.title}`}
                    >
                      {content}
                    </button>
                  ) : (
                    <div>{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </CollapsibleSection>
      )}

      <button
        type="button"
        onClick={handleOpenNew}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-travel-blue-600 text-white shadow-lg shadow-travel-blue-600/30 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-travel-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        aria-label="Añadir evento para este día"
      >
        <Plus className="h-7 w-7" aria-hidden="true" />
      </button>

      <EventForm
        isOpen={isFormOpen}
        event={editingEvent}
        defaultDate={date ?? toDateInputValue(dayDate)}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEvent)}
        title="Eliminar evento"
        message={`¿Seguro que quieres eliminar "${deletingEvent?.title}"? Esta acción no se puede deshacer.`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeletingEvent(null)}
      />
    </div>
  )
}

export default DayDetail
