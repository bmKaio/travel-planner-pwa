import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Loading from './components/common/Loading'
import LegacyTripLayout from './trips/components/LegacyTripLayout'
import LandingRedirect from './trips/pages/LandingRedirect'
import { VIETNAM_HOME_PATH } from './trips/registry'

function DailyPlanRedirect() {
  const { date } = useParams<{ date: string }>()
  return <Navigate to={`/schedule/${date}`} replace />
}

const Dashboard = lazy(() => import('./pages/Dashboard'))
const PreTravel = lazy(() => import('./pages/PreTravel'))
const Documents = lazy(() => import('./pages/Documents'))
const Schedule = lazy(() => import('./pages/Schedule'))
const DayDetail = lazy(() => import('./pages/DayDetail'))
const Places = lazy(() => import('./pages/Places'))
const PlaceDetail = lazy(() => import('./pages/PlaceDetail'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const RecommendationDetail = lazy(() => import('./pages/RecommendationDetail'))
const CountryInfo = lazy(() => import('./pages/CountryInfo'))
const DocumentDetail = lazy(() => import('./pages/DocumentDetail'))
const Accommodations = lazy(() => import('./pages/Accommodations'))
const MorePage = lazy(() => import('./pages/MorePage'))
const Coffee = lazy(() => import('./pages/Coffee'))
const Food = lazy(() => import('./pages/Food'))
const Diary = lazy(() => import('./pages/Diary'))
const DiaryDetail = lazy(() => import('./pages/DiaryDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))
const TripSwitcher = lazy(() => import('./trips/pages/TripSwitcher'))
const TripShell = lazy(() => import('./trips/pages/TripShell'))
const TripHomeRedirect = lazy(() => import('./trips/pages/TripHomeRedirect'))
const TodayPage = lazy(() => import('./trips/pages/TodayPage'))
const ItineraryPage = lazy(() => import('./trips/pages/ItineraryPage'))

const BASE_NAME = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <BrowserRouter basename={BASE_NAME}>
      <Suspense fallback={<Loading fullScreen label="Cargando..." />}>
        <Routes>
          <Route path="/" element={<LandingRedirect />} />
          <Route path="/trips" element={<TripSwitcher />} />

          {/* v2 trips (new engine). /trips/vietnam-2026 is matched by the static legacy route. */}
          <Route path="/trips/:tripId" element={<TripShell />}>
            <Route index element={<TripHomeRedirect />} />
            <Route path="today" element={<TodayPage />} />
            <Route path="itinerary" element={<ItineraryPage />} />
            <Route path="itinerary/:date" element={<ItineraryPage />} />
            <Route path="*" element={<TripHomeRedirect />} />
          </Route>

          {/* Legacy Vietnam trip: frozen pages, paths unchanged except its home. */}
          <Route element={<LegacyTripLayout tripId="vietnam-2026" />}>
            <Route path={VIETNAM_HOME_PATH} element={<Dashboard />} />
            <Route path="/pre-travel" element={<PreTravel />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/:date" element={<DayDetail />} />
            <Route path="/daily/:date" element={<DailyPlanRedirect />} />
            <Route path="/places" element={<Places />} />
            <Route path="/map" element={<Places />} />
            <Route path="/places/:id" element={<PlaceDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/recommendations/:id" element={<RecommendationDetail />} />
            <Route path="/countries/:id" element={<CountryInfo />} />
            <Route path="/accommodations" element={<Accommodations />} />
            <Route path="/settings" element={<Navigate to="/more" replace />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/coffee" element={<Coffee />} />
            <Route path="/food" element={<Food />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/diary/:date" element={<DiaryDetail />} />
          </Route>

          <Route
            path="/404"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
