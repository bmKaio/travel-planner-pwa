import { tripButtonClass } from './buttonStyles'

interface TripStatusMessageProps {
  message: string
  /** `error` announces assertively (role="alert"); `info` is a polite status. */
  tone?: 'info' | 'error'
  actionLabel?: string
  onAction?: () => void
}

function TripStatusMessage({
  message,
  tone = 'info',
  actionLabel,
  onAction,
}: TripStatusMessageProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-start gap-3 rounded-[20px] border border-trip-line bg-trip-card p-[18px]"
    >
      <p className="text-base text-trip-ink2">{message}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className={tripButtonClass('secondary')}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default TripStatusMessage
