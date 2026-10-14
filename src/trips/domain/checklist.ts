import type { ChecklistGroupId, ChecklistItem } from '../types'

// No sync between devices: titles make no claim about who can see the items.
export const CHECKLIST_GROUP_TITLE: Record<ChecklistGroupId, string> = {
  shared: 'Del grupo',
  private: 'Personal',
}

const GROUP_ORDER: ChecklistGroupId[] = ['shared', 'private']

export interface ChecklistGroupView {
  group: ChecklistGroupId
  title: string
  items: ChecklistItem[]
  done: number
  total: number
}

export interface ChecklistSummary {
  groups: ChecklistGroupView[]
  done: number
  total: number
  percent: number
}

export function summarizeChecklist(items: ChecklistItem[]): ChecklistSummary {
  const groups = GROUP_ORDER.map((group) => {
    const groupItems = items.filter((i) => i.group === group).sort((a, b) => a.order - b.order)
    return {
      group,
      title: CHECKLIST_GROUP_TITLE[group],
      items: groupItems,
      done: groupItems.filter((i) => i.done).length,
      total: groupItems.length,
    }
  }).filter((group) => group.total > 0)

  const done = groups.reduce((sum, g) => sum + g.done, 0)
  const total = groups.reduce((sum, g) => sum + g.total, 0)
  return { groups, done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}
