import { useCallback, useMemo, useState } from 'react'

import {
  FileText,
  Calendar,
  CheckSquare,
  MapPin,
  Plus,
  CalendarDays,
} from 'lucide-react'
import { format } from 'date-fns'
import { useDocuments } from '../hooks/useDocuments'
import { useItinerary } from '../hooks/useItinerary'
import { usePlaces } from '../hooks/usePlaces'
import { useRecommendations } from '../hooks/useRecommendations'
import { usePackingList } from '../hooks/usePackingList'
import { useCurrentCountry } from '../hooks/useCurrentCountry'
import { TRIP_META } from '../types'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import TripCountdown from '../components/dashboard/TripCountdown'
import NextEvent from '../components/dashboard/NextEvent'
import DynamicGreeting from '../components/dashboard/DynamicGreeting'
import QuickAccessCard from '../components/dashboard/QuickAccessCard'
import RecentActivity from '../components/dashboard/RecentActivity'
import { DocumentForm } from '../components/documents/DocumentForm'
import { EventForm } from '../components/schedule/EventForm'
import PlaceForm from '../components/places/PlaceForm'
import {
  buildRecentActivity,
  formatDisplayDate,
  getCurrentDayRoute,
  getTripStatus,
} from '../utils/dashboard'

function Dashboard() {
  const { documents, loading: documentsLoading, create: createDocument } = useDocuments()
  const { items: events, loading: eventsLoading, create: createEvent } = useItinerary()
  const { places, loading: placesLoading, create: createPlace } = usePlaces()
  const { recommendations, loading: recommendationsLoading } = useRecommendations()
  const { progress: packingProgress, loading: packingLoading } = usePackingList()

  const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false)
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [isPlaceFormOpen, setIsPlaceFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const tripStatus = useMemo(() => getTripStatus(TRIP_META.startDate, TRIP_META.endDate), [])
  const countryGreeting = useCurrentCountry(events)

  const todayRoute = useMemo(() => getCurrentDayRoute(events, today), [events, today])

  const todayPlanLabel = useMemo(() => {
    if (tripStatus.phase === 'before') {
      return 'Plan del primer día'
    }
    if (tripStatus.phase === 'after') {
      return 'Último día'
    }
    return todayRoute ? `Hoy: ${todayRoute}` : 'Plan de hoy'
  }, [tripStatus.phase, todayRoute])

  const todayLink = useMemo(() => {
    if (tripStatus.phase === 'before') return `/schedule/${TRIP_META.startDate}`
    if (tripStatus.phase === 'after') return `/schedule/${TRIP_META.endDate}`
    return `/schedule/${today}`
  }, [tripStatus.phase, today])

  const packingLabel = useMemo(() => {
    const { checked, total, percentage } = packingProgress
    if (total === 0) return 'Sin items'
    return `${checked}/${total} items (${percentage}%)`
  }, [packingProgress])

  const recentActivity = useMemo(
    () => buildRecentActivity(documents, events, places, recommendations),
    [documents, events, places, recommendations]
  )

  const isLoading =
    documentsLoading || eventsLoading || placesLoading || recommendationsLoading || packingLoading

  const handleAddDocument = useCallback(
    async (values: Parameters<typeof createDocument>[0]) => {
      setIsSaving(true)
      try {
        await createDocument(values)
        setIsDocumentFormOpen(false)
      } finally {
        setIsSaving(false)
      }
    },
    [createDocument]
  )

  const handleAddPlace = useCallback(
    async (values: Parameters<typeof createPlace>[0]) => {
      setIsSaving(true)
      try {
        await createPlace(values)
        setIsPlaceFormOpen(false)
      } finally {
        setIsSaving(false)
      }
    },
    [createPlace]
  )

  const handleAddEvent = useCallback(
    async (values: Parameters<typeof createEvent>[0]) => {
      setIsSaving(true)
      try {
        await createEvent(values)
        setIsEventFormOpen(false)
      } finally {
        setIsSaving(false)
      }
    },
    [createEvent]
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loading label="Cargando panel..." />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-start justify-between gap-4">
        <DynamicGreeting greeting={countryGreeting} isLoading={eventsLoading} />
        <p className="text-right text-sm text-gray-600 dark:text-gray-300">{formatDisplayDate(today)}</p>
      </div>

      <TripCountdown trip={TRIP_META} />

      <NextEvent events={events} />

      <section aria-label="Accesos rápidos">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <QuickAccessCard
            icon={FileText}
            title="Documentos"
            value={`${documents.length} documentos`}
            link="/documents"
            accent="blue"
          />
          <QuickAccessCard
            icon={CalendarDays}
            title="Plan de hoy"
            value={todayPlanLabel}
            link={todayLink}
            accent="green"
          />
          <QuickAccessCard
            icon={CheckSquare}
            title="Maletas"
            value={packingLabel}
            link="/pre-travel"
            accent="amber"
          />
          <QuickAccessCard
            icon={MapPin}
            title="Lugares"
            value={`${places.length} lugares`}
            link="/places"
            accent="rose"
          />
        </div>
      </section>

      <section aria-label="Acciones rápidas">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsDocumentFormOpen(true)}
            className="flex-col gap-1 px-2 py-3 text-xs"
            aria-label="Añadir documento"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Documento
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsEventFormOpen(true)}
            className="flex-col gap-1 px-2 py-3 text-xs"
            aria-label="Añadir evento"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Evento
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsPlaceFormOpen(true)}
            className="flex-col gap-1 px-2 py-3 text-xs"
            aria-label="Añadir lugar"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Lugar
          </Button>
        </div>
      </section>

      <RecentActivity items={recentActivity} />

      <DocumentForm
        isOpen={isDocumentFormOpen}
        onClose={() => setIsDocumentFormOpen(false)}
        onSubmit={handleAddDocument}
        isSaving={isSaving}
      />

      <EventForm
        isOpen={isEventFormOpen}
        defaultDate={today}
        onClose={() => setIsEventFormOpen(false)}
        onSubmit={handleAddEvent}
        isSaving={isSaving}
      />

      <PlaceForm
        isOpen={isPlaceFormOpen}
        onClose={() => setIsPlaceFormOpen(false)}
        onSave={handleAddPlace}
      />
    </div>
  )
}

export default Dashboard
