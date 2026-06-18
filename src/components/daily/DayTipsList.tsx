import { Lightbulb, AlertCircle } from 'lucide-react'

interface DayTipsListProps {
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

export function DayTipsList({ tips }: DayTipsListProps) {
  return (
    <ul className="space-y-2">
      {tips.map((tip, index) => {
        const important = isImportantTip(tip)
        return (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            {important ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
            ) : (
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" aria-hidden="true" />
            )}
            <span className={important ? 'font-medium text-gray-900 dark:text-white' : ''}>
              {tip}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
