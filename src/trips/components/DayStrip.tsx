import { useEffect, useRef } from 'react'
import type { DayStripItem } from '../domain/itinerary'

interface DayStripProps {
  items: DayStripItem[]
  onSelect: (date: string) => void
}

function DayStrip({ items, onSelect }: DayStripProps) {
  const selectedRef = useRef<HTMLButtonElement>(null)
  const selectedDate = items.find((item) => item.isSelected)?.date

  // Keep the selected pill visible in the horizontal strip (a trip can be longer than the screen).
  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ inline: 'center', block: 'nearest' })
  }, [selectedDate])

  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 py-0.5 [scrollbar-width:none]">
      {items.map((item) => (
        <button
          key={item.date}
          ref={item.isSelected ? selectedRef : undefined}
          type="button"
          onClick={() => onSelect(item.date)}
          aria-label={item.ariaLabel}
          aria-pressed={item.isSelected}
          aria-current={item.isSelected ? 'date' : undefined}
          className={`flex h-[72px] w-[58px] shrink-0 flex-col items-center justify-center gap-px rounded-2xl border-[1.5px] ${
            item.isSelected
              ? 'border-trip-ink bg-trip-ink text-trip-bg'
              : 'border-trip-line bg-trip-card text-trip-ink'
          }`}
        >
          <span className={`text-sm ${item.isSelected ? 'text-trip-bg' : 'text-trip-muted'}`}>
            {item.weekday}
          </span>
          <span className="text-[21px] font-semibold">{item.dayOfMonth}</span>
          {item.isToday && (
            <span
              className={`text-xs font-bold ${item.isSelected ? 'text-trip-bg' : 'text-trip-action'}`}
            >
              Hoy
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default DayStrip
