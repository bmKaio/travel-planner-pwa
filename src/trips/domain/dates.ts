const pad = (n: number): string => String(n).padStart(2, '0')

/** Local calendar date (device time zone) as YYYY-MM-DD. Never use toISOString(): it is UTC. */
export function toLocalIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function isoToUtcMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** Whole days from `from` to `to` (ISO dates). Computed in UTC so DST never skews it. */
export function daysBetween(from: string, to: string): number {
  return Math.round((isoToUtcMs(to) - isoToUtcMs(from)) / 86_400_000)
}

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

/** Parses an ISO date at local noon so the weekday never shifts with the time zone. */
export function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`)
}

export function weekdayShort(iso: string): string {
  return WEEKDAYS[parseIsoDate(iso).getDay()]
}

/** 'sáb 17 oct' */
export function formatDayLabel(iso: string): string {
  const date = parseIsoDate(iso)
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

/** 'Día 1 de 12 · sáb 17 oct' (index is zero-based) */
export function formatDayHeading(index: number, total: number, iso: string): string {
  return `Día ${index + 1} de ${total} · ${formatDayLabel(iso)}`
}
