import { lazy, Suspense, useMemo, useState } from 'react'
import { ClipboardCheck, Share2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { usePackingList } from '../hooks/usePackingList'
import { usePreTravel } from '../hooks/usePreTravel'
import type {
  PackingItem,
  PreTravelCategory,
  PreTravelSection as PreTravelSectionType,
} from '../types'
import Loading from '../components/common/Loading'
import Card from '../components/common/Card'
import PackingChecklist from '../components/pretravel/PackingChecklist'
import PreTravelSection from '../components/pretravel/PreTravelSection'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ToastContainer, type Toast } from '../components/common/Toast'
import {
  PRE_TRAVEL_CATEGORIES,
  PRE_TRAVEL_SECTION_CONFIG,
  buildShareText,
  copyToClipboard,
  getPreTravelSectionConfig,
  getProgressColorClasses,
} from '../utils/preTravel'

const ChecklistItemForm = lazy(() => import('../components/pretravel/ChecklistItemForm'))
const PreTravelSectionForm = lazy(() => import('../components/pretravel/PreTravelSectionForm'))

type TabId = 'checklist' | PreTravelCategory

interface TabConfig {
  id: TabId
  label: string
  icon: React.ElementType
}

const TABS: TabConfig[] = [
  { id: 'checklist', label: 'Equipaje', icon: ClipboardCheck },
  ...PRE_TRAVEL_CATEGORIES.map((category) => ({
    id: category,
    label: PRE_TRAVEL_SECTION_CONFIG[category].label,
    icon: PRE_TRAVEL_SECTION_CONFIG[category].icon,
  })),
]

function PreTravel() {
  const {
    items: packingItems,
    loading: packingLoading,
    progress,
    create: createItem,
    update: updateItem,
    remove: removeItem,
    toggle: toggleItem,
  } = usePackingList()

  const {
    sections,
    loading: sectionsLoading,
    update: updateSection,
    toggleItem: toggleSectionItem,
  } = usePreTravel()

  const [activeTab, setActiveTab] = useState<TabId>('checklist')
  const [expandedProgress, setExpandedProgress] = useState(false)

  const [isItemFormOpen, setIsItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<PackingItem | null>(null)

  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(
    () => sections.find((s) => s.category !== 'checklist') ?? null
  )

  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const toast: Toast = { id: crypto.randomUUID(), message, type }
    setToasts((prev) => [...prev, toast])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const activeSection = useMemo(() => {
    if (activeTab === 'checklist') return null
    return sections.find((section) => section.category === activeTab) ?? null
  }, [activeTab, sections])

  const handleAddItem = () => {
    setEditingItem(null)
    setIsItemFormOpen(true)
  }

  const handleEditItem = (item: PackingItem) => {
    setEditingItem(item)
    setIsItemFormOpen(true)
  }

  const handleSaveItem = async (data: Omit<PackingItem, 'id'>, id?: string) => {
    if (id) {
      await updateItem(id, data)
      addToast('Elemento actualizado', 'success')
    } else {
      await createItem(data)
      addToast('Elemento añadido', 'success')
    }
  }

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return
    try {
      await removeItem(itemToDelete.id)
      addToast('Elemento eliminado', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Error al eliminar', 'error')
    } finally {
      setItemToDelete(null)
    }
  }

  const handleDeleteItem = (item: PackingItem) => {
    setItemToDelete(item)
  }

  const handleEditSection = (section: PreTravelSectionType) => {
    setEditingSection(section)
    setIsSectionFormOpen(true)
  }

  const handleSaveSection = async (items: PreTravelSectionType['items']) => {
    if (!editingSection) return
    await updateSection(editingSection.id, { items })
    addToast('Sección actualizada', 'success')
  }

  const handleShare = async () => {
    const text = buildShareText(packingItems)
    const success = await copyToClipboard(text)
    if (success) {
      addToast('Lista copiada al portapapeles', 'success')
    } else {
      addToast('No se pudo copiar la lista', 'error')
    }
  }

  const progressColors = getProgressColorClasses(progress.percentage)

  if (packingLoading || sectionsLoading) {
    return <Loading fullScreen label="Cargando pre-viaje..." />
  }

  return (
    <div className="space-y-4 pb-24">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pre-viaje</h1>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-travel-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
          aria-label="Compartir lista de equipaje"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Compartir
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        <button
          type="button"
          onClick={() => setExpandedProgress((prev) => !prev)}
          className="flex w-full items-center justify-between p-4"
          aria-expanded={expandedProgress}
          aria-controls="progress-details"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                progress.percentage === 100
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-travel-blue-50 text-travel-blue-600 dark:bg-travel-blue-900/30 dark:text-travel-blue-300'
              }`}
            >
              <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600 dark:text-gray-300">Progreso equipaje</p>
              <p className={`text-xl font-bold ${progressColors.textClass}`}>
                {progress.percentage}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {progress.checked}/{progress.total}
            </span>
            {expandedProgress ? (
              <ChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
          </div>
        </button>

        <div className="px-4 pb-3">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColors.barClass}`}
              style={{ width: `${progress.percentage}%` }}
              role="progressbar"
              aria-valuenow={progress.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso del equipaje"
            />
          </div>
        </div>

        {expandedProgress && (
          <div
            id="progress-details"
            className="border-t border-gray-100 px-4 py-3 dark:border-slate-800"
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
                <p className="text-gray-600 dark:text-gray-300">Items listos</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {progress.checked} de {progress.total}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
                <p className="text-gray-600 dark:text-gray-300">Esenciales</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {progress.essential.checked} de {progress.essential.total}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        role="tablist"
        aria-label="Secciones de pre-viaje"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-travel-blue-400 ${
                isActive
                  ? 'border-travel-blue-600 bg-travel-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>

      <div id={`tab-panel-${activeTab}`} role="tabpanel" className="space-y-4">
        {activeTab === 'checklist' ? (
          <PackingChecklist
            items={packingItems}
            progress={progress}
            onToggle={toggleItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onAdd={handleAddItem}
          />
        ) : activeSection ? (
          <PreTravelSection
            section={activeSection}
            onToggleItem={toggleSectionItem}
            onEdit={handleEditSection}
          />
        ) : (
          <Card className="text-center">
            <div className="flex flex-col items-center gap-3 py-8">
              {(() => {
                const config = getPreTravelSectionConfig(activeTab)
                const Icon = config.icon
                return (
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.bgClass}`}
                  >
                    <Icon className={`h-7 w-7 ${config.colorClass}`} aria-hidden="true" />
                  </div>
                )
              })()}
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  No pre-travel information available
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Aún no hay información para esta sección.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {activeTab === 'checklist' && (
        <button
          type="button"
          onClick={handleAddItem}
          className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-travel-blue-600 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-travel-blue-400 focus:ring-offset-2 active:scale-95 dark:focus:ring-offset-slate-900"
          aria-label="Añadir elemento al equipaje"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      <Suspense fallback={null}>
        <ChecklistItemForm
          isOpen={isItemFormOpen}
          item={editingItem}
          onClose={() => setIsItemFormOpen(false)}
          onSave={handleSaveItem}
        />
      </Suspense>

      <Suspense fallback={null}>
        {editingSection && (
          <PreTravelSectionForm
            section={editingSection}
            isOpen={isSectionFormOpen}
            onClose={() => setIsSectionFormOpen(false)}
            onSave={handleSaveSection}
          />
        )}
      </Suspense>

      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Eliminar elemento"
        message={
          itemToDelete
            ? `¿Seguro que quieres eliminar "${itemToDelete.name}"? Esta acción no se puede deshacer.`
            : ''
        }
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  )
}

export default PreTravel
