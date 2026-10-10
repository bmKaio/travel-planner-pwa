import type { TripsDatabase } from '../db'
import type { ChecklistItem, TripContent } from '../types'

export function checklistItemId(tripId: string, key: string): string {
  return `${tripId}:${key}`
}

/**
 * Applies public trip content when its seedVersion is newer than the stored one.
 * Days are replaced; checklist items are upserted keeping `done`; notes and the
 * imported help data (cards, contacts, docs) are never touched. All in one transaction.
 */
export async function syncTripContent(db: TripsDatabase, content: TripContent): Promise<boolean> {
  const { tripId } = content

  return db.transaction(
    'rw',
    [db.days, db.checklistItems, db.helpInfo, db.contentState],
    async () => {
      const state = await db.contentState.get(tripId)
      if (state && state.seedVersion >= content.seedVersion) return false

      await db.days.where('tripId').equals(tripId).delete()
      await db.days.bulkPut(content.days.map((day) => ({ ...day, tripId })))

      const existing = await db.checklistItems.where('tripId').equals(tripId).toArray()
      const doneById = new Map(existing.map((item) => [item.id, item.done]))
      const next: ChecklistItem[] = content.checklist.map((item) => {
        const id = checklistItemId(tripId, item.key)
        return {
          id,
          tripId,
          group: item.group,
          label: item.label,
          order: item.order,
          done: doneById.get(id) ?? false,
        }
      })
      const keep = new Set(next.map((item) => item.id))
      await db.checklistItems.bulkDelete(
        existing.filter((item) => !keep.has(item.id)).map((item) => item.id)
      )
      await db.checklistItems.bulkPut(next)

      const help = await db.helpInfo.get(tripId)
      await db.helpInfo.put({
        tripId,
        emergency: content.emergency,
        cards: help?.cards ?? [],
        contacts: help?.contacts ?? [],
        docs: help?.docs ?? [],
      })

      await db.contentState.put({ tripId, seedVersion: content.seedVersion })
      return true
    }
  )
}
