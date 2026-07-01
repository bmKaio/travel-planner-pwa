import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Utensils } from 'lucide-react'
import Button from '../components/common/Button'
import DishCard from '../components/food/DishCard'
import { NATIONAL_DISHES, CITY_DISHES } from '../data/food'
import { CITIES } from '../utils/cities'

const VOCABULARY = [
  { word: 'Cay', pronunciation: '"cai"', meaning: 'Picante' },
  { word: 'Không cay', pronunciation: '"khôm cai"', meaning: 'No picante' },
  { word: 'Chay', pronunciation: '"chai"', meaning: 'Vegetariano' },
  { word: 'Ngon', pronunciation: '"ngon"', meaning: 'Delicioso' },
  { word: 'Tính tiền', pronunciation: '"tính tiền"', meaning: 'La cuenta, por favor' },
  { word: 'Không có', pronunciation: '"khôm có"', meaning: 'Sin (p.ej. "sin cacahuetes")' },
]

function FoodPage() {
  const navigate = useNavigate()

  const cityDishGroups = CITIES.filter((city) => (CITY_DISHES[city.id]?.length ?? 0) > 0)

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
          <Utensils className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comida de Vietnam</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Platos típicos, especialidades por ciudad y cómo pedirlos
          </p>
        </div>
      </div>

      {/* Section A: National dishes */}
      <section aria-labelledby="national-dishes-heading">
        <h2
          id="national-dishes-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Platos nacionales
        </h2>
        <div className="space-y-3">
          {NATIONAL_DISHES.map((dish) => (
            <DishCard key={dish.name} dish={dish} />
          ))}
        </div>
      </section>

      {/* Section B: Dishes by city */}
      {cityDishGroups.length > 0 && (
        <section aria-labelledby="city-dishes-heading">
          <h2
            id="city-dishes-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Comida por ciudad
          </h2>
          <div className="space-y-4">
            {cityDishGroups.map((city) => (
              <div
                key={city.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="border-b border-gray-100 bg-amber-50/60 px-4 py-3 dark:border-slate-800 dark:bg-amber-900/10">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{city.name}</h3>
                </div>
                <div className="space-y-2.5 p-4">
                  {(CITY_DISHES[city.id] ?? []).map((dish) => (
                    <DishCard key={dish.name} dish={dish} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section C: Ordering guide */}
      <section aria-labelledby="food-ordering-heading">
        <h2
          id="food-ordering-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Vocabulario y cómo pedir
        </h2>

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

        <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
            <span className="font-semibold">Tip:</span> Muchos platos vietnamitas llevan cacahuetes
            (maní) como guarnición. Si tienes alergia, di claramente{' '}
            <span className="font-semibold italic">Không có đậu phộng</span> ("khôm có đậu phộng",
            sin cacahuetes) al pedir.
          </p>
        </div>
      </section>
    </div>
  )
}

export default FoodPage
