import { Contact, FileText, Home, Plane, Shield, type LucideIcon } from 'lucide-react'
import type { DocumentItem, DocumentType } from '../types'

export const DOCUMENT_TYPE_ORDER: DocumentType[] = [
  'passport',
  'insurance',
  'flight',
  'accommodation',
  'other',
]

export interface DocumentTypeConfig {
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
}

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, DocumentTypeConfig> = {
  passport: {
    label: 'Pasaporte',
    icon: Contact,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  insurance: {
    label: 'Seguro',
    icon: Shield,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  flight: {
    label: 'Vuelo',
    icon: Plane,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  accommodation: {
    label: 'Alojamiento',
    icon: Home,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  other: {
    label: 'Otro',
    icon: FileText,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    borderColor: 'border-gray-200 dark:border-gray-700',
  },
}

export function getDocumentTypeConfig(type: DocumentType): DocumentTypeConfig {
  return DOCUMENT_TYPE_CONFIG[type]
}

export function formatDocumentDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value: string | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(value: string | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(value: string | undefined): string {
  if (!value) return '-'
  // Support both full ISO strings and HH:mm
  if (value.includes('T')) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }
  return value
}

const FILE_SIZE_LIMIT = 5 * 1024 * 1024

export function validateFileSize(file: File): string | null {
  if (file.size > FILE_SIZE_LIMIT) {
    return `El archivo supera los 5 MB (${(file.size / 1024 / 1024).toFixed(1)} MB). Reduce el tamaño o elige otro archivo.`
  }
  return null
}

export function validateFileType(file: File): string | null {
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    return 'Solo se permiten imágenes y archivos PDF.'
  }
  return null
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('No se pudo leer el archivo como base64'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }
    reader.readAsDataURL(file)
  })
}

export function isImageFile(fileData?: string): boolean {
  return fileData?.startsWith('data:image/') ?? false
}

export function isPdfFile(fileData?: string): boolean {
  return fileData?.startsWith('data:application/pdf') ?? false
}

export function getFileNameFromDataUrl(fileData?: string): string {
  if (!fileData) return 'archivo'
  const match = fileData.match(/name=([^;]+)/)
  return match?.[1] ?? 'archivo'
}

export function buildDocumentShareText(doc: DocumentItem): string {
  const lines: string[] = []
  lines.push(doc.title)
  lines.push(`Tipo: ${getDocumentTypeConfig(doc.type).label}`)
  lines.push(`Actualizado: ${formatDocumentDate(doc.updatedAt)}`)

  const notes = doc.data.notes as string | undefined
  if (notes) lines.push(`Notas: ${notes}`)

  Object.entries(doc.data).forEach(([key, value]) => {
    if (key === 'notes' || value === undefined || value === '') return
    lines.push(`${formatFieldLabel(key)}: ${String(value)}`)
  })

  return lines.join('\n')
}

export function formatFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    number: 'Número',
    expiration: 'Caducidad',
    nationality: 'Nacionalidad',
    policyNumber: 'Póliza',
    company: 'Compañía',
    emergencyPhone: 'Teléfono de emergencia',
    email: 'Correo de asistencia',
    whatsapp: 'WhatsApp',
    airline: 'Aerolínea',
    flightNumber: 'Número de vuelo',
    departure: 'Salida',
    arrival: 'Llegada',
    date: 'Fecha',
    time: 'Hora',
    hotelName: 'Hotel',
    address: 'Dirección',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    confirmation: 'Confirmación',
    text: 'Texto',
    location: 'Ubicación',
    nights: 'Noches',
    night: 'Noche',
    route: 'Ruta',
    duration: 'Duración',
    note: 'Nota',
    bookingUrl: 'Reserva',
    googleMapsUrl: 'Mapa',
    bookingReference: 'Referencia',
  }
  return labels[key] ?? key
}

