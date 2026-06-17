import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { CountryCode, CountryInfo, CountryInfoSections } from '../types'

export interface UseCountryInfoResult {
  countries: CountryInfo[]
  loading: boolean
  error: Error | null
  getByCountry: (country: CountryCode) => CountryInfo | undefined
  updateSections: (id: string, sections: Partial<CountryInfoSections>) => Promise<void>
}

export function useCountryInfo(): UseCountryInfoResult {
  const [error, setError] = useState<Error | null>(null)

  const countries = useLiveQuery<CountryInfo[]>(() => db.countryInfo.toArray(), [])

  const getByCountry = useCallback(
    (country: CountryCode) => {
      return (countries ?? []).find((info) => info.country === country)
    },
    [countries]
  )

  const updateSections = useCallback(async (id: string, sections: Partial<CountryInfoSections>) => {
    try {
      setError(null)
      const current = await db.countryInfo.get(id)
      if (!current) throw new Error('Country info not found')
      await db.countryInfo.update(id, { sections: { ...current.sections, ...sections } })
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err))
      setError(wrapped)
      throw wrapped
    }
  }, [])

  return {
    countries: countries ?? [],
    loading: countries === undefined,
    error,
    getByCountry,
    updateSections,
  }
}
