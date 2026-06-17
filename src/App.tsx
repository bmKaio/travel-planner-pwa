import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Loading from './components/common/Loading'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const PreTravel = lazy(() => import('./pages/PreTravel'))
const Documents = lazy(() => import('./pages/Documents'))
const Schedule = lazy(() => import('./pages/Schedule'))
const DayView = lazy(() => import('./pages/DayView'))
const DailyPlan = lazy(() => import('./pages/DailyPlan'))
const Places = lazy(() => import('./pages/Places'))
const PlaceDetail = lazy(() => import('./pages/PlaceDetail'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const RecommendationDetail = lazy(() => import('./pages/RecommendationDetail'))
const CountryInfo = lazy(() => import('./pages/CountryInfo'))
const DocumentDetail = lazy(() => import('./pages/DocumentDetail'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

const BASE_NAME = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <BrowserRouter basename={BASE_NAME}>
      <Layout>
        <Suspense fallback={<Loading fullScreen label="Cargando..." />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pre-travel" element={<PreTravel />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/:date" element={<DayView />} />
            <Route path="/daily/:date" element={<DailyPlan />} />
            <Route path="/places" element={<Places />} />
            <Route path="/places/:id" element={<PlaceDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/recommendations/:id" element={<RecommendationDetail />} />
            <Route path="/countries/:id" element={<CountryInfo />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}

export default App
