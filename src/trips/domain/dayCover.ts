import type { DayCover } from '../types'
import { formatDayCount, formatDayLabel } from './dates'

export interface CoverView {
  /** 'Hoy · Día 4 de 12' */
  eyebrow: string
  place: string
  /** 'mar 20 oct' */
  dateLabel: string
  /** Null when the day has no photo: the card renders on a plain colour. */
  cover: DayCover | null
}

/** Everything the Today cover card shows. `index` is the zero-based day position. */
export function buildCoverView(
  cover: DayCover | undefined,
  tripName: string,
  index: number,
  total: number,
  iso: string
): CoverView {
  return {
    eyebrow: `Hoy · ${formatDayCount(index, total)}`,
    place: cover?.place.trim() ? cover.place : tripName,
    dateLabel: formatDayLabel(iso),
    cover: cover ?? null,
  }
}

/** The cover to draw: null when there is none or its photo failed to load (`failedSrc`). */
export function visibleCover(view: CoverView, failedSrc: string | null): DayCover | null {
  return view.cover && view.cover.image !== failedSrc ? view.cover : null
}