export const DOCUMENT_FORM_FIELDS: Record<
  DocumentType,
  { name: string; label: string; type: string; required?: boolean }[]
> = {
  passport: [
    { name: 'number', label: 'Número de pasaporte', type: 'text', required: true },
    { name: 'expiration', label: 'Fecha de caducidad', type: 'date', required: true },
    { name: 'nationality', label: 'Nacionalidad', type: 'text', required: true },
  ],
  insurance: [
    { name: 'policyNumber', label: 'Número de póliza', type: 'text', required: true },
    { name: 'company', label: 'Compañía aseguradora', type: 'text', required: true },
    { name: 'emergencyPhone', label: 'Teléfono de emergencia', type: 'tel', required: true },
    { name: 'email', label: 'Correo de asistencia', type: 'email' },
    { name: 'whatsapp', label: 'WhatsApp de asistencia', type: 'tel' },
  ],
  flight: [
    { name: 'airline', label: 'Aerolínea', type: 'text', required: true },
    { name: 'flightNumber', label: 'Número de vuelo', type: 'text', required: true },
    { name: 'departure', label: 'Aeropuerto de salida', type: 'text', required: true },
    { name: 'arrival', label: 'Aeropuerto de llegada', type: 'text', required: true },
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'time', label: 'Hora', type: 'time', required: true },
  ],
  accommodation: [
    { name: 'hotelName', label: 'Nombre del hotel', type: 'text', required: true },
    { name: 'address', label: 'Dirección', type: 'text' },
    { name: 'checkIn', label: 'Check-in', type: 'date', required: true },
    { name: 'checkOut', label: 'Check-out', type: 'date', required: true },
    { name: 'confirmation', label: 'Código de confirmación', type: 'text' },
  ],
  other: [{ name: 'text', label: 'Texto libre', type: 'textarea' }],
}

export function getInitialData(type: DocumentType): Record<string, string> {
  const fields = DOCUMENT_FORM_FIELDS[type]
  return Object.fromEntries(fields.map((field) => [field.name, '']))
}

/**
 * Resolve the chronological event date of a document, when it has one.
 * - flight: `data.departure` (ISO datetime or date-only string)
 * - accommodation: check-in date, taken from `data.night` (single string)
 *   or the earliest entry of `data.nights` (array of strings)
 * Other types (passport, insurance, other) have no event date.
 */
export function getDocumentEventDate(doc: DocumentItem): string | undefined {
  if (doc.type === 'flight') {
    const departure = doc.data.departure
    return typeof departure === 'string' && departure !== '' ? departure : undefined
  }

  if (doc.type === 'accommodation') {
    const { night, nights } = doc.data as { night?: unknown; nights?: unknown }
    if (typeof night === 'string' && night !== '') return night
    if (Array.isArray(nights)) {
      const validNights = nights.filter((n): n is string => typeof n === 'string' && n !== '')
      if (validNights.length > 0) {
        return [...validNights].sort()[0]
      }
    }
  }

  return undefined
}

/**
 * Human-readable event-date label for a document, or null when there is none.
 * Flights with a time component show date + time; everything else shows the date only.
 */
export function formatDocumentEventLabel(doc: DocumentItem): string | null {
  const eventDate = getDocumentEventDate(doc)
  if (!eventDate) return null
  if (doc.type === 'flight' && eventDate.includes('T')) {
    return formatDateTime(eventDate)
  }
  return formatDate(eventDate)
}

/**
 * Sort documents chronologically by event date (ascending).
 * Documents without an event date are pushed to the end.
 */
export function sortDocumentsByDate(documents: DocumentItem[]): DocumentItem[] {
  const eventTime = (doc: DocumentItem): number => {
    const eventDate = getDocumentEventDate(doc)
    if (!eventDate) return Number.POSITIVE_INFINITY
    const time = new Date(eventDate).getTime()
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
  }
  return [...documents].sort((a, b) => eventTime(a) - eventTime(b))
}
