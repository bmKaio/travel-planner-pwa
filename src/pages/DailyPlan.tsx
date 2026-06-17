import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Pencil, CalendarX } from 'lucide-react'
import { format, parseISO, isValid, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { useItinerary } from '../hooks/useItinerary'
import { usePlaces } from '../hooks/usePlaces'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { DailyPlanCard } from '../components/daily/DailyPlanCard'
import { DailyPlanForm } from '../components/daily/DailyPlanForm'
import { ToastContainer, type Toast } from '../components/common/Toast'
import { determineDayLocation, getPlacesForLocation } from '../utils/dailyPlan'
import { sortItemsByStartTime, toDateInputValue } from '../utils/schedule'

function DailyPlan() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { items: allItems, loading: itemsLoading } = useItinerary()
  const { places: allPlaces, loading: placesLoading } = usePlaces()

  const dailyPlan = useLiveQuery(() => (date ? db.dailyPlans.get(date) : undefined), [date])

  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false)
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

  const location = useMemo(() => determineDayLocation(dayItems), [dayItems])

  const places = useMemo(() => getPlacesForLocation(allPlaces, location), [allPlaces, location])

  const recommendations = useMemo(() => dailyPlan?.recommendations ?? [], [dailyPlan])
  const culturalNotes = useMemo(() => dailyPlan?.culturalNotes ?? [], [dailyPlan])
  const tips = useMemo(() => dailyPlan?.tips ?? [], [dailyPlan])

  const handleBack = () => navigate('/schedule')
  const handleDayView = () => navigate(`/schedule/${date}`)
  const handlePrevDay = () => {
    if (!dayDate) return
    navigate(`/daily/${toDateInputValue(subDays(dayDate, 1))}`)
  }
  const handleNextDay = () => {
    if (!dayDate) return
    navigate(`/daily/${toDateInputValue(addDays(dayDate, 1))}`)
  }

  const loading = itemsLoading || placesLoading

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loading label="Loading daily plan..." />
      </div>
    )
  }

  if (!dayDate) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <CalendarX className="h-12 w-12 text-gray-300 dark:text-slate-600" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invalid date</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            The requested date is not valid.
          </p>
        </div>
        <Button onClick={handleBack}>Back to schedule</Button>
      </div>
    )
  }

  const formattedDate = format(dayDate, "EEEE, d 'de' MMMM", { locale: es })

  return (
    <div className="space-y-4 pb-20">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-400"
          aria-label="Back to schedule"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          onClick={() => setIsPlanFormOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
          aria-label="Edit daily plan"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevDay}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{formattedDate}</h1>
            {location && <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>}
          </div>
          <button
            type="button"
            onClick={handleNextDay}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={handleDayView} className="flex-1 px-3 py-2 text-xs">
          <CalendarDays className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Simple timeline view
        </Button>
      </div>

      <DailyPlanCard
        location={location}
        items={dayItems}
        places={places}
        recommendations={recommendations}
        culturalNotes={culturalNotes}
        tips={tips}
      />

      <DailyPlanForm
        date={date ?? ''}
        isOpen={isPlanFormOpen}
        onClose={() => setIsPlanFormOpen(false)}
        onSaved={() => addToast('Daily plan updated', 'success')}
      />
    </div>
  )
}

export default DailyPlan
