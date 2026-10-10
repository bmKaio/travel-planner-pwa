import { useRef, useState, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { useTrip } from '../hooks/useTrip'
import { useHelpInfo } from '../hooks/useHelpInfo'
import type { HelpInfo } from '../types'
import PageHeader from '../components/PageHeader'
import EmergencyCard from '../components/EmergencyCard'
import HelpCard from '../components/HelpCard'
import ContactList from '../components/ContactList'
import DocList from '../components/DocList'
import TripStatusMessage from '../components/TripStatusMessage'
import { tripButtonClass } from '../components/buttonStyles'

type ImportOutcome = { type: 'success' } | { type: 'error'; text: string }

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

/** Says what the stored private data holds, so the user can tell what an import brought in. */
function describeImport(help: HelpInfo | null): string {
  if (!help) return 'Datos privados importados en este dispositivo.'
  return `Datos privados importados en este dispositivo: ${plural(help.cards.length, 'tarjeta', 'tarjetas')}, ${plural(help.contacts.length, 'contacto', 'contactos')} y ${plural(help.docs.length, 'documento', 'documentos')}.`
}

function HelpPage() {
  const trip = useTrip()
  const { helpInfo, loading, error, importFromFile } = useHelpInfo(trip.id)
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (loading) return <TripStatusMessage message="Cargando el viaje…" />

  const hasPrivateData =
    !!helpInfo &&
    (helpInfo.cards.length > 0 || helpInfo.contacts.length > 0 || helpInfo.docs.length > 0)

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    setOutcome(null)
    try {
      await importFromFile(file)
      setOutcome({ type: 'success' })
    } catch (err) {
      // The Spanish reason comes from the import validation (or the JSON reader).
      setOutcome({
        type: 'error',
        text: err instanceof Error && err.message ? err.message : 'No se pudo importar el archivo.',
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // The hook also exposes a failed import as `error`; the specific reason is already shown below,
  // so this generic notice is for read failures only.
  const showHookError = !!error && outcome?.type !== 'error'

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader title="Ayuda" subtitle={trip.name} />

      {showHookError && <TripStatusMessage message="No se pudieron cargar los datos de ayuda." />}

      {helpInfo?.emergency ? (
        <EmergencyCard emergency={helpInfo.emergency} />
      ) : (
        <TripStatusMessage message="No hay número de emergencias guardado en este dispositivo. Si lo necesitas, marca el número local de emergencias." />
      )}

      {helpInfo?.cards.map((card) => (
        <HelpCard key={`${card.title}-${card.phone}`} card={card} />
      ))}
      {helpInfo && helpInfo.contacts.length > 0 && <ContactList contacts={helpInfo.contacts} />}
      {helpInfo && helpInfo.docs.length > 0 && <DocList docs={helpInfo.docs} />}

      {!hasPrivateData && (
        <TripStatusMessage message="Aún no hay datos privados en este dispositivo. Importa el archivo privado del viaje para ver el seguro, la agencia, los hoteles, los contactos y los documentos." />
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={tripButtonClass('ghost', 'w-full disabled:opacity-60')}
        >
          <Upload className="h-[18px] w-[18px]" aria-hidden="true" />
          {importing
            ? 'Importando…'
            : hasPrivateData
              ? 'Actualizar datos privados'
              : 'Importar datos privados'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFile}
          aria-label="Seleccionar archivo privado del viaje (.json)"
        />
        {outcome && (
          <p
            role={outcome.type === 'error' ? 'alert' : 'status'}
            className={`text-base ${outcome.type === 'error' ? 'text-trip-urgent' : 'text-trip-done'}`}
          >
            {outcome.type === 'error' ? outcome.text : describeImport(helpInfo)}
          </p>
        )}
      </div>
    </div>
  )
}

export default HelpPage
