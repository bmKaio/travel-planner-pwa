import { useEffect, useState } from 'react'

/** Current time, refreshed every minute and on resume so "Ahora" never goes stale. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => setNow(new Date())
    const id = window.setInterval(refresh, intervalMs)
    // Timers pause while the page is hidden, so catch up as soon as it is visible again.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs])
  return now
}
