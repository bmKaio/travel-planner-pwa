export type TripButtonVariant = 'primary' | 'secondary' | 'ghost' | 'urgent'

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] px-4 text-base font-semibold no-underline'

const VARIANTS: Record<TripButtonVariant, string> = {
  primary: 'min-h-[52px] bg-trip-action text-trip-action-ink hover:opacity-90',
  secondary: 'min-h-[44px] bg-trip-action-soft text-trip-action',
  ghost: 'min-h-[44px] border-[1.5px] border-trip-line bg-transparent text-trip-ink',
  urgent: 'min-h-[52px] bg-trip-urgent text-trip-urgent-ink',
}

export function tripButtonClass(variant: TripButtonVariant, extra = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim()
}
