import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  FileText,
  FolderOpen,
  ExternalLink,
} from 'lucide-react'
import { useDocuments } from '../hooks/useDocuments'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { DocumentCard } from '../components/documents/DocumentCard'
import { DocumentForm } from '../components/documents/DocumentForm'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import type { DocumentItem, DocumentType } from '../types'
import { DOCUMENT_TYPE_CONFIG, DOCUMENT_TYPE_ORDER, sortDocumentsByDate } from '../utils/documents'

const ALL_TYPES = 'all'

type FilterType = DocumentType | typeof ALL_TYPES

function Documents() {
  const navigate = useNavigate()
  const { documents, loading, create, update, remove, toggleFavorite } = useDocuments()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>(ALL_TYPES)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<DocumentItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let result = documents

    if (filterType !== ALL_TYPES) {
      result = result.filter((doc) => doc.type === filterType)
    }

    if (query) {
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          DOCUMENT_TYPE_CONFIG[doc.type].label.toLowerCase().includes(query)
      )
    }

    return sortDocumentsByDate(result)
  }, [documents, searchQuery, filterType])

  const hasActiveFilters = searchQuery.trim() !== '' || filterType !== ALL_TYPES

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType(ALL_TYPES)
  }

  const handleOpenNew = () => {
    setEditingDocument(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingDocument(null)
  }

  const handleSubmit = async (values: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true)
    try {
      if (editingDocument) {
        await update(editingDocument.id, values)
        addToast('Documento actualizado correctamente', 'success')
      } else {
        await create(values)
        addToast('Documento añadido correctamente', 'success')
      }
      handleCloseForm()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al guardar el documento', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingDocument) return
    try {
      await remove(deletingDocument.id)
      addToast('Documento eliminado', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al eliminar el documento', 'error')
    } finally {
      setDeletingDocument(null)
    }
  }

  const handleToggleFavorite = async (doc: DocumentItem) => {
    try {
      await toggleFavorite(doc.id, doc.favorite ?? false)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al actualizar favorito', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loading label="Cargando documentos..." />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar documentos..."
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            aria-label="Buscar documentos"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Filtrar por tipo</span>
          </div>

          <button
            type="button"
            onClick={() => setFilterType(ALL_TYPES)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filterType === ALL_TYPES
                ? 'bg-travel-blue-100 text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
            }`}
            aria-pressed={filterType === ALL_TYPES}
          >
            Todos
          </button>

          {DOCUMENT_TYPE_ORDER.map((type) => {
            const config = DOCUMENT_TYPE_CONFIG[type]
            const Icon = config.icon
            const active = filterType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? `${config.bgColor} ${config.color} ring-1 ring-inset ${config.borderColor}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                }`}
                aria-pressed={active}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {config.label}
              </button>
            )
          })}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {filteredDocuments.length}{' '}
              {filteredDocuments.length === 1 ? 'resultado' : 'resultados'}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-400"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <a
        href="https://drive.google.com/drive/folders/1W79zAhThb2j1wRxASd9tP8q9NoSWpU1R?dmr=1&ec=wgc-drive-globalnav-goto"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.99] dark:border-emerald-800/50 dark:bg-emerald-900/20"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white dark:border-emerald-700 dark:bg-slate-800">
          <FolderOpen
            className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Carpeta de documentos en Drive
          </p>
          <p className="mt-0.5 truncate text-xs text-emerald-700 dark:text-emerald-400">
            Originales escaneados · pasaportes, seguros, reservas…
          </p>
        </div>
        <ExternalLink
          className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400"
          aria-hidden="true"
        />
      </a>

      {filteredDocuments.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <div className="rounded-full bg-travel-blue-50 p-4 dark:bg-travel-blue-900/30">
            <FileText
              className="h-10 w-10 text-travel-blue-500 dark:text-travel-blue-300"
              aria-hidden="true"
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No hay documentos
          </h2>
          <p className="mt-1 max-w-xs text-sm text-gray-600 dark:text-gray-300">
            Añade tu pasaporte, seguro, billetes y reservas para tenerlos siempre a mano.
          </p>
          <Button onClick={handleOpenNew} className="mt-5">
            Añadir primer documento
          </Button>
        </div>
      ) : (
        <section aria-label="Lista de documentos" className="space-y-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onClick={() => navigate(`/documents/${doc.id}`)}
              onToggleFavorite={() => handleToggleFavorite(doc)}
              onDelete={() => setDeletingDocument(doc)}
            />
          ))}
        </section>
      )}

      <button
        type="button"
        onClick={handleOpenNew}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-travel-blue-600 text-white shadow-lg shadow-travel-blue-600/30 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-travel-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        aria-label="Añadir nuevo documento"
      >
        <Plus className="h-7 w-7" aria-hidden="true" />
      </button>

      <DocumentForm
        isOpen={isFormOpen}
        document={editingDocument}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingDocument)}
        title="Eliminar documento"
        message={`¿Seguro que quieres eliminar "${deletingDocument?.title}"? Esta acción no se puede deshacer.`}
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeletingDocument(null)}
      />
    </div>
  )
}

export default Documents
