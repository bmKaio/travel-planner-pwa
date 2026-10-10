import { Component, type ErrorInfo, type ReactNode } from 'react'
import TripScreen from './TripScreen'
import TripStatusMessage from './TripStatusMessage'

interface TripErrorBoundaryProps {
  children: ReactNode
  /** Spanish message shown when something below fails to render or load. */
  message?: string
  actionLabel?: string
}

interface TripErrorBoundaryState {
  failed: boolean
}

/**
 * Safety net for render errors and failed lazy chunk imports (data errors are values, see the
 * hooks). Retrying reloads the page: React caches a rejected `lazy()` import, so resetting state
 * alone would fail forever after a deploy replaced the cached chunks.
 */
class TripErrorBoundary extends Component<TripErrorBoundaryProps, TripErrorBoundaryState> {
  state: TripErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): TripErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Screen failed to render', error, info.componentStack)
  }

  private retry = () => window.location.reload()

  render() {
    if (!this.state.failed) return this.props.children
    const { message = 'No se pudieron cargar los datos del viaje', actionLabel = 'Reintentar' } =
      this.props
    return (
      <TripScreen>
        <main className="mx-auto max-w-md px-5 py-8">
          <TripStatusMessage
            tone="error"
            message={message}
            actionLabel={actionLabel}
            onAction={this.retry}
          />
        </main>
      </TripScreen>
    )
  }
}

export default TripErrorBoundary
