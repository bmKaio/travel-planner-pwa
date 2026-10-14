import { tabId, tabPanelId, type ItineraryTab } from '../domain/itinerary'
import { SECTION_STYLE } from './sectionStyle'

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
      {tabs.map((tab) => {
        const { soft, ink } = SECTION_STYLE[tab.id]
        return (
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
                ? `${soft} ${ink} font-semibold shadow-sm ring-1 ring-inset ring-current`
                : 'font-medium text-trip-muted'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default TabBar
