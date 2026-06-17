import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Sunrise,
  Sun,
  Moon,
  Navigation,
  Clock,
  CalendarX,
  BookOpen,
  Lightbulb,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ItineraryItem, Place, Recommendation } from '../../types'
import { EventCard } from '../schedule/EventCard'
import { CulturalNote } from './CulturalNote'
import { DayTip } from './DayTip'
import { DailyRecommendation } from './DailyRecommendation'
import { groupItemsByPeriod, groupPlacesByPeriod, type DayPeriod } from '../../utils/dailyPlan'

interface DailyPlanCardProps {
  location: string | null
  items: ItineraryItem[]
  places: Place[]
  recommendations: Recommendation[]
  culturalNotes: string[]
  tips: string[]
}

const PERIOD_CONFIG: Record<
  DayPeriod,
  {
    label: string
    icon: LucideIcon
    color: string
    bg: string
  }
> = {
  morning: {
    label: 'Morning',
    icon: Sunrise,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  afternoon: {
    label: 'Afternoon',
    icon: Sun,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  evening: {
    label: 'Evening',
    icon: Moon,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  unknown: {
    label: 'All day',
    icon: Clock,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-slate-800',
  },
}

interface CollapsibleSectionProps {
  title: string
  icon: LucideIcon
  color: string
  bg: string
  children: React.ReactNode
  initialExpanded?: boolean
}

function CollapsibleSection({
  title,
  icon: Icon,
  color,
  bg,
  children,
  initialExpanded = true,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(initialExpanded)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left ${bg}`}
        aria-expanded={expanded}
        aria-label={title}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
        )}
      </button>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <Icon className="h-8 w-8 text-gray-300 dark:text-slate-600" aria-hidden="true" />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  )
}

export function DailyPlanCard({
  location,
  items,
  places,
  recommendations,
  culturalNotes,
  tips,
}: DailyPlanCardProps) {
  const navigate = useNavigate()
  const itemGroups = groupItemsByPeriod(items)
  const placeGroups = groupPlacesByPeriod(places, items)

  const hasAnyContent =
    items.length > 0 ||
    places.length > 0 ||
    culturalNotes.length > 0 ||
    tips.length > 0 ||
    recommendations.length > 0

  const renderPlace = (place: Place) => (
    <button
      key={place.id}
      type="button"
      onClick={() => navigate(`/places/${place.id}`)}
      className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left hover:bg-gray-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
      aria-label={`View ${place.name}`}
    >
      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{place.name}</p>
        <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">{place.description}</p>
      </div>
    </button>
  )

  return (
    <div className="space-y-4">
      {location && (
        <div className="flex items-center gap-2 rounded-xl border border-travel-blue-100 bg-travel-blue-50 px-4 py-3 dark:border-travel-blue-900/40 dark:bg-travel-blue-900/20">
          <Navigation
            className="h-5 w-5 text-travel-blue-600 dark:text-travel-blue-400"
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-travel-blue-800 dark:text-travel-blue-200">
            {location}
          </span>
        </div>
      )}

      {!hasAnyContent && <EmptyState icon={CalendarX} message="No content planned for this day." />}

      {items.length === 0 ? (
        <EmptyState icon={Clock} message="No activities planned for this day." />
      ) : (
        <CollapsibleSection
          title="Activities"
          icon={Clock}
          color="text-travel-blue-600 dark:text-travel-blue-400"
          bg="bg-travel-blue-50 dark:bg-travel-blue-900/20"
        >
          <div className="space-y-4">
            {(Object.keys(itemGroups) as DayPeriod[]).map((period) => {
              const periodItems = itemGroups[period]
              if (periodItems.length === 0) return null
              const config = PERIOD_CONFIG[period]
              return (
                <div key={period}>
                  <div className="mb-2 flex items-center gap-2">
                    <config.icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {config.label}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {periodItems.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        variant="timeline"
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {places.length === 0 ? (
        location ? (
          <EmptyState icon={MapPin} message="No places added for this location yet." />
        ) : null
      ) : (
        <CollapsibleSection
          title="Places to visit"
          icon={MapPin}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        >
          <div className="space-y-4">
            {(Object.keys(placeGroups) as DayPeriod[]).map((period) => {
              const periodPlaces = placeGroups[period]
              if (periodPlaces.length === 0) return null
              const config = PERIOD_CONFIG[period]
              return (
                <div key={period}>
                  <div className="mb-2 flex items-center gap-2">
                    <config.icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {config.label}
                    </h4>
                  </div>
                  <div className="space-y-2">{periodPlaces.map(renderPlace)}</div>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {culturalNotes.length === 0 ? (
        <EmptyState icon={BookOpen} message="No cultural notes available." />
      ) : (
        <CulturalNote title={`Cultural tips for ${location ?? 'today'}`} notes={culturalNotes} />
      )}

      {tips.length === 0 ? (
        <EmptyState icon={Lightbulb} message="No tips for this day." />
      ) : (
        <DayTip tips={tips} />
      )}

      {recommendations.length > 0 && (
        <DailyRecommendation recommendations={recommendations} places={places} />
      )}
    </div>
  )
}
