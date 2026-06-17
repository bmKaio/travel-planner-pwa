import { AlertTriangle, Banknote, Coins, Wallet } from 'lucide-react'

interface CurrencyInfoProps {
  country: 'vietnam' | 'cambodia'
}

const CURRENCY_DATA: Record<
  CurrencyInfoProps['country'],
  {
    name: string
    code: string
    exchangeRate: string
    denominations: string[]
    tips: string[]
    warnings: string[]
  }
> = {
  vietnam: {
    name: 'Dong vietnamita',
    code: 'VND',
    exchangeRate: '1 € ≈ 27.000 VND',
    denominations: [
      'Billetes comunes: 1.000, 2.000, 5.000, 10.000, 20.000, 50.000, 100.000, 200.000, 500.000 VND',
    ],
    tips: [
      'Se usa principalmente efectivo; pocos comercios aceptan tarjeta.',
      'Lleva billetes pequeños para pagos diarios.',
      'Verifica siempre el cambio; los cerros pueden confundir al principio.',
    ],
    warnings: ['Evita billetes deteriorados; algunos comercios los rechazan.'],
  },
  cambodia: {
    name: 'Dólar estadounidense / Riel',
    code: 'USD / KHR',
    exchangeRate: '1 USD ≈ 4.100 KHR',
    denominations: [
      'USD: billetes de 1, 5, 10 y 20 son los más útiles.',
      'Riel: se usa solo para cambio menor (< 1 USD).',
    ],
    tips: [
      'El dólar es la moneda principal para todo.',
      'Lleva muchos billetes pequeños de USD.',
      'El riel suele darte como cambio en compras pequeñas.',
    ],
    warnings: [
      'Rechazan billetes rotos, rasgados o muy viejos.',
      'Los billetes de 50 y 100 USD pueden ser difíciles de cambiar.',
    ],
  },
}

function CurrencyInfo({ country }: CurrencyInfoProps) {
  const data = CURRENCY_DATA[country]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
          <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">Currency</p>
          <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
            {data.name} ({data.code})
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Exchange rate</h4>
        </div>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{data.exchangeRate}</p>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Denominations</h4>
        </div>
        <ul className="mt-2 space-y-1.5">
          {data.denominations.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Practical tips</h4>
        <ul className="mt-2 space-y-2">
          {data.tips.map((tip, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {data.warnings.length > 0 && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/30">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="h-4 w-4 text-rose-600 dark:text-rose-400"
              aria-hidden="true"
            />
            <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-100">Watch out</h4>
          </div>
          <ul className="mt-2 space-y-2">
            {data.warnings.map((warning, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-rose-800 dark:text-rose-200"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CurrencyInfo
