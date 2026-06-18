import type { CountryGreeting } from '../../hooks/useCurrentCountry'

interface DynamicGreetingProps {
  greeting: CountryGreeting
  isLoading?: boolean
}

function DynamicGreeting({ greeting, isLoading }: DynamicGreetingProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Cargando saludo">
        <div className="h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{greeting.title}</h1>
      {greeting.subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-300">{greeting.subtitle}</p>
      )}
    </div>
  )
}

export default DynamicGreeting
