import { Star, Trash2, FileText } from 'lucide-react'
import type { DocumentItem } from '../../types'
import {
  formatDocumentDate,
  getDocumentTypeConfig,
  isImageFile,
  isPdfFile,
} from '../../utils/documents'

interface DocumentCardProps {
  document: DocumentItem
  onClick: () => void
  onToggleFavorite: () => void
  onDelete: () => void
}

export function DocumentCard({ document, onClick, onToggleFavorite, onDelete }: DocumentCardProps) {
  const config = getDocumentTypeConfig(document.type)
  const Icon = config.icon
  const hasPreview = isImageFile(document.fileData) || isPdfFile(document.fileData)
  const isImage = isImageFile(document.fileData)

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900"
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles de ${document.title}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flex items-start gap-4 p-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.bgColor} ${config.borderColor} border`}
        >
          <Icon className={`h-6 w-6 ${config.color}`} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                {document.title}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {formatDocumentDate(document.createdAt)}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${config.bgColor} ${config.color}`}
            >
              {config.label}
            </span>
          </div>

          {hasPreview && (
            <div className="mt-3 flex items-center gap-3">
              {isImage ? (
                <img
                  src={document.fileData}
                  alt="Vista previa"
                  loading="lazy"
                  className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-slate-700"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800">
                  <FileText className="h-8 w-8 text-gray-400" aria-hidden="true" />
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isImage ? 'Imagen adjunta' : 'PDF adjunto'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 border-t border-gray-100 px-2 py-1 dark:border-slate-800">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleFavorite()
          }}
          className={`rounded-lg p-2 transition-colors ${
            document.favorite
              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300'
          }`}
          aria-label={document.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          aria-pressed={document.favorite}
        >
          <Star
            className="h-5 w-5"
            fill={document.favorite ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
          aria-label={`Eliminar ${document.title}`}
        >
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
