interface DayCulturalNotesProps {
  notes: string[]
}

export function DayCulturalNotes({ notes }: DayCulturalNotesProps) {
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {notes.join('\n\n')}
    </div>
  )
}
