import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Lightbulb, BookOpen, Star, Plus, CalendarX } from 'lucide-react'
import { format, parseISO, isValid, addDays, subDays, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { useItinerary } from '../hooks/useItinerary'
import { usePlaces } from '../hooks/usePlaces'
import { useDocuments } from '../hooks/useDocuments'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { EventCard } from '../components/schedule/EventCard'
import { EventForm } from '../components/schedule/EventForm'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import { DayHeroCard } from '../components/daily/DayHeroCard'
import { CollapsibleSection } from '../components/daily/CollapsibleSection'
import { AccommodationCard } from '../components/daily/AccommodationCard'
import { DayNavigation } from '../components/daily/DayNavigation'
import { DayTipsList } from '../components/daily/DayTipsList'
import { DayCulturalNotes } from '../components/daily/DayCulturalNotes'
import { DayRecommendationsList } from '../components/daily/DayRecommendationsList'
import { DayPlanCard } from '../components/daily/DayPlanCard'
import type { ItineraryItem } from '../types'
import { TRIP_META } from '../types'
import { determineDayLocation, getPlacesForLocation } from '../utils/dailyPlan'
import { sortItemsByStartTime, toDateInputValue } from '../utils/schedule'
import { DAILY_HERO_IMAGES } from '../utils/heroImages'
import { DAILY_TIPS, DAILY_CULTURAL_NOTES, DAILY_PLAN_DESCRIPTIONS } from '../utils/dailyContent'

function DayDetail() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { items: allItems, loading: itemsLoading, create, update, remove } = useItinerary()
  const { places: allPlaces, loading: placesLoading } = usePlaces()
  const { documents } = useDocuments()

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

  const activities = useMemo(
    () => dayItems.filter((item) => item.type !== 'accommodation'),
    [dayItems]
  )

  const accommodation = useMemo(
    () => dayItems.find((item) => item.type === 'accommodation'),
    [dayItems]
  )

  const location = useMemo(() => determineDayLocation(dayItems), [dayItems])

  const accommodationDocId = useMemo(() => {
    if (!accommodation) return null
    const doc = documents.find((d) => d.type === 'accommodation' && d.title === accommodation.title)
    return doc?.id ?? null
  }, [accommodation, documents])

  const places = useMemo(() => getPlacesForLocation(allPlaces, location), [allPlaces, location])

  const heroImage = useMemo(() => {
    if (date && DAILY_HERO_IMAGES[date]) return DAILY_HERO_IMAGES[date]
    if (dailyPlan?.heroImage) return dailyPlan.heroImage
    const placeWithImage = places.find((place) => place.images && place.images.length > 0)
    return placeWithImage?.images?.[0]
  }, [date, dailyPlan, places])

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
    return Math.max(
      1,
      differenceInCalendarDays(parseISO(TRIP_META.endDate), parseISO(TRIP_META.startDate)) + 1
    )
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

  const recommendations = dailyPlan?.recommendations ?? []
  const culturalNotes: string[] =
    (date && DAILY_CULTURAL_NOTES[date]) || dailyPlan?.culturalNotes || []
  const tips: string[] = (date && DAILY_TIPS[date]) || dailyPlan?.tips || []

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

      <DayNavigation
        dayNumber={dayNumber}
        totalDays={totalDays}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
      />

      {date && DAILY_PLAN_DESCRIPTIONS[date] && (
        <DayPlanCard description={DAILY_PLAN_DESCRIPTIONS[date]} />
      )}

      {accommodation && (
        <AccommodationCard
          accommodation={accommodation}
          onClick={() =>
            navigate(accommodationDocId ? `/documents/${accommodationDocId}` : '/accommodations')
          }
        />
      )}

      <CollapsibleSection title="Actividades del día" icon={Clock} defaultOpen>
        {activities.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-gray-300">
            No hay actividades programadas para este día.
          </p>
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

      {tips.length > 0 && (
        <CollapsibleSection title="Tips" icon={Lightbulb} defaultOpen={false}>
          <DayTipsList tips={tips} />
        </CollapsibleSection>
      )}

      {culturalNotes.length > 0 && (
        <CollapsibleSection title="Consejos culturales" icon={BookOpen} defaultOpen={false}>
          <DayCulturalNotes notes={culturalNotes} />
        </CollapsibleSection>
      )}

      {recommendations.length > 0 && (
        <CollapsibleSection title="Recomendaciones" icon={Star} defaultOpen={false}>
          <DayRecommendationsList recommendations={recommendations} places={allPlaces} />
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
