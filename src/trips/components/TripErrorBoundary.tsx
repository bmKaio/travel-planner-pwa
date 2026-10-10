import { Component, type ErrorInfo, type ReactNode } from 'react'
import TripScreen from './TripScreen'
import TripStatusMessage from './TripStatusMessage'

interface TripErrorBoundaryProps {
  children: ReactNode
}

interface TripErrorBoundaryState {
  failed: boolean
}

/** Safety net for render errors in v2 trip screens (data errors are values, see the hooks). */
class TripErrorBoundary extends Component<TripErrorBoundaryProps, TripErrorBoundaryState> {
  state: TripErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): TripErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Trip screen failed to render', error, info.componentStack)
  }

  private retry = () => this.setState({ failed: false })

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <TripScreen>
        <main className="mx-auto max-w-md px-5 py-8">
          <TripStatusMessage
            message="No se pudieron cargar los datos del viaje"
            actionLabel="Reintentar"
            onAction={this.retry}
          />
        </main>
      </TripScreen>
    )
  }
}

export default TripErrorBoundary
