import { Shield, Phone, FileText, ExternalLink, Mail, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDocuments } from '../../hooks/useDocuments'
import Loading from '../common/Loading'
import { isImageFile, isPdfFile } from '../../utils/documents'

interface FallbackInsurance {
  company: string
  policyNumber: string
  phones: string[]
  email: string
  whatsapp: string
}

const FALLBACK_INSURANCE: FallbackInsurance = {
  company: 'Intermundial: Asistencia en viaje',
  policyNumber: 'ESC50-S26-01C1',
  phones: ['+34 910 848 794', '+34 917 586 733'],
  email: 'assistance@servisegur.com',
  whatsapp: '+34 633 22 78 39',
}

function InsuranceCard() {
  const navigate = useNavigate()
  const { loading, getByType } = useDocuments()
  const insuranceDocs = getByType('insurance')
  const doc = insuranceDocs[0]

  if (loading) {
    return (
      <div className="flex min-h-[8rem] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <Loading label="Cargando seguro..." />
      </div>
    )
  }

  const company = (doc?.data.company as string | undefined) || FALLBACK_INSURANCE.company
  const policyNumber =
    (doc?.data.policyNumber as string | undefined) || FALLBACK_INSURANCE.policyNumber
  const phones = doc?.data.emergencyPhone
    ? [String(doc.data.emergencyPhone)]
    : FALLBACK_INSURANCE.phones
  const email = (doc?.data.email as string | undefined) || FALLBACK_INSURANCE.email
  const whatsapp = (doc?.data.whatsapp as string | undefined) || FALLBACK_INSURANCE.whatsapp

  const hasAttachment = doc && (isImageFile(doc.fileData) || isPdfFile(doc.fileData))

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
          <Shield className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{company}</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Póliza {policyNumber}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {phones.map((phone) => (
          <a
            key={phone}
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-travel-blue-50 px-3 py-2 text-sm font-medium text-travel-blue-700 hover:bg-travel-blue-100 dark:bg-travel-blue-900/30 dark:text-travel-blue-300 dark:hover:bg-travel-blue-900/50"
            aria-label={`Llamar al teléfono de emergencias ${phone}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {phone}
          </a>
        ))}
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-travel-blue-50 px-3 py-2 text-sm font-medium text-travel-blue-700 hover:bg-travel-blue-100 dark:bg-travel-blue-900/30 dark:text-travel-blue-300 dark:hover:bg-travel-blue-900/50"
          aria-label={`Enviar correo a ${email}`}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {email}
        </a>
        <a
          href={`https://wa.me/${whatsapp.replace(/[\s+]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
          aria-label={`Contactar por WhatsApp ${whatsapp}`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      </div>

      {doc && (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate(`/documents/${doc.id}`)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
            aria-label="Ver póliza de seguro"
          >
            {hasAttachment ? (
              <>
                <FileText className="h-4 w-4" aria-hidden="true" />
                Ver póliza
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Ver detalles de la póliza
              </>
            )}
          </button>
        </div>
      )}
    </article>
  )
}

export default InsuranceCard
