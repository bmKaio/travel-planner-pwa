import { useState } from 'react'
import { Pencil, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import type { PreTravelSection as PreTravelSectionType, PreTravelSectionItem } from '../../types'
import Card from '../common/Card'
import { getPreTravelSectionConfig } from '../../utils/preTravel'

interface PreTravelSectionProps {
  section: PreTravelSectionType
  onToggleItem: (sectionId: string, itemId: string) => void
  onEdit: (section: PreTravelSectionType) => void
}

function PreTravelSection({ section, onToggleItem, onEdit }: PreTravelSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const config = getPreTravelSectionConfig(section.category)
  const Icon = config.icon

  const toggleDetails = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  return (
    <Card className="overflow-hidden">
      <div
        className={`flex items-center justify-between border-b p-4 ${config.borderClass} ${config.bgClass}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900">
            <Icon className={`h-5 w-5 ${config.colorClass}`} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
        </div>
        <button
          type="button"
          onClick={() => onEdit(section)}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/60 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-travel-blue-400 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-gray-100"
          aria-label="Editar sección"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-slate-800">
        {section.items.map((item) => (
          <SectionItemRow
            key={item.id}
            item={item}
            sectionId={section.id}
            isExpanded={expandedItems.has(item.id)}
            onToggle={onToggleItem}
            onToggleDetails={toggleDetails}
          />
        ))}
      </ul>
    </Card>
  )
}

interface SectionItemRowProps {
  item: PreTravelSectionItem
  sectionId: string
  isExpanded: boolean
  onToggle: (sectionId: string, itemId: string) => void
  onToggleDetails: (itemId: string) => void
}

function SectionItemRow({
  item,
  sectionId,
  isExpanded,
  onToggle,
  onToggleDetails,
}: SectionItemRowProps) {
  return (
    <li className="p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(sectionId, item.id)}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-travel-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            item.checked
              ? 'border-travel-blue-600 bg-travel-blue-600 text-white'
              : 'border-gray-300 bg-white text-transparent hover:border-travel-blue-400 dark:border-slate-600 dark:bg-slate-800'
          }`}
          aria-label={item.checked ? 'Marcar como pendiente' : 'Marcar como hecho'}
          aria-pressed={item.checked ?? false}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-medium sm:text-base ${
                item.checked
                  ? 'text-gray-500 line-through dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {item.text}
            </span>
            {item.important && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                Importante
              </span>
            )}
          </div>

          {item.details && (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => onToggleDetails(item.id)}
                className="inline-flex items-center gap-0.5 text-xs font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-300"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Contraer detalles' : 'Expandir detalles'}
              >
                {isExpanded ? 'Ver menos' : 'Ver detalles'}
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                )}
              </button>
              {isExpanded && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.details}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default PreTravelSection
