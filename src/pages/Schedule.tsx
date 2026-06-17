import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, List, Plus, CalendarX } from 'lucide-react'
import { useItinerary } from '../hooks/useItinerary'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { Calendar } from '../components/schedule/Calendar'
import { EventCard } from '../components/schedule/EventCard'
import { EventForm } from '../components/schedule/EventForm'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import type { ItineraryItem } from '../types'
import { toDateInputValue } from '../utils/schedule'

type ViewMode = 'calendar' | 'list'

function Schedule() {
  const navigate = useNavigate()
  const { items, loading, create, update, remove } = useItinerary()

  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ItineraryItem | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)
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

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    )
  }, [items])

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    navigate(`/daily/${toDateInputValue(date)}`)
  }

  const handleQuickAdd = (date: Date) => {
    setEditingEvent(null)
    setDefaultDate(toDateInputValue(date))
    setIsFormOpen(true)
  }

  const handleOpenNew = () => {
    setEditingEvent(null)
    setDefaultDate(undefined)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingEvent(null)
    setDefaultDate(undefined)
  }

  const handleEdit = (event: ItineraryItem) => {
    setEditingEvent(event)
    setDefaultDate(undefined)
    setIsFormOpen(true)
  }

  const handleSubmit = async (values: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true)
    try {
      if (editingEvent) {
        await update(editingEvent.id, values)
        addToast('Evento actualizado correctamente', 'success')
      } else {
        await create(values)
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
        <Loading label="Cargando itinerario..." />
      </div>
    )
  }

  const hasEvents = items.length > 0

  return (
    <div className="space-y-4 pb-20">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Itinerario</h1>
        <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
            }`}
            aria-pressed={viewMode === 'calendar'}
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Calendario
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
            }`}
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4" aria-hidden="true" />
            Lista
          </button>
        </div>
      </div>

      {!hasEvents ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <div className="rounded-full bg-travel-blue-50 p-4 dark:bg-travel-blue-900/30">
            <CalendarX
              className="h-10 w-10 text-travel-blue-500 dark:text-travel-blue-300"
              aria-hidden="true"
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Sin eventos</h2>
          <p className="mt-1 max-w-xs text-sm text-gray-600 dark:text-gray-300">
            Tu itinerario está vacío. Añade vuelos, visitas, alojamientos y actividades.
          </p>
          <Button onClick={handleOpenNew} className="mt-5">
            Añadir primer evento
          </Button>
        </div>
      ) : viewMode === 'calendar' ? (
        <Calendar
          currentMonth={currentMonth}
          events={items}
          selectedDate={selectedDate}
          onChangeMonth={setCurrentMonth}
          onSelectDate={handleSelectDate}
          onQuickAdd={handleQuickAdd}
        />
      ) : (
        <section aria-label="Lista de eventos" className="space-y-3">
          {sortedItems.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={() => handleEdit(event)}
              onDelete={() => setDeletingEvent(event)}
            />
          ))}
        </section>
      )}

      <button
        type="button"
        onClick={handleOpenNew}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-travel-blue-600 text-white shadow-lg shadow-travel-blue-600/30 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-travel-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        aria-label="Añadir nuevo evento"
      >
        <Plus className="h-7 w-7" aria-hidden="true" />
      </button>

      <EventForm
        isOpen={isFormOpen}
        event={editingEvent}
        defaultDate={defaultDate}
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

export default Schedule
