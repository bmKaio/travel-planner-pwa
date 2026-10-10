import { useCallback, useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'

interface NotesEditorProps {
  initialText: string
  onSave: (text: string) => Promise<void>
}

type SaveStatus = 'idle' | 'saved' | 'error'

/**
 * Saves on blur, and also when the page is hidden/closed or the editor unmounts: React does not
 * fire onBlur for a focused textarea that unmounts, so those paths would lose typed text.
 * Mount it once the notes have loaded (initial state comes from props).
 */
function NotesEditor({ initialText, onSave }: NotesEditorProps) {
  const [text, setText] = useState(initialText)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const textRef = useRef(initialText)
  const savedRef = useRef(initialText)
  const onSaveRef = useRef(onSave)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  /** Saves the latest text if it differs from the last saved one. Resolves false if nothing to do. */
  const flush = useCallback(async (): Promise<boolean> => {
    const toSave = textRef.current
    const previous = savedRef.current
    if (toSave === previous) return false
    savedRef.current = toSave // mark in flight so overlapping triggers do not save twice
    try {
      await onSaveRef.current(toSave)
      return true
    } catch (error) {
      if (savedRef.current === toSave) savedRef.current = previous // allow a retry
      throw error
    }
  }, [])

  const flushWithStatus = useCallback(() => {
    flush()
      .then((didSave) => {
        if (didSave) setStatus('saved')
      })
      .catch(() => setStatus('error'))
  }, [flush])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushWithStatus()
    }
    window.addEventListener('pagehide', flushWithStatus)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('pagehide', flushWithStatus)
      document.removeEventListener('visibilitychange', handleVisibility)
      // Unmounting: there is no UI left to report a failure on.
      flush().catch(() => undefined)
    }
  }, [flush, flushWithStatus])

  const handleChange = (next: string) => {
    textRef.current = next
    setText(next)
    // The old "saved" confirmation no longer describes what is on screen.
    setStatus('idle')
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
        onBlur={flushWithStatus}
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
