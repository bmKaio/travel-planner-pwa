import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { PackingItem } from '../../types'

interface ChecklistItemProps {
  item: PackingItem
  onToggle: (id: string) => void
  onEdit: (item: PackingItem) => void
  onDelete: (item: PackingItem) => void
}

const NOTES_COLLAPSE_THRESHOLD = 80

function ChecklistItem({ item, onToggle, onEdit, onDelete }: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false)

  const notesText = item.notes ?? ''
  const hasLongNotes = notesText.length > NOTES_COLLAPSE_THRESHOLD
  const displayNotes =
    expanded || !hasLongNotes
      ? notesText
      : `${notesText.slice(0, NOTES_COLLAPSE_THRESHOLD).trim()}…`

  return (
    <li
      className={`flex items-start gap-3 rounded-xl border p-3 transition-all sm:p-4 ${
        item.checked
          ? 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50'
          : 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-travel-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          item.checked
            ? 'border-travel-blue-600 bg-travel-blue-600 text-white'
            : 'border-gray-300 bg-white text-transparent hover:border-travel-blue-400 dark:border-slate-600 dark:bg-slate-800'
        }`}
        aria-label={item.checked ? 'Marcar como pendiente' : 'Marcar como listo'}
        aria-pressed={item.checked}
      >
        <svg
          className="h-4 w-4"
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
            {item.name}
          </span>
          {item.essential && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              Esencial
            </span>
          )}
        </div>

        {notesText && (
          <div className="mt-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">{displayNotes}</p>
            {hasLongNotes && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-300"
                aria-expanded={expanded}
                aria-label={expanded ? 'Contraer notas' : 'Expandir notas'}
              >
                {expanded ? (
                  <>
                    Ver menos <ChevronUp className="h-3 w-3" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Ver más <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-travel-blue-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
          aria-label="Editar elemento"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
          aria-label="Eliminar elemento"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}

export default ChecklistItem
