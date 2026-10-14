import { describe, expect, it } from 'vitest'
import type { ChecklistItem } from '../types'
import { summarizeChecklist } from './checklist'

const item = (
  key: string,
  group: ChecklistItem['group'],
  order: number,
  done = false
): ChecklistItem => ({
  id: `peru-2026:${key}`,
  tripId: 'peru-2026',
  group,
  label: key,
  order,
  done,
})

describe('summarizeChecklist', () => {
  it('groups shared first, then private, each sorted by order', () => {
    const summary = summarizeChecklist([
      item('p2', 'private', 4),
      item('g2', 'shared', 2, true),
      item('p1', 'private', 3, true),
      item('g1', 'shared', 1),
    ])
    expect(summary.groups.map((g) => [g.title, g.items.map((i) => i.label)])).toEqual([
      ['Del grupo', ['g1', 'g2']],
      ['Personal', ['p1', 'p2']],
    ])
    expect(summary.groups.map((g) => [g.done, g.total])).toEqual([
      [1, 2],
      [1, 2],
    ])
    expect(summary).toMatchObject({ done: 2, total: 4, percent: 50 })
  })

  it('omits empty groups', () => {
    const summary = summarizeChecklist([item('g1', 'shared', 1)])
    expect(summary.groups.map((g) => g.group)).toEqual(['shared'])
  })

  it('reports 0 % for an empty checklist instead of NaN', () => {
    expect(summarizeChecklist([])).toEqual({ groups: [], done: 0, total: 0, percent: 0 })
  })

  it('rounds the percentage', () => {
    const summary = summarizeChecklist([
      item('a', 'shared', 1, true),
      item('b', 'shared', 2),
      item('c', 'shared', 3),
    ])
    expect(summary.percent).toBe(33)
  })
})
