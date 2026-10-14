import type { EmergencyInfo } from '../types'
import PhoneLink from './PhoneLink'

function EmergencyCard({ emergency }: { emergency: EmergencyInfo }) {
  return (
    <section className="flex flex-col gap-3 rounded-[22px] border-[1.5px] border-trip-urgent bg-trip-urgent-soft p-[18px]">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-bold uppercase tracking-wider text-trip-urgent">Urgencias</p>
        <h2 className="text-xl font-bold">
          {emergency.label} · {emergency.number}
        </h2>
        <p className="text-base text-trip-ink2">{emergency.description}</p>
      </div>
      <PhoneLink number={emergency.number} variant="urgent" className="w-full">
        Llamar al {emergency.number}
      </PhoneLink>
    </section>
  )
}

export default EmergencyCard
