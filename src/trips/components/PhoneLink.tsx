import type { ReactNode } from 'react'
import { Phone } from 'lucide-react'
import { tripButtonClass, type TripButtonVariant } from './buttonStyles'

interface PhoneLinkProps {
  /** Phone number as written (spaces and dashes are allowed; they are stripped for the link). */
  number: string
  children: ReactNode
  variant?: TripButtonVariant
  className?: string
  /** Show the phone icon before the label (default true). */
  icon?: boolean
}

/** The one anchor used for every "Llamar" action. A plain `tel:` link: no script, no tracking. */
function PhoneLink({
  number,
  children,
  variant = 'primary',
  className,
  icon = true,
}: PhoneLinkProps) {
  return (
    <a
      href={`tel:${number.replace(/[\s().-]/g, '')}`}
      className={tripButtonClass(variant, className)}
    >
      {icon && <Phone className="h-5 w-5" aria-hidden="true" />}
      {children}
    </a>
  )
}

export default PhoneLink
