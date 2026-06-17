import { useEffect, useMemo, useState } from 'react'
import { X, Plus, Trash2, AlertCircle } from 'lucide-react'
import type { PreTravelSection, PreTravelSectionItem } from '../../types'
import Button from '../common/Button'
import { getPreTravelSectionConfig } from '../../utils/preTravel'

interface PreTravelSectionFormProps {
  section: PreTravelSection
  isOpen: boolean
  onClose: () => void
  onSave: (items: PreTravelSectionItem[]) => Promise<void>
}

function createEmptyItem(): PreTravelSectionItem {
  return {
    id: crypto.randomUUID(),
    text: '',
    important: false,
    details: '',
  }
}

function PreTravelSectionForm({ section, isOpen, onClose, onSave }: PreTravelSectionFormProps) {
  const config = useMemo(() => getPreTravelSectionConfig(section.category), [section.category])

  const initialItems = useMemo(() => section.items.map((item) => ({ ...item })), [section])

  const [items, setItems] = useState<PreTravelSectionItem[]>(initialItems)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setItems(section.items.map((item) => ({ ...item })))
      setIsSaving(false)
    }
  }, [isOpen, section])

  if (!isOpen) return null

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()])
  }

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleUpdateItem = (itemId: string, updates: Partial<PreTravelSectionItem>) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item)))
  }

  const validate = (): boolean => {
    return items.every((item) => item.text.trim().length > 0)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      alert('Todos los elementos deben tener un texto')
      return
    }
    if (isSaving) return

    const cleanedItems = items.map((item) => ({
      ...item,
      text: item.text.trim(),
      details: item.details?.trim() || undefined,
    }))

    try {
      setIsSaving(true)
      await onSave(cleanedItems)
      onClose()
    } catch (error) {
      setIsSaving(false)
      alert(error instanceof Error ? error.message : 'Error al guardar la sección')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-form-title"
    >
      <header className="safe-top sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <config.icon className={`h-5 w-5 ${config.colorClass}`} aria-hidden="true" />
          <h1
            id="section-form-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {section.title}
          </h1>
        </div>
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
        <div className="mx-auto max-w-2xl space-y-4 pb-24">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Añade, edita o elimina los consejos de esta sección.
          </p>

          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                No hay elementos en esta sección.
              </p>
            </div>
          )}

          {items.map((item, index) => (
            <fieldset
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <legend className="text-sm font-semibold text-gray-900 dark:text-white">
                  Elemento {index + 1}
                </legend>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
                  aria-label="Eliminar elemento"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor={`item-text-${item.id}`}
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Texto <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`item-text-${item.id}`}
                    type="text"
                    value={item.text}
                    onChange={(e) => handleUpdateItem(item.id, { text: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="Ej. Llevar efectivo en VND"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`item-details-${item.id}`}
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Detalles <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    id={`item-details-${item.id}`}
                    value={item.details ?? ''}
                    onChange={(e) => handleUpdateItem(item.id, { details: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="Información adicional..."
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-slate-700">
                  <input
                    id={`item-important-${item.id}`}
                    type="checkbox"
                    checked={item.important}
                    onChange={(e) => handleUpdateItem(item.id, { important: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <label
                    htmlFor={`item-important-${item.id}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-500" aria-hidden="true" />
                    Importante
                  </label>
                </div>
              </div>
            </fieldset>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-travel-blue-400 hover:bg-travel-blue-50 hover:text-travel-blue-700 dark:border-slate-600 dark:text-gray-300 dark:hover:border-travel-blue-500 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Añadir elemento
          </button>
        </div>
      </form>

      <div className="safe-bottom sticky bottom-0 border-t border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button
            type="button"
            variant="secondary"
            isFullWidth
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" isFullWidth disabled={isSaving} onClick={handleSubmit}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PreTravelSectionForm
