import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Loading from '../../components/common/Loading'
import { useRecordLastTrip } from '../hooks/useRecordLastTrip'

/** Wraps the frozen Vietnam routes: legacy header/nav, and records the trip as last opened. */
function LegacyTripLayout({ tripId }: { tripId: string }) {
  useRecordLastTrip(tripId)
  return (
    <Layout>
      <Suspense fallback={<Loading fullScreen label="Cargando..." />}>
        <Outlet />
      </Suspense>
    </Layout>
  )
}

export default LegacyTripLayout
