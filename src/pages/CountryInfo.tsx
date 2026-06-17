import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, MapPin, ChevronRight, Sparkles, BookOpen } from 'lucide-react'
import { useCountryInfo } from '../hooks/useCountryInfo'
import type { CountryCode, CountryInfoSections } from '../types'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import CountrySection from '../components/country/CountrySection'
import LanguagePhrase from '../components/country/LanguagePhrase'
import CurrencyInfo from '../components/country/CurrencyInfo'
import { ToastContainer, type Toast } from '../components/common/Toast'

const COUNTRY_META: Record<CountryCode, { name: string; flag: string; capital: string }> = {
  vietnam: { name: 'Vietnam', flag: '🇻🇳', capital: 'Hanoi' },
  cambodia: { name: 'Cambodia', flag: '🇰🇭', capital: 'Phnom Penh' },
}

const VIETNAMESE_PHRASES: {
  spanish: string
  local: string
  pronunciation: string
  category: 'greetings' | 'food' | 'transport' | 'emergency'
}[] = [
  { spanish: 'Hola', local: 'Xin chào', pronunciation: 'sin chao', category: 'greetings' },
  { spanish: 'Gracias', local: 'Cảm ơn', pronunciation: 'kam on', category: 'greetings' },
  {
    spanish: '¿Cuánto cuesta?',
    local: 'Bao nhiêu?',
    pronunciation: 'bao niu',
    category: 'transport',
  },
  { spanish: 'No picante', local: 'Không cay', pronunciation: 'kom kai', category: 'food' },
  {
    spanish: 'Ayúdame',
    local: 'Giúp tôi với',
    pronunciation: 'yup toy voy',
    category: 'emergency',
  },
]

const KHMER_PHRASES: {
  spanish: string
  local: string
  pronunciation: string
  category: 'greetings' | 'food' | 'transport' | 'emergency'
}[] = [
  { spanish: 'Hola', local: 'Suosdey', pronunciation: 'suos-dei', category: 'greetings' },
  { spanish: 'Gracias', local: 'Arkun', pronunciation: 'ar-kun', category: 'greetings' },
  {
    spanish: '¿Cuánto cuesta?',
    local: 'Bay dae?',
    pronunciation: 'bai dae',
    category: 'transport',
  },
  { spanish: 'No picante', local: 'Min cay', pronunciation: 'min chai', category: 'food' },
  { spanish: 'Ayúdame', local: 'Chuay phnom', pronunciation: 'chuai pnom', category: 'emergency' },
]

const SECTION_ORDER: Array<keyof CountryInfoSections> = [
  'history',
  'culture',
  'food',
  'traditions',
  'customs',
  'language',
  'currency',
  'tips',
]

function CountryInfo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loading, getByCountry } = useCountryInfo()
  const [toasts, setToasts] = useState<Toast[]>([])

  const countryCode = useMemo<CountryCode | undefined>(() => {
    if (id === 'vietnam' || id === 'cambodia') return id
    return undefined
  }, [id])

  const info = useMemo(() => {
    if (!countryCode) return undefined
    return getByCountry(countryCode)
  }, [countryCode, getByCountry])

  const meta = useMemo(() => {
    if (!countryCode) return undefined
    return COUNTRY_META[countryCode]
  }, [countryCode])

  const otherCountry = useMemo<CountryCode | null>(() => {
    if (countryCode === 'vietnam') return 'cambodia'
    if (countryCode === 'cambodia') return 'vietnam'
    return null
  }, [countryCode])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const toast: Toast = { id: crypto.randomUUID(), message, type }
    setToasts((prev) => [...prev, toast])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      addToast('Link copied to clipboard', 'success')
    } catch {
      addToast('Could not copy link', 'error')
    }
  }

  const handleToggleCountry = () => {
    if (otherCountry) {
      navigate(`/countries/${otherCountry}`)
    }
  }

  if (loading) {
    return <Loading fullScreen label="Cargando información..." />
  }

  if (!countryCode || !info || !meta) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate(-1)} className="px-3 py-2 text-xs">
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <Card>
          <p className="text-gray-600 dark:text-gray-300">
            No information available for this country.
          </p>
        </Card>
      </div>
    )
  }

  const phrases = countryCode === 'vietnam' ? VIETNAMESE_PHRASES : KHMER_PHRASES

  return (
    <div className="space-y-4 pb-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)} className="px-3 py-2 text-xs">
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <button
          type="button"
          onClick={handleShare}
          className="rounded-xl border border-gray-300 bg-white p-2.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
          aria-label="Share country info"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-8xl opacity-10">{meta.flag}</div>
        <div className="relative flex items-start gap-4">
          <span className="text-6xl" role="img" aria-label={`Flag of ${meta.name}`}>
            {meta.flag}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{meta.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {meta.capital}
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                {SECTION_ORDER.length} sections
              </span>
            </div>
          </div>
        </div>

        {otherCountry && (
          <button
            type="button"
            onClick={handleToggleCountry}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-travel-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            aria-label={`Switch to ${COUNTRY_META[otherCountry].name}`}
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span className="text-xl" role="img" aria-hidden="true">
                {COUNTRY_META[otherCountry].flag}
              </span>
              See {COUNTRY_META[otherCountry].name}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </button>
        )}
      </Card>

      <div className="space-y-3">
        {SECTION_ORDER.map((sectionKey) => {
          const content = info.sections[sectionKey]
          if (!content || (Array.isArray(content) && content.length === 0)) return null

          if (sectionKey === 'currency') {
            return (
              <CountrySection key={sectionKey} type={sectionKey}>
                <CurrencyInfo country={countryCode} />
              </CountrySection>
            )
          }

          if (sectionKey === 'language') {
            return (
              <CountrySection key={sectionKey} type={sectionKey}>
                <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {content}
                </p>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Sparkles className="h-4 w-4 text-travel-amber-500" aria-hidden="true" />
                  Useful phrases
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {phrases.map((phrase) => (
                    <LanguagePhrase
                      key={phrase.local}
                      spanish={phrase.spanish}
                      local={phrase.local}
                      pronunciation={phrase.pronunciation}
                      category={phrase.category}
                    />
                  ))}
                </div>
              </CountrySection>
            )
          }

          if (sectionKey === 'tips') {
            const tips = Array.isArray(content) ? content : [content]
            return (
              <CountrySection key={sectionKey} type={sectionKey}>
                <ul className="space-y-3">
                  {tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-yellow-900">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </CountrySection>
            )
          }

          return (
            <CountrySection key={sectionKey} type={sectionKey}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {content}
              </p>
            </CountrySection>
          )
        })}
      </div>
    </div>
  )
}

export default CountryInfo
