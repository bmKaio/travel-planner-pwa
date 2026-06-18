import { Lightbulb, AlertCircle } from 'lucide-react'

interface DayTipsListProps {
  tips: string[]
}

const IMPORTANT_KEYWORDS = [
  'no olvides',
  'imprescindible',
  'obligatorio',
  'siempre',
  'nunca',
  'important',
  'must',
  'always',
  'never',
  'required',
]

function isImportantTip(tip: string): boolean {
  const lower = tip.toLowerCase()
  return IMPORTANT_KEYWORDS.some((keyword) => lower.includes(keyword))
}

export function DayTipsList({ tips }: DayTipsListProps) {
  return (
    <ul className="space-y-3">
      {tips.map((tip, index) => {
        const important = isImportantTip(tip)
        return (
          <li key={index} className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                important
                  ? 'bg-rose-100 dark:bg-rose-900/30'
                  : 'bg-yellow-100 dark:bg-yellow-900/20'
              }`}
            >
              {important ? (
                <AlertCircle
                  className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400"
                  aria-hidden="true"
                />
              ) : (
                <Lightbulb
                  className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400"
                  aria-hidden="true"
                />
              )}
            </div>
            <p
              className={`text-sm leading-relaxed ${
                important
                  ? 'font-medium text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {tip}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
