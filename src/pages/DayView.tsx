import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, BedDouble, CalendarX, BookOpen } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { useItinerary } from '../hooks/useItinerary'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { EventCard } from '../components/schedule/EventCard'
import { EventForm } from '../components/schedule/EventForm'
import { Timeline } from '../components/schedule/Timeline'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import type { ItineraryItem } from '../types'
import { sortItemsByStartTime, toDateInputValue } from '../utils/schedule'

function DayView() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { items, loading, create, update, remove } = useItinerary()

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
    return sortItemsByStartTime(items.filter((item) => item.date === date))
  }, [items, date])

  const accommodation = useMemo(() => {
    return dayItems.find((item) => item.type === 'accommodation')
  }, [dayItems])

  const handleBack = () => {
    navigate('/schedule')
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
        <Button onClick={handleBack}>Volver al calendario</Button>
      </div>
    )
  }

  const formattedDate = format(dayDate, "EEEE, d 'de' MMMM", { locale: es })

  return (
    <div className="space-y-4 pb-20">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-400"
        aria-label="Volver al calendario"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{formattedDate}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {dayItems.length} {dayItems.length === 1 ? 'evento' : 'eventos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/daily/${date}`)}
            className="inline-flex px-3 py-2 text-xs"
          >
            <BookOpen className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Full day plan
          </Button>
          <Button onClick={handleOpenNew} className="hidden sm:inline-flex">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Añadir
          </Button>
        </div>
      </div>

      {dayItems.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <div className="rounded-full bg-travel-blue-50 p-4 dark:bg-travel-blue-900/30">
            <CalendarX
              className="h-10 w-10 text-travel-blue-500 dark:text-travel-blue-300"
              aria-hidden="true"
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No hay eventos
          </h2>
          <p className="mt-1 max-w-xs text-sm text-gray-600 dark:text-gray-300">
            Este día está libre. Añade un vuelo, visita o actividad.
          </p>
          <Button onClick={handleOpenNew} className="mt-5">
            Añadir evento
          </Button>
        </div>
      ) : (
        <>
          <Timeline events={dayItems} />

          <section aria-label="Eventos del día" className="space-y-3">
            {dayItems.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="default"
                onEdit={() => handleEdit(event)}
                onDelete={() => setDeletingEvent(event)}
              />
            ))}
          </section>

          {accommodation && (
            <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900/40">
                <BedDouble
                  className="h-5 w-5 text-orange-600 dark:text-orange-400"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Alojamiento: {accommodation.title}
                </p>
                {accommodation.location && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {accommodation.location.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={handleOpenNew}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-travel-blue-600 text-white shadow-lg shadow-travel-blue-600/30 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-travel-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:hidden"
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

export default DayView
