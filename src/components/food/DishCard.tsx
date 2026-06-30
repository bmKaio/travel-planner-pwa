import type { Dish } from '../../data/food'

interface DishCardProps {
  dish: Dish
}

function DishCard({ dish }: DishCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">{dish.name}</h4>
        {dish.exclusive && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Exclusivo
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">{dish.description}</p>
    </div>
  )
}

export default DishCard
