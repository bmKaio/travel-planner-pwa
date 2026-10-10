import type { ReactNode } from 'react'
import { Navigation } from 'lucide-react'
import { tripButtonClass, type TripButtonVariant } from './buttonStyles'

interface MapsLinkProps {
  /** Google Maps URL, built with the helpers in domain/mapsUrl.ts. */
  href: string
  children: ReactNode
  variant?: TripButtonVariant
  className?: string
  /** Show the navigation icon before the label (default true). */
  icon?: boolean
}

/** The one anchor used for every "Cómo llegar" / "Ver ruta" action. */
function MapsLink({
  href,
  children,
  variant = 'secondary',
  className,
  icon = true,
}: MapsLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={tripButtonClass(variant, className)}
    >
      {icon && <Navigation className="h-5 w-5" aria-hidden="true" />}
      {children}
    </a>
  )
}

export default MapsLink
