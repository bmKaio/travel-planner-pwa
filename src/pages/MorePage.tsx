import { useNavigate } from 'react-router-dom'
import { FileText, Shield, MapPin, ChevronRight, Backpack, Coffee, Map } from 'lucide-react'
import InsuranceCard from '../components/more/InsuranceCard'
import EmbassyCard from '../components/more/EmbassyCard'
import SettingsSection from '../components/more/SettingsSection'

interface SectionLinkProps {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
}

function SectionLink({ icon, title, description, onClick }: SectionLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900"
      aria-label={title}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-travel-blue-50 text-travel-blue-600 dark:bg-travel-blue-900/30 dark:text-travel-blue-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      />
    </button>
  )
}

function MorePage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Más</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Centro de ayuda, recursos y ajustes.
        </p>
      </div>

      <section aria-labelledby="pretravel-heading">
        <h2
          id="pretravel-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Pre-viaje
        </h2>
        <SectionLink
          to="/pre-travel"
          icon={<Backpack className="h-6 w-6" aria-hidden="true" />}
          title="Pre-viaje"
          description="Checklist de equipaje, vacunas, dinero, conectividad y consejos."
          onClick={() => navigate('/pre-travel')}
        />
      </section>

      <section aria-labelledby="vietnam-heading">
        <h2
          id="vietnam-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Vietnam
        </h2>
        <SectionLink
          to="/coffee"
          icon={<Coffee className="h-6 w-6" aria-hidden="true" />}
          title="Guía del Café"
          description="Tipos de café vietnamita, dónde tomarlo y cómo pedirlo."
          onClick={() => navigate('/coffee')}
        />
      </section>

      <section aria-labelledby="help-heading">
        <h2
          id="help-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Ayuda y recursos
        </h2>
        <div className="space-y-3">
          <SectionLink
            to=""
            icon={<Map className="h-6 w-6" aria-hidden="true" />}
            title="Mapa del viaje"
            description="Itinerario, alojamientos y lugares en Google Maps."
            onClick={() =>
              window.open(
                'https://www.google.com/maps/d/u/0/edit?mid=1v-DtRDm2D1V9d58TS67soWFho_ALOJA&usp=sharing',
                '_blank',
                'noopener,noreferrer'
              )
            }
          />

          <SectionLink
            to="/documents"
            icon={<FileText className="h-6 w-6" aria-hidden="true" />}
            title="Documentación"
            description="Pasaportes, billetes, reservas de hotel y seguro de viaje."
            onClick={() => navigate('/documents')}
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Seguro</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Teléfonos de emergencia y póliza.
                </p>
              </div>
            </div>
            <InsuranceCard />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Embajada</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Embajadas de España en Hanoi y Phnom Penh.
                </p>
              </div>
            </div>
            <EmbassyCard />
          </div>
        </div>
      </section>

      <section aria-labelledby="settings-heading">
        <h2
          id="settings-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          Ajustes
        </h2>
        <SettingsSection />
      </section>
    </div>
  )
}

export default MorePage
