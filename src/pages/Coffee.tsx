import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Coffee, MapPin } from 'lucide-react'
import { usePlaces } from '../hooks/usePlaces'
import Button from '../components/common/Button'
import CoffeeTypeCard from '../components/coffee/CoffeeTypeCard'
import type { Place } from '../types'

const COFFEE_TYPES = [
  {
    nameVi: 'Cà phê sữa đá',
    namePronunciation: 'cá-fé súa da',
    nameEs: 'Café con leche condensada y hielo',
    description:
      'El gran clásico vietnamita. Un café robusta intensamente oscuro y amargo que gotea lentamente a través de un filtro metálico (phin) directamente sobre una generosa capa de leche condensada, para luego mezclarse con abundante hielo picado.',
    accentColor: 'blue' as const,
    badge: 'El clásico nacional',
  },
  {
    nameVi: 'Cà phê trứng',
    namePronunciation: 'cá-fé trung',
    nameEs: 'Café de huevo',
    description:
      'Originario de Hanói. Base de café negro fuerte coronada por una crema densa, dulce y aterciopelada hecha de yemas de huevo batidas con azúcar y leche condensada. Sabe a un tiramisú líquido.',
    accentColor: 'cream' as const,
  },
  {
    nameVi: 'Cà phê muối',
    namePronunciation: 'cá-fé muói',
    nameEs: 'Café de sal',
    description:
      'Una combinación sorprendente nacida en Hue. La mezcla de café negro y leche condensada se cubre con una crema salada. La sal mitiga el amargor del grano robusta y resalta su dulzor caramelizado.',
    accentColor: 'gray' as const,
  },
  {
    nameVi: 'Cà phê cốt dừa',
    namePronunciation: 'cá-fé cot zua',
    nameEs: 'Café de coco',
    description:
      'Prácticamente un postre frappé. Café vietnamita mezclado con hielo granizado de crema de coco y leche condensada. Refrescante e ideal para los días más calurosos.',
    accentColor: 'green' as const,
  },
]

const VOCABULARY = [
  { word: 'Sữa', pronunciation: '"súa"', meaning: 'Leche condensada' },
  { word: 'Đen', pronunciation: '"den"', meaning: 'Negro (solo)' },
  { word: 'Đá', pronunciation: '"da"', meaning: 'Con hielo' },
  { word: 'Nóng', pronunciation: '"nóng"', meaning: 'Caliente' },
  { word: 'Đường', pronunciation: '"duong"', meaning: 'Azúcar' },
  { word: 'Không đường', pronunciation: '"jóng duong"', meaning: 'Sin azúcar' },
]

const COMBINATIONS = [
  {
    phrase: 'Cà phê sữa đá',
    pronunciation: 'cá-fé súa da',
    meaning: 'Café con leche condensada y hielo',
  },
  {
    phrase: 'Cà phê sữa nóng',
    pronunciation: 'cá-fé súa nóng',
    meaning: 'Café con leche condensada caliente',
  },
  {
    phrase: 'Cà phê đen đá',
    pronunciation: 'cá-fé den da',
    meaning: 'Café negro con hielo (puede venir ligeramente endulzado)',
  },
  {
    phrase: 'Cà phê trứng',
    pronunciation: 'cá-fé trung',
    meaning: 'Café de huevo',
  },
  {
    phrase: 'Cà phê muối',
    pronunciation: 'cá-fé muói',
    meaning: 'Café de sal',
  },
]

interface CafeCardProps {
  cafe: Place
  onMapClick: () => void
}

function CafeCard({ cafe, onMapClick }: CafeCardProps) {
  const specialty = cafe.tips?.[0]
  const ambiance = cafe.tips?.[1]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">{cafe.name}</h4>
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          {cafe.location.name}
        </span>
      </div>
      {specialty && <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">{specialty}</p>}
      {ambiance && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{ambiance}</p>}
      <button
        type="button"
        onClick={onMapClick}
        className="mt-2.5 flex items-center gap-1 text-xs font-medium text-travel-blue-600 hover:underline dark:text-travel-blue-400"
      >
        <MapPin className="h-3 w-3" aria-hidden="true" />
        Ver en mapa
      </button>
    </div>
  )
}

function CoffeePage() {
  const navigate = useNavigate()
  const { getByCategory, loading } = usePlaces()

  const cafePlaces = useMemo(() => getByCategory('cafe'), [getByCategory])
  const hanoiCafes = useMemo(
    () => cafePlaces.filter((p) => p.location.name === 'Hanói'),
    [cafePlaces]
  )
  const hcmCafes = useMemo(
    () => cafePlaces.filter((p) => p.location.name === 'Ho Chi Minh'),
    [cafePlaces]
  )

  const goToMap = () => navigate('/places', { state: { category: 'cafe' } })

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <Button variant="secondary" onClick={() => navigate(-1)} className="px-3 py-2 text-xs">
        <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Volver
      </Button>

      {/* Hero */}
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <Coffee className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Café de Vietnam</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tipos, dónde tomarlo y cómo pedirlo
          </p>
        </div>
      </div>

      {/* Section A: Coffee types */}
      <section aria-labelledby="coffee-types-heading">
        <h2
          id="coffee-types-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Tipos de café
        </h2>
        <div className="space-y-3">
          {COFFEE_TYPES.map((type) => (
            <CoffeeTypeCard key={type.nameVi} {...type} />
          ))}
        </div>
      </section>

      {/* Section B: Café locations */}
      {!loading && cafePlaces.length > 0 && (
        <section aria-labelledby="cafes-heading">
          <h2
            id="cafes-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Dónde tomarlo
          </h2>
          <div className="space-y-4">
            {hanoiCafes.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <span role="img" aria-label="Vietnam">
                    🇻🇳
                  </span>{' '}
                  Hanói
                </h3>
                <div className="space-y-2.5">
                  {hanoiCafes.map((cafe) => (
                    <CafeCard key={cafe.id} cafe={cafe} onMapClick={goToMap} />
                  ))}
                </div>
              </div>
            )}
            {hcmCafes.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <span role="img" aria-label="Vietnam">
                    🇻🇳
                  </span>{' '}
                  Ho Chi Minh
                </h3>
                <div className="space-y-2.5">
                  {hcmCafes.map((cafe) => (
                    <CafeCard key={cafe.id} cafe={cafe} onMapClick={goToMap} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button variant="secondary" onClick={goToMap} className="mt-3 w-full py-2.5 text-sm">
            <MapPin className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ver todos en el mapa
          </Button>
        </section>
      )}

      {/* Section C: Ordering guide */}
      <section aria-labelledby="ordering-heading">
        <h2
          id="ordering-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Cómo pedirlo
        </h2>

        {/* Vocabulary */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Vocabulario esencial
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {VOCABULARY.map((v) => (
              <div key={v.word} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{v.word}</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {v.pronunciation}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Combinations */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Cómo ordenar</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {COMBINATIONS.map((c) => (
              <div key={c.phrase} className="px-4 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{c.phrase}</span>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    /{c.pronunciation}/
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{c.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro tip */}
        <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
            <span className="font-semibold">Tip:</span> Si quieres tu café sin azúcar, di claramente{' '}
            <span className="font-semibold italic">Không đường</span> ("jóng duong"). De lo
            contrario, casi cualquier café negro vendrá ligeramente endulzado para equilibrar su
            potente amargor.
          </p>
        </div>
      </section>
    </div>
  )
}

export default CoffeePage
