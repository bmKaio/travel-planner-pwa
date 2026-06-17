import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { PackingCategory, PackingItem } from '../../types'
import Button from '../common/Button'
import { PACKING_CATEGORIES, getPackingCategoryConfig } from '../../utils/preTravel'

interface ChecklistItemFormProps {
  isOpen: boolean
  item?: PackingItem | null
  onClose: () => void
  onSave: (data: Omit<PackingItem, 'id'>, id?: string) => Promise<void>
}

interface FormErrors {
  name?: string
}

function ChecklistItemForm({ isOpen, item, onClose, onSave }: ChecklistItemFormProps) {
  const isEditing = Boolean(item)

  const initialValues = useMemo(
    () => ({
      name: item?.name ?? '',
      category: item?.category ?? 'misc',
      essential: item?.essential ?? false,
      notes: item?.notes ?? '',
      checked: item?.checked ?? false,
    }),
    [item]
  )

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues)
      setErrors({})
      setIsSaving(false)
    }
  }, [isOpen, initialValues])

  if (!isOpen) return null

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}
    if (!values.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate() || isSaving) return

    const data: Omit<PackingItem, 'id'> = {
      name: values.name.trim(),
      category: values.category as PackingCategory,
      essential: values.essential,
      notes: values.notes.trim() || undefined,
      checked: values.checked,
    }

    try {
      setIsSaving(true)
      await onSave(data, item?.id)
      onClose()
    } catch (error) {
      setIsSaving(false)
      alert(error instanceof Error ? error.message : 'Error al guardar el elemento')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checklist-form-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800">
          <h2
            id="checklist-form-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {isEditing ? 'Editar elemento' : 'Añadir elemento'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-slate-800"
            aria-label="Cerrar formulario"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label
              htmlFor="item-name"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Nombre <span className="text-rose-500">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              value={values.name}
              onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Ej. Pasaporte"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              autoFocus
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="item-category"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Categoría
            </label>
            <div className="relative">
              <select
                id="item-category"
                value={values.category}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, category: e.target.value as PackingCategory }))
                }
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {PACKING_CATEGORIES.map((category) => {
                  const config = getPackingCategoryConfig(category)
                  return (
                    <option key={category} value={category}>
                      {config.label}
                    </option>
                  )
                })}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {(() => {
                  const Icon = getPackingCategoryConfig(values.category as PackingCategory).icon
                  return <Icon className="h-5 w-5" aria-hidden="true" />
                })()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-slate-700">
            <input
              id="item-essential"
              type="checkbox"
              checked={values.essential}
              onChange={(e) => setValues((prev) => ({ ...prev, essential: e.target.checked }))}
              className="h-5 w-5 rounded border-gray-300 text-travel-blue-600 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800"
            />
            <label
              htmlFor="item-essential"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Esencial
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Marcar si no puedes olvidarlo
            </span>
          </div>

          <div>
            <label
              htmlFor="item-notes"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Notas <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="item-notes"
              value={values.notes}
              onChange={(e) => setValues((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Notas adicionales..."
            />
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
              {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Añadir'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChecklistItemForm
