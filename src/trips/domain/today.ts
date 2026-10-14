import type { PlanItem } from '../types'
import { daysBetween, toLocalIsoDate } from './dates'

export function minutesOf(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export interface NowItem extends PlanItem {
  range: string
}

export interface NowResult {
  label: 'Ahora' | 'Siguiente'
  item: NowItem | null
  rest: PlanItem[]
}

/** Mirrors the mockup: the last item already started is "Ahora"; before the first one, "Siguiente". */
export function computeNow(plan: PlanItem[], nowMinutes: number): NowResult {
  if (plan.length === 0) return { label: 'Siguiente', item: null, rest: [] }

  let current = -1
  plan.forEach((p, i) => {
    if (minutesOf(p.t) <= nowMinutes) current = i
  })
  const index = current >= 0 ? current : 0
  const active = plan[index]
  const next = plan[index + 1]

  return {
    label: current >= 0 ? 'Ahora' : 'Siguiente',
    item: { ...active, range: next ? `${active.t} – ${next.t}` : `Desde las ${active.t}` },
    rest: plan.slice(index + 1),
  }
}

export type TodayBanner = { kind: 'before'; daysLeft: number } | { kind: 'after' } | null

export interface TodayView {
  dayIndex: number
  banner: TodayBanner
  /** Minutes since local midnight; null when today is not a trip day. */
  nowMinutes: number | null
}

/** `dates` must be sorted ascending (the hooks sort by date). */
export function resolveTodayView(dates: string[], now: Date): TodayView {
  if (dates.length === 0) return { dayIndex: -1, banner: null, nowMinutes: null }

  const today = toLocalIsoDate(now)
  const first = dates[0]
  const last = dates[dates.length - 1]

  if (today < first) {
    return {
      dayIndex: 0,
      banner: { kind: 'before', daysLeft: daysBetween(today, first) },
      nowMinutes: null,
    }
  }
  if (today > last) {
    return { dayIndex: dates.length - 1, banner: { kind: 'after' }, nowMinutes: null }
  }

  const exact = dates.indexOf(today)
  if (exact >= 0) {
    return { dayIndex: exact, banner: null, nowMinutes: now.getHours() * 60 + now.getMinutes() }
  }

  // Gap inside the trip: show the latest previous day without a "now" marker.
  let previous = 0
  dates.forEach((date, i) => {
    if (date <= today) previous = i
  })
  return { dayIndex: previous, banner: null, nowMinutes: null }
}

export function formatBanner(banner: TodayBanner): string | null {
  if (!banner) return null
  if (banner.kind === 'after') return 'Viaje terminado'
  return banner.daysLeft === 1 ? 'Falta 1 día' : `Faltan ${banner.daysLeft} días`
}
