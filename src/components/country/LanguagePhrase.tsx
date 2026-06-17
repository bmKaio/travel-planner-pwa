import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'

type PhraseCategory = 'greetings' | 'food' | 'transport' | 'emergency'

interface LanguagePhraseProps {
  spanish: string
  local: string
  pronunciation: string
  category: PhraseCategory
}

const CATEGORY_LABELS: Record<PhraseCategory, string> = {
  greetings: 'Greetings',
  food: 'Food',
  transport: 'Transport',
  emergency: 'Emergency',
}

function LanguagePhrase({ spanish, local, pronunciation, category }: LanguagePhraseProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(local)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = local
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore copy errors
    }
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 shrink-0 text-travel-blue-500" aria-hidden="true" />
          <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
            {CATEGORY_LABELS[category]}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-travel-blue-300 dark:text-gray-400 dark:hover:bg-slate-800"
          aria-label={`Copy "${local}"`}
          title="Copy phrase"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{spanish}</p>
      <p className="mt-0.5 text-lg font-semibold text-travel-blue-700 dark:text-travel-blue-300">
        {local}
      </p>
      <p className="mt-0.5 text-xs italic text-gray-500 dark:text-gray-400">/{pronunciation}/</p>
    </div>
  )
}

export default LanguagePhrase
