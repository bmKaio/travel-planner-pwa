import { BookOpen } from 'lucide-react'

interface DayCulturalNotesProps {
  notes: string[]
}

export function DayCulturalNotes({ notes }: DayCulturalNotesProps) {
  return (
    <div className="space-y-3">
      {notes.map((note, index) => (
        <div
          key={index}
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 dark:bg-amber-600">
              <BookOpen className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              ¿Sabías que…?
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{note}</p>
        </div>
      ))}
    </div>
  )
}
