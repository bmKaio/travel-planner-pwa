import { tripButtonClass } from './buttonStyles'

interface TripStatusMessageProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

function TripStatusMessage({ message, actionLabel, onAction }: TripStatusMessageProps) {
  return (
    <div
      role="status"
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
