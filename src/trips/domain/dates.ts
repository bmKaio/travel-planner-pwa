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
