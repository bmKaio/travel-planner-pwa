import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

interface CulturalNoteProps {
  title?: string
  notes: string[]
}

const MAX_COLLAPSED_LENGTH = 160

export function CulturalNote({ title, notes }: CulturalNoteProps) {
  const [expanded, setExpanded] = useState(false)

  if (notes.length === 0) return null

  const content = notes.join('\n\n')
  const isLong = content.length > MAX_COLLAPSED_LENGTH
  const displayedContent =
    isLong && !expanded ? `${content.slice(0, MAX_COLLAPSED_LENGTH)}...` : content

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900/40">
          <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title ?? 'Cultural context'}
          </h3>
          <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {displayedContent}
          </div>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400"
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
