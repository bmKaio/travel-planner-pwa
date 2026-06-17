import { useMemo, useState } from 'react'
import { Search, X, ChevronDown, ChevronUp, PackagePlus } from 'lucide-react'
import type { PackingCategory, PackingItem } from '../../types'
import type { PackingProgress, UsePackingListResult } from '../../hooks/usePackingList'
import Button from '../common/Button'
import Card from '../common/Card'
import ChecklistItem from './ChecklistItem'
import {
  PACKING_CATEGORIES,
  getPackingCategoryConfig,
  getProgressColorClasses,
} from '../../utils/preTravel'

interface PackingChecklistProps {
  items: PackingItem[]
  progress: PackingProgress
  onToggle: UsePackingListResult['toggle']
  onEdit: (item: PackingItem) => void
  onDelete: (item: PackingItem) => void
  onAdd: () => void
}

function PackingChecklist({
  items,
  progress,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: PackingChecklistProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<PackingCategory | 'all'>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<PackingCategory>>(
    () => new Set(PACKING_CATEGORIES)
  )

  const toggleCategory = (category: PackingCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const expandAll = () => setExpandedCategories(new Set(PACKING_CATEGORIES))
  const collapseAll = () => setExpandedCategories(new Set())

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      const matchesSearch = !query || item.name.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [items, searchQuery, categoryFilter])

  const grouped = useMemo(() => {
    const groups: Record<PackingCategory, PackingItem[]> = {
      documents: [],
      health: [],
      clothing: [],
      electronics: [],
      toiletries: [],
      misc: [],
    }
    for (const item of filteredItems) {
      groups[item.category].push(item)
    }
    return groups
  }, [filteredItems])

  const progressColors = getProgressColorClasses(progress.percentage)

  if (items.length === 0) {
    return (
      <Card className="text-center">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-travel-blue-50 dark:bg-travel-blue-900/30">
            <PackagePlus className="h-7 w-7 text-travel-blue-500" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              No items in your packing list
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Empieza añadiendo lo que no quieres olvidar.
            </p>
          </div>
          <Button onClick={onAdd} className="mt-2 px-4 py-2.5 text-sm">
            Añadir tu primer elemento
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Progreso general</p>
            <p className={`text-2xl font-bold ${progressColors.textClass}`}>
              {progress.percentage}%
            </p>
          </div>
          <div className="text-right text-sm text-gray-600 dark:text-gray-300">
            <p>
              <span className="font-semibold text-gray-900 dark:text-white">
                {progress.checked}
              </span>{' '}
              / {progress.total} listos
            </p>
            {progress.essential.total > 0 && (
              <p className="mt-0.5 text-xs">
                Esenciales: {progress.essential.checked}/{progress.essential.total}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColors.barClass}`}
            style={{ width: `${progress.percentage}%` }}
            role="progressbar"
            aria-valuenow={progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Porcentaje de equipaje completado"
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en la lista..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            aria-label="Buscar elementos"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PackingCategory | 'all')}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-travel-blue-500 focus:outline-none focus:ring-2 focus:ring-travel-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          aria-label="Filtrar por categoría"
        >
          <option value="all">Todas las categorías</option>
          {PACKING_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {getPackingCategoryConfig(category).label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={expandAll}
          className="text-xs font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-300"
        >
          Expandir todo
        </button>
        <span className="text-gray-300 dark:text-slate-600">|</span>
        <button
          type="button"
          onClick={collapseAll}
          className="text-xs font-medium text-travel-blue-600 hover:text-travel-blue-700 dark:text-travel-blue-300"
        >
          Colapsar todo
        </button>
      </div>

      <div className="space-y-3">
        {PACKING_CATEGORIES.map((category) => {
          const categoryItems = grouped[category]
          if (categoryItems.length === 0) {
            if (categoryFilter !== 'all' && categoryFilter === category) {
              return (
                <Card key={category} className="text-center">
                  <p className="py-4 text-sm text-gray-600 dark:text-gray-300">
                    No items in this category
                  </p>
                </Card>
              )
            }
            return null
          }

          const config = getPackingCategoryConfig(category)
          const Icon = config.icon
          const checkedCount = categoryItems.filter((item) => item.checked).length
          const categoryPercentage =
            categoryItems.length === 0 ? 0 : Math.round((checkedCount / categoryItems.length) * 100)
          const isExpanded = expandedCategories.has(category)

          return (
            <Card key={category} className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className={`flex w-full items-center justify-between border-b p-4 transition-colors ${
                  isExpanded ? config.borderClass : 'border-transparent'
                } ${config.bgClass}`}
                aria-expanded={isExpanded}
                aria-controls={`category-${category}-content`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border ${config.borderClass} bg-white dark:bg-slate-900`}
                  >
                    <Icon className={`h-5 w-5 ${config.colorClass}`} aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{config.label}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {checkedCount}/{categoryItems.length} items · {categoryPercentage}%
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                )}
              </button>

              {isExpanded && (
                <ul
                  id={`category-${category}-content`}
                  className="divide-y divide-gray-100 p-3 dark:divide-slate-800"
                >
                  {categoryItems.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      onToggle={onToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </ul>
              )}
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && items.length > 0 && (
        <Card className="text-center">
          <p className="py-6 text-sm text-gray-600 dark:text-gray-300">
            Ningún elemento coincide con tu búsqueda.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter('all')
            }}
            className="px-4 py-2.5 text-sm"
          >
            Limpiar filtros
          </Button>
        </Card>
      )}
    </div>
  )
}

export default PackingChecklist
