import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Upload } from 'lucide-react'
import { useDiary } from '../hooks/useDiary'

function Diary() {
  const navigate = useNavigate()
  const { entries, loading, importFromFile } = useDiary()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus(null)
    try {
      const { imported } = await importFromFile(file)
      setStatus(`Diario importado: ${imported} días.`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al importar el diario.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Diario de viaje</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Recuerdos, comidas y momentos día a día.
        </p>
      </div>

      {!loading && entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <BookOpen
            className="mx-auto mb-3 h-10 w-10 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <h2 className="font-semibold text-gray-900 dark:text-white">Aún no hay diario</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
            El diario es privado y no se sincroniza. Impórtalo desde tu archivo para verlo en este
            dispositivo.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-travel-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-travel-blue-700"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Importar diario
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.date}>
              <button
                type="button"
                onClick={() => navigate(`/diary/${entry.date}`)}
                className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-travel-blue-50 font-bold text-travel-blue-600 dark:bg-travel-blue-900/30 dark:text-travel-blue-300">
                  {entry.dayNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                    {entry.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {entry.date}
                    {entry.weather ? ` · ${entry.weather}` : ''}
                  </p>
                </div>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {status && <p className="text-center text-sm text-gray-600 dark:text-gray-300">{status}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}

export default Diary
