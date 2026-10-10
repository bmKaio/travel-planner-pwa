import { useMemo, useState } from 'react'
import { useTrip } from '../hooks/useTrip'
import { useChecklist } from '../hooks/useChecklist'
import { useNotes } from '../hooks/useNotes'
import { summarizeChecklist } from '../domain/checklist'
import PageHeader from '../components/PageHeader'
import ChecklistGroup from '../components/ChecklistGroup'
import NotesEditor from '../components/NotesEditor'
import TripStatusMessage from '../components/TripStatusMessage'

function ChecklistPage() {
  const trip = useTrip()
  const { items, loading, error, toggle } = useChecklist(trip.id)
  const notes = useNotes(trip.id)
  const summary = useMemo(() => summarizeChecklist(items), [items])
  // `notes.error` mixes read and save failures. Latch "loaded OK" so a failed save never
  // unmounts the editor (losing typed text) and a failed read never mounts it empty (a later
  // save would overwrite the stored notes).
  const [notesReady, setNotesReady] = useState(false)
  if (!notesReady && !notes.loading && !notes.error) setNotesReady(true)

  if (loading) return <TripStatusMessage message="Cargando el viaje…" />

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Checklist" subtitle={trip.name} />

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

      {notesReady && <NotesEditor key={trip.id} initialText={notes.text} onSave={notes.save} />}
      {!notesReady && notes.error && (
        <TripStatusMessage message="No se pudieron cargar las notas." />
      )}
    </div>
  )
}

export default ChecklistPage
