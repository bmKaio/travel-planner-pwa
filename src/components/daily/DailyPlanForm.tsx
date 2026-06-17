import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import type { DailyPlan, Recommendation } from '../../types'
import Button from '../common/Button'

interface DailyPlanFormProps {
  date: string
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export function DailyPlanForm({ date, isOpen, onClose, onSaved }: DailyPlanFormProps) {
  const dailyPlan = useLiveQuery(() => db.dailyPlans.get(date), [date])
  const allRecommendations = useLiveQuery(() => db.recommendations.toArray(), [])

  const [culturalNotes, setCulturalNotes] = useState('')
  const [tips, setTips] = useState('')
  const [selectedRecommendations, setSelectedRecommendations] = useState<Recommendation[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false
      return
    }
    if (dailyPlan === undefined) return
    if (initializedRef.current) return
    initializedRef.current = true

    setCulturalNotes((dailyPlan?.culturalNotes ?? []).join('\n'))
    setTips((dailyPlan?.tips ?? []).join('\n'))
    setSelectedRecommendations(dailyPlan?.recommendations ?? [])
  }, [isOpen, dailyPlan])

  const availableRecommendations = useMemo(() => {
    const selectedIds = new Set(selectedRecommendations.map((r) => r.id))
    return (allRecommendations ?? []).filter((r) => !selectedIds.has(r.id))
  }, [allRecommendations, selectedRecommendations])

  const handleAddRecommendation = (recommendation: Recommendation) => {
    setSelectedRecommendations((prev) => [...prev, recommendation])
  }

  const handleRemoveRecommendation = (id: string) => {
    setSelectedRecommendations((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const notes = culturalNotes
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const tipList = tips
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const next: DailyPlan = {
        date,
        items: dailyPlan?.items ?? [],
        places: dailyPlan?.places ?? [],
        recommendations: selectedRecommendations,
        tips: tipList,
        culturalNotes: notes,
      }

      await db.dailyPlans.put(next)
      onSaved()
      onClose()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save daily plan')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-plan-form-title"
    >
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
        <h1
          id="daily-plan-form-title"
          className="text-lg font-semibold text-gray-900 dark:text-white"
        >
          Edit daily plan
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
          aria-label="Close form"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-5">
          <div>
            <label
              htmlFor="daily-cultural-notes"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Cultural notes
            </label>
            <textarea
              id="daily-cultural-notes"
              value={culturalNotes}
              onChange={(e) => setCulturalNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="One note per line..."
            />
          </div>

          <div>
            <label
              htmlFor="daily-tips"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Tips
            </label>
            <textarea
              id="daily-tips"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="One tip per line..."
            />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              Recommendations
            </h3>
            {selectedRecommendations.length > 0 && (
              <ul className="mb-3 space-y-2">
                {selectedRecommendations.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{r.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecommendation(r.id)}
                      className="text-xs text-rose-600 hover:underline dark:text-rose-400"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {availableRecommendations.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="daily-recommendation-select"
                  className="block text-xs text-gray-500 dark:text-gray-400"
                >
                  Add recommendation
                </label>
                <select
                  id="daily-recommendation-select"
                  value=""
                  onChange={(e) => {
                    const rec = availableRecommendations.find((r) => r.id === e.target.value)
                    if (rec) handleAddRecommendation(rec)
                    e.target.value = ''
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-travel-blue-500 focus:outline-none focus:ring-1 focus:ring-travel-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select a recommendation...</option>
                  {availableRecommendations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              isFullWidth
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" isFullWidth disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
