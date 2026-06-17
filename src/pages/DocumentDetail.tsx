import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Edit,
  Share2,
  Trash2,
  FileText,
  Star,
  ExternalLink,
  Download,
} from 'lucide-react'
import { useDocuments } from '../hooks/useDocuments'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { DocumentForm } from '../components/documents/DocumentForm'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import type { DocumentItem } from '../types'
import {
  buildDocumentShareText,
  formatDate,
  formatDateTime,
  formatFieldLabel,
  formatTime,
  getDocumentTypeConfig,
  isImageFile,
  isPdfFile,
} from '../utils/documents'

function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { documents, loading, update, remove, toggleFavorite } = useDocuments()

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const doc = useMemo(() => documents.find((item) => item.id === id) ?? null, [documents, id])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const toastId = crypto.randomUUID()
    setToasts((prev) => [...prev, { id: toastId, message, type }])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
  }

  const handleCopyShare = async () => {
    if (!doc) return
    const text = buildDocumentShareText(doc)
    try {
      await navigator.clipboard.writeText(text)
      addToast('Copiado al portapapeles', 'success')
    } catch {
      addToast('No se pudo copiar al portapapeles', 'error')
    }
  }

  const handleDelete = async () => {
    if (!doc) return
    try {
      await remove(doc.id)
      navigate('/documents', { replace: true })
      addToast('Documento eliminado', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al eliminar el documento', 'error')
      setShowDeleteConfirm(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!doc) return
    try {
      await toggleFavorite(doc.id, doc.favorite ?? false)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al actualizar favorito', 'error')
    }
  }

  const handleSubmitEdit = async (values: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!doc) return
    setIsSaving(true)
    try {
      await update(doc.id, values)
      setIsEditing(false)
      addToast('Documento actualizado', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al guardar el documento', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    if (!doc?.fileData) return
    const link = window.document.createElement('a')
    link.href = doc.fileData
    link.download = doc.title
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loading label="Cargando documento..." />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <FileText className="h-12 w-12 text-gray-300 dark:text-slate-600" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documento no encontrado
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Es posible que haya sido eliminado.
          </p>
        </div>
        <Button onClick={() => navigate('/documents')}>Volver a documentos</Button>
      </div>
    )
  }

  const config = getDocumentTypeConfig(doc.type)
  const TypeIcon = config.icon
  const dataEntries = Object.entries(doc.data).filter(
    ([key, value]) => key !== 'notes' && value !== undefined && value !== ''
  )
  const notes = doc.data.notes as string | undefined

  return (
    <div className="space-y-4 pb-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <button
        type="button"
        onClick={() => navigate('/documents')}
        className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-400"
        aria-label="Volver a documentos"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver
      </button>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className={`${config.bgColor} border-b ${config.borderColor} p-4`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/50 bg-white/60 dark:bg-slate-900/40">
                <TypeIcon className={`h-6 w-6 ${config.color}`} aria-hidden="true" />
              </div>
              <div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.bgColor} ${config.color} border ${config.borderColor}`}
                >
                  {config.label}
                </span>
                <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  {doc.title}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`rounded-full p-2 transition-colors ${
                doc.favorite
                  ? 'bg-amber-100 text-amber-500 dark:bg-amber-900/40'
                  : 'bg-white/60 text-gray-400 hover:text-gray-600 dark:bg-slate-900/40 dark:hover:text-gray-300'
              }`}
              aria-label={doc.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              aria-pressed={doc.favorite}
            >
              <Star
                className="h-5 w-5"
                fill={doc.favorite ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Creado {new Date(doc.createdAt).toLocaleDateString('es-ES')}</span>
          </div>

          {dataEntries.length > 0 && (
            <dl className="mt-5 space-y-3">
              {dataEntries.map(([key, value]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {formatFieldLabel(key)}
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {renderFieldValue(key, value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {notes && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Notas
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                {notes}
              </p>
            </div>
          )}

          {doc.fileData && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Archivo adjunto
              </h2>
              <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800">
                {isImageFile(doc.fileData) ? (
                  <img
                    src={doc.fileData}
                    alt="Documento adjunto"
                    loading="lazy"
                    className="max-h-96 w-full object-contain"
                  />
                ) : isPdfFile(doc.fileData) ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-6">
                    <FileText className="h-12 w-12 text-gray-400" aria-hidden="true" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Archivo PDF adjunto</p>
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2 border-t border-gray-200 p-3 dark:border-slate-700">
                  {isImageFile(doc.fileData) && (
                    <a
                      href={doc.fileData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-travel-blue-600 hover:bg-travel-blue-50 dark:text-travel-blue-400 dark:hover:bg-travel-blue-900/20"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Ver
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
          <Edit className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Editar
        </Button>
        <Button variant="secondary" onClick={handleCopyShare}>
          <Share2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Compartir
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Eliminar
        </Button>
      </div>

      <DocumentForm
        isOpen={isEditing}
        document={doc}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSubmitEdit}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar documento"
        message={`¿Seguro que quieres eliminar "${doc.title}"? Esta acción no se puede deshacer.`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

function renderFieldValue(key: string, value: unknown): React.ReactNode {
  if (value === undefined || value === null || value === '') return '-'

  const lowerKey = key.toLowerCase()
  if (lowerKey.includes('date') || lowerKey.includes('departure') || lowerKey.includes('arrival')) {
    if (typeof value === 'string') {
      return formatDateTime(value)
    }
  }
  if (
    lowerKey.includes('expiration') ||
    lowerKey.includes('checkin') ||
    lowerKey.includes('checkout')
  ) {
    if (typeof value === 'string') {
      return formatDate(value)
    }
  }
  if (lowerKey.includes('time')) {
    if (typeof value === 'string') {
      return formatTime(value)
    }
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return String(value)
}

export default DocumentDetail
