import { useState } from 'react'
import { Lock } from 'lucide-react'

interface NotesEditorProps {
  initialText: string
  onSave: (text: string) => Promise<void>
}

/** Saves on blur. Mount it once the notes have loaded (initial state comes from props). */
function NotesEditor({ initialText, onSave }: NotesEditorProps) {
  const [text, setText] = useState(initialText)
  const [saved, setSaved] = useState(initialText)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const handleChange = (next: string) => {
    setText(next)
    // The old "saved" confirmation no longer describes what is on screen.
    setStatus('idle')
  }

  const handleBlur = () => {
    if (text === saved) return
    const toSave = text
    onSave(toSave)
      .then(() => {
        setSaved(toSave)
        setStatus('saved')
      })
      .catch(() => setStatus('error'))
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="trip-notes" className="text-xl font-bold">
        Mis notas
      </label>
      <p className="-mt-1 flex items-center gap-1.5 text-[15px] text-trip-muted">
        <Lock className="h-[17px] w-[17px]" aria-hidden="true" />
        Solo las ves tú
      </p>
      <textarea
        id="trip-notes"
        rows={4}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        placeholder="Escribe aquí lo que no quieras olvidar"
        className="resize-y rounded-2xl border-[1.5px] border-trip-line bg-trip-card p-3.5 text-base text-trip-ink"
      />
      <p aria-live="polite" className="text-sm text-trip-muted">
        {status === 'saved' && 'Notas guardadas en este dispositivo.'}
        {status === 'error' && 'No se pudieron guardar las notas. Inténtalo de nuevo.'}
      </p>
    </div>
  )
}

export default NotesEditor
