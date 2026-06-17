import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

interface DayTipProps {
  tips: string[]
}

const IMPORTANT_KEYWORDS = [
  'important',
  'must',
  "don't forget",
  'always',
  'never',
  'required',
  'necessary',
  'essential',
  'critical',
  'no olvides',
  'imprescindible',
  'obligatorio',
  'siempre',
  'nunca',
]

function isImportantTip(tip: string): boolean {
  const lower = tip.toLowerCase()
  return IMPORTANT_KEYWORDS.some((keyword) => lower.includes(keyword))
}

export function DayTip({ tips }: DayTipProps) {
  const [expanded, setExpanded] = useState(true)

  if (tips.length === 0) return null

  return (
    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={expanded}
        aria-label="Tips for the day"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900/40">
            <Lightbulb
              className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tips for the day</h3>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <ul className="mt-3 space-y-2">
          {tips.map((tip, index) => {
            const important = isImportantTip(tip)
            return (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {important ? (
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                    aria-hidden="true"
                  />
                ) : (
                  <Lightbulb
                    className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500"
                    aria-hidden="true"
                  />
                )}
                <span className={important ? 'font-medium text-gray-900 dark:text-white' : ''}>
                  {tip}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
