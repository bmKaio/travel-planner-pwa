import { tabId, tabPanelId, type ItineraryTab } from '../domain/itinerary'

interface TabBarProps {
  tabs: { id: ItineraryTab; label: string }[]
  active: ItineraryTab
  onChange: (tab: ItineraryTab) => void
}

function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Contenido del día"
      className="flex gap-1 rounded-2xl bg-trip-soft p-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={tabId(tab.id)}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          aria-controls={tabPanelId(tab.id)}
          onClick={() => onChange(tab.id)}
          className={`min-h-[44px] flex-1 rounded-xl text-base ${
            tab.id === active
              ? 'bg-trip-card font-semibold text-trip-ink shadow-sm'
              : 'font-medium text-trip-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabBar
