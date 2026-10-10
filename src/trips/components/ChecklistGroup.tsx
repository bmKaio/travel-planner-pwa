import { Check, Lock, Users } from 'lucide-react'
import type { ChecklistGroupView } from '../domain/checklist'

interface ChecklistGroupProps {
  group: ChecklistGroupView
  onToggle: (id: string) => void
}

function ChecklistGroup({ group, onToggle }: ChecklistGroupProps) {
  const headingId = `checklist-${group.group}`
  const Icon = group.group === 'shared' ? Users : Lock
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <h2 id={headingId} className="text-xl font-bold">
          {group.title}
        </h2>
        <p className="flex items-center gap-1.5 text-[15px] text-trip-muted">
          <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
          {group.done} de {group.total}
        </p>
      </div>
      <ul className="overflow-hidden rounded-[20px] border border-trip-line bg-trip-card">
        {group.items.map((item) => (
          <li key={item.id} className="border-t border-trip-line first:border-t-0">
            <button
              type="button"
              aria-pressed={item.done}
              onClick={() => onToggle(item.id)}
              className="flex min-h-[60px] w-full items-center gap-3.5 px-4 py-2 text-left"
            >
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${
                  item.done
                    ? 'border-trip-done bg-trip-done text-trip-done-ink'
                    : 'border-trip-muted'
                }`}
              >
                {item.done && <Check className="h-[18px] w-[18px]" strokeWidth={3} />}
              </span>
              <span
                className={`flex-1 text-[17px] leading-snug ${item.done ? 'text-trip-muted line-through' : ''}`}
              >
                {item.label}
              </span>
              {item.done && <span className="text-[15px] font-bold text-trip-done">Hecho</span>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ChecklistGroup
