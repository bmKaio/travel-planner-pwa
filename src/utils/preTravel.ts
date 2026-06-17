import {
  FileText,
  Heart,
  Shirt,
  Cpu,
  Droplets,
  Package,
  Syringe,
  DollarSign,
  Wifi,
  Shield,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'
import type { PackingCategory, PackingItem, PreTravelCategory } from '../types'

export interface PackingCategoryConfig {
  label: string
  icon: LucideIcon
  colorClass: string
  bgClass: string
  borderClass: string
}

export const PACKING_CATEGORY_CONFIG: Record<PackingCategory, PackingCategoryConfig> = {
  documents: {
    label: 'Documentos',
    icon: FileText,
    colorClass: 'text-blue-600 dark:text-blue-300',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  health: {
    label: 'Salud',
    icon: Heart,
    colorClass: 'text-red-600 dark:text-red-300',
    bgClass: 'bg-red-50 dark:bg-red-900/30',
    borderClass: 'border-red-200 dark:border-red-800',
  },
  clothing: {
    label: 'Ropa',
    icon: Shirt,
    colorClass: 'text-purple-600 dark:text-purple-300',
    bgClass: 'bg-purple-50 dark:bg-purple-900/30',
    borderClass: 'border-purple-200 dark:border-purple-800',
  },
  electronics: {
    label: 'Electrónica',
    icon: Cpu,
    colorClass: 'text-gray-600 dark:text-gray-300',
    bgClass: 'bg-gray-50 dark:bg-gray-800/50',
    borderClass: 'border-gray-200 dark:border-gray-700',
  },
  toiletries: {
    label: 'Aseo',
    icon: Droplets,
    colorClass: 'text-cyan-600 dark:text-cyan-300',
    bgClass: 'bg-cyan-50 dark:bg-cyan-900/30',
    borderClass: 'border-cyan-200 dark:border-cyan-800',
  },
  misc: {
    label: 'Misc',
    icon: Package,
    colorClass: 'text-orange-600 dark:text-orange-300',
    bgClass: 'bg-orange-50 dark:bg-orange-900/30',
    borderClass: 'border-orange-200 dark:border-orange-800',
  },
}

export const PACKING_CATEGORIES: PackingCategory[] = [
  'documents',
  'health',
  'clothing',
  'electronics',
  'toiletries',
  'misc',
]

export interface PreTravelSectionConfig {
  label: string
  icon: LucideIcon
  colorClass: string
  bgClass: string
  borderClass: string
}

export const PRE_TRAVEL_SECTION_CONFIG: Record<PreTravelCategory, PreTravelSectionConfig> = {
  checklist: {
    label: 'Checklist de equipaje',
    icon: FileText,
    colorClass: 'text-blue-600 dark:text-blue-300',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  vaccines: {
    label: 'Vacunas y salud',
    icon: Syringe,
    colorClass: 'text-red-600 dark:text-red-300',
    bgClass: 'bg-red-50 dark:bg-red-900/30',
    borderClass: 'border-red-200 dark:border-red-800',
  },
  money: {
    label: 'Dinero y pagos',
    icon: DollarSign,
    colorClass: 'text-green-600 dark:text-green-300',
    bgClass: 'bg-green-50 dark:bg-green-900/30',
    borderClass: 'border-green-200 dark:border-green-800',
  },
  connectivity: {
    label: 'Conectividad',
    icon: Wifi,
    colorClass: 'text-blue-600 dark:text-blue-300',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  safety: {
    label: 'Seguridad',
    icon: Shield,
    colorClass: 'text-orange-600 dark:text-orange-300',
    bgClass: 'bg-orange-50 dark:bg-orange-900/30',
    borderClass: 'border-orange-200 dark:border-orange-800',
  },
  tips: {
    label: 'Consejos prácticos',
    icon: Lightbulb,
    colorClass: 'text-yellow-600 dark:text-yellow-300',
    bgClass: 'bg-yellow-50 dark:bg-yellow-900/30',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
  },
}

export const PRE_TRAVEL_CATEGORIES: PreTravelCategory[] = [
  'vaccines',
  'money',
  'connectivity',
  'safety',
  'tips',
]

export function getPackingCategoryConfig(category: PackingCategory): PackingCategoryConfig {
  return PACKING_CATEGORY_CONFIG[category] ?? PACKING_CATEGORY_CONFIG.misc
}

export function getPreTravelSectionConfig(category: PreTravelCategory): PreTravelSectionConfig {
  return PRE_TRAVEL_SECTION_CONFIG[category] ?? PRE_TRAVEL_SECTION_CONFIG.tips
}

export function getProgressColorClasses(percentage: number): {
  barClass: string
  textClass: string
} {
  if (percentage <= 33) {
    return {
      barClass: 'bg-red-500',
      textClass: 'text-red-600 dark:text-red-400',
    }
  }
  if (percentage <= 66) {
    return {
      barClass: 'bg-yellow-500',
      textClass: 'text-yellow-600 dark:text-yellow-400',
    }
  }
  return {
    barClass: 'bg-green-500',
    textClass: 'text-green-600 dark:text-green-400',
  }
}

export function buildShareText(items: PackingItem[]): string {
  const checked = items.filter((item) => item.checked).length
  const total = items.length
  const percentage = total === 0 ? 0 : Math.round((checked / total) * 100)

  const lines: string[] = []
  lines.push('📋 Lista de equipaje - Vietnam/Camboya 2026')
  lines.push('')

  for (const category of PACKING_CATEGORIES) {
    const categoryItems = items.filter((item) => item.category === category)
    if (categoryItems.length === 0) continue

    const config = getPackingCategoryConfig(category)
    lines.push(`✅ ${config.label}:`)
    for (const item of categoryItems) {
      lines.push(`- [${item.checked ? 'x' : ' '}] ${item.name}`)
    }
    lines.push('')
  }

  lines.push(`Progreso: ${checked}/${total} items (${percentage}%)`)
  return lines.join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fallthrough to fallback
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  textarea.setAttribute('aria-hidden', 'true')
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)
    return successful
  } catch {
    document.body.removeChild(textarea)
    return false
  }
}
