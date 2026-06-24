interface CoffeeTypeCardProps {
  nameVi: string
  namePronunciation: string
  nameEs: string
  description: string
  accentColor: 'blue' | 'cream' | 'gray' | 'green'
  badge?: string
}

const ACCENT: Record<CoffeeTypeCardProps['accentColor'], { bar: string; bg: string }> = {
  blue: { bar: 'bg-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  cream: { bar: 'bg-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  gray: { bar: 'bg-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/40' },
  green: { bar: 'bg-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
}

function CoffeeTypeCard({
  nameVi,
  namePronunciation,
  nameEs,
  description,
  accentColor,
  badge,
}: CoffeeTypeCardProps) {
  const { bar, bg } = ACCENT[accentColor]

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-slate-700 ${bg}`}
    >
      <div className={`absolute bottom-0 left-0 top-0 w-1 ${bar}`} aria-hidden="true" />
      <div className="py-4 pl-5 pr-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{nameVi}</h3>
            <span className="mt-0.5 inline-block text-[11px] text-gray-500 dark:text-gray-400">
              /{namePronunciation}/
            </span>
          </div>
          {badge && (
            <span className="rounded-full bg-travel-blue-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-travel-blue-700 dark:bg-travel-blue-900/40 dark:text-travel-blue-300">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{nameEs}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  )
}

export default CoffeeTypeCard
