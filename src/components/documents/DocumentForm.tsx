import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Upload, FileText, Loader2 } from 'lucide-react'
import type { DocumentItem, DocumentType } from '../../types'
import Button from '../common/Button'
import {
  DOCUMENT_FORM_FIELDS,
  DOCUMENT_TYPE_CONFIG,
  DOCUMENT_TYPE_ORDER,
  fileToBase64,
  getInitialData,
  isImageFile,
  isPdfFile,
  validateFileSize,
  validateFileType,
} from '../../utils/documents'

interface DocumentFormProps {
  isOpen: boolean
  document?: DocumentItem | null
  onClose: () => void
  onSubmit: (values: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  isSaving?: boolean
}

interface FormState {
  title: string
  type: DocumentType
  data: Record<string, string>
  notes: string
  fileData?: string
  fileName?: string
}

interface FormErrors {
  title?: string
  type?: string
  data?: Record<string, string | undefined>
  file?: string
}

export function DocumentForm({
  isOpen,
  document,
  onClose,
  onSubmit,
  isSaving = false,
}: DocumentFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditMode = Boolean(document)

  const initialState: FormState = useMemo(
    () => ({
      title: document?.title ?? '',
      type: document?.type ?? 'other',
      data: (document?.data ?? getInitialData('other')) as Record<string, string>,
      notes: (document?.data.notes as string | undefined) ?? '',
      fileData: document?.fileData,
      fileName: document?.fileData ? 'archivo-adjunto' : undefined,
    }),
    [document]
  )

  const [values, setValues] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [fileLoading, setFileLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(initialState)
      setErrors({})
    }
  }, [isOpen, initialState])

  if (!isOpen) return null

  const fields = DOCUMENT_FORM_FIELDS[values.type]

  const setFieldValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, data: { ...prev.data, [name]: value } }))
    setErrors((prev) => ({
      ...prev,
      data: prev.data ? { ...prev.data, [name]: undefined } : undefined,
    }))
  }

  const handleTypeChange = (type: DocumentType) => {
    setValues((prev) => ({
      ...prev,
      type,
      data: getInitialData(type),
    }))
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const typeError = validateFileType(file)
    if (typeError) {
      setErrors((prev) => ({ ...prev, file: typeError }))
      return
    }

    const sizeError = validateFileSize(file)
    if (sizeError) {
      setErrors((prev) => ({ ...prev, file: sizeError }))
      return
    }

    setFileLoading(true)
    setErrors((prev) => ({ ...prev, file: undefined }))

    try {
      const base64 = await fileToBase64(file)
      setValues((prev) => ({ ...prev, fileData: base64, fileName: file.name }))
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        file: error instanceof Error ? error.message : 'Error al procesar el archivo',
      }))
    } finally {
      setFileLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = () => {
    setValues((prev) => ({ ...prev, fileData: undefined, fileName: undefined }))
    setErrors((prev) => ({ ...prev, file: undefined }))
  }

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}

    if (!values.title.trim()) {
      nextErrors.title = 'El título es obligatorio'
    }

    const dataErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required && !values.data[field.name]?.trim()) {
        dataErrors[field.name] = `${field.label} es obligatorio`
      }
    })
    if (Object.keys(dataErrors).length > 0) {
      nextErrors.data = dataErrors
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate() || isSaving) return

    const data: Record<string, unknown> = { ...values.data }
    if (values.notes.trim()) {
      data.notes = values.notes.trim()
    }

    await onSubmit({
      title: values.title.trim(),
      type: values.type,
      data,
      fileData: values.fileData,
    })
  }

  const TypeIcon = DOCUMENT_TYPE_CONFIG[values.type].icon

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-form-title"
    >
      <header className="safe-top sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
        <h1
          id="document-form-title"
          className="text-lg font-semibold text-gray-900 dark:text-white"
        >
          {isEditMode ? 'Editar documento' : 'Nuevo documento'}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
          aria-label="Cerrar formulario"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-5">
          <div>
            <label
              htmlFor="document-title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Título <span aria-hidden="true">*</span>
            </label>
            <input
              id="document-title"
              type="text"
              value={values.title}
              onChange={(event) => {
                setValues((prev) => ({ ...prev, title: event.target.value }))
                setErrors((prev) => ({ ...prev, title: undefined }))
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 disabled:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Ej. Vuelo a Hanói"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="document-type"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Tipo <span aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <select
                id="document-type"
                value={values.type}
                onChange={(event) => handleTypeChange(event.target.value as DocumentType)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {DOCUMENT_TYPE_ORDER.map((type) => (
                  <option key={type} value={type}>
                    {DOCUMENT_TYPE_CONFIG[type].label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <TypeIcon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </div>

          <fieldset className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <legend className="text-sm font-semibold text-gray-900 dark:text-white">
              Detalles
            </legend>

            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={`field-${field.name}`}
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {field.label}
                  {field.required && <span aria-hidden="true"> *</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`field-${field.name}`}
                    rows={4}
                    value={(values.data[field.name] as string) ?? ''}
                    onChange={(event) => setFieldValue(field.name, event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder={`Introduce ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <input
                    id={`field-${field.name}`}
                    type={field.type}
                    value={(values.data[field.name] as string) ?? ''}
                    onChange={(event) => setFieldValue(field.name, event.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder={`Introduce ${field.label.toLowerCase()}`}
                    aria-invalid={Boolean(errors.data?.[field.name])}
                    aria-describedby={errors.data?.[field.name] ? `error-${field.name}` : undefined}
                  />
                )}
                {errors.data?.[field.name] && (
                  <p
                    id={`error-${field.name}`}
                    className="mt-1 text-xs text-rose-600 dark:text-rose-400"
                  >
                    {errors.data[field.name]}
                  </p>
                )}
              </div>
            ))}
          </fieldset>

          <div>
            <label
              htmlFor="document-notes"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Notas
            </label>
            <textarea
              id="document-notes"
              rows={3}
              value={values.notes}
              onChange={(event) => setValues((prev) => ({ ...prev, notes: event.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Notas adicionales..."
            />
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Archivo adjunto
            </span>

            {!values.fileData ? (
              <div>
                <input
                  ref={fileInputRef}
                  id="document-file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Subir archivo"
                />
                <label
                  htmlFor="document-file"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-travel-blue-400 hover:bg-travel-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-travel-blue-500 dark:hover:bg-slate-800/80"
                >
                  {fileLoading ? (
                    <Loader2
                      className="h-8 w-8 animate-spin text-travel-blue-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" aria-hidden="true" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {fileLoading ? 'Procesando...' : 'Toca para subir imagen o PDF'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Máximo 5 MB</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                {isImageFile(values.fileData) ? (
                  <img
                    src={values.fileData}
                    alt="Vista previa"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white dark:bg-slate-700">
                    <FileText className="h-8 w-8 text-gray-400" aria-hidden="true" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {values.fileName ?? 'Archivo adjunto'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isImageFile(values.fileData)
                      ? 'Imagen'
                      : isPdfFile(values.fileData)
                        ? 'PDF'
                        : 'Archivo'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
                  aria-label="Eliminar archivo"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}

            {errors.file && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.file}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              isFullWidth
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" isFullWidth disabled={isSaving}>
              {isSaving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Guardar documento'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
