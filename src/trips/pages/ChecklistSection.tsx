import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useChecklist } from '../hooks/useChecklist'
import { useNotes } from '../hooks/useNotes'
import { summarizeChecklist } from '../domain/checklist'
import ChecklistGroup from '../components/ChecklistGroup'
import NotesEditor from '../components/NotesEditor'
import SectionHeading from '../components/SectionHeading'
import TripStatusMessage from '../components/TripStatusMessage'

/** Checklist and notes of a trip, rendered at the end of the "Ayuda" page. */
function ChecklistSection({ tripId }: { tripId: string }) {
  const { items, loading, error, toggle } = useChecklist(tripId)
  const notes = useNotes(tripId)
  const summary = useMemo(() => summarizeChecklist(items), [items])
  // `notes.error` mixes read and save failures. Latch "loaded OK" so a failed save never
  // unmounts the editor (losing typed text) and a failed read never mounts it empty (a later
  // save would overwrite the stored notes).
  const [notesReady, setNotesReady] = useState(false)
  if (!notesReady && !notes.loading && !notes.error) setNotesReady(true)

  // Old /checklist links redirect to help#checklist: bring the section into view once loaded.
  const { hash } = useLocation()
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!loading && hash === '#checklist') sectionRef.current?.scrollIntoView?.({ block: 'start' })
  }, [loading, hash])

  return (
    <section
      ref={sectionRef}
      id="checklist"
      aria-labelledby="checklist-heading"
      className="flex scroll-mt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] flex-col gap-[18px]"
    >
      <SectionHeading section="checklist" id="checklist-heading" size="lg">
        Checklist
      </SectionHeading>

      {loading ? (
        <TripStatusMessage message="Cargando el viaje…" />
      ) : (
        <>
          {summary.total > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold">
                {summary.done} de {summary.total} hechas
              </p>
              <div
                role="progressbar"
                aria-label="Progreso del checklist"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={summary.percent}
                className="h-2.5 overflow-hidden rounded-full bg-trip-soft"
              >
                <div
                  className="h-2.5 rounded-full bg-trip-done"
                  style={{ width: `${summary.percent}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <TripStatusMessage
              tone="error"
              message={
                items.length === 0
                  ? 'No se pudieron cargar los datos del viaje.'
                  : 'No se pudo guardar el cambio. Inténtalo de nuevo.'
              }
            />
          )}

          {summary.groups.map((group) => (
            <ChecklistGroup
              key={group.group}
              group={group}
              onToggle={(id) => {
                toggle(id).catch(() => undefined)
              }}
            />
          ))}
        </>
      )}

      {notesReady && <NotesEditor key={tripId} initialText={notes.text} onSave={notes.save} />}
      {!notesReady && notes.error && (
        <TripStatusMessage tone="error" message="No se pudieron cargar las notas." />
      )}
    </section>
  )
}

export default ChecklistSection
