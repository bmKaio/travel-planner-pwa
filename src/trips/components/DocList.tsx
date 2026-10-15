import { FileText } from 'lucide-react'
import type { DocInfo } from '../types'
import SectionHeading from './SectionHeading'
import { SECTION_STYLE } from './sectionStyle'

const { edge } = SECTION_STYLE.private

function DocList({ docs }: { docs: DocInfo[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionHeading section="private" icon={FileText}>
        Documentos
      </SectionHeading>
      <p className="-mt-1 text-[15px] text-trip-muted">
        Dónde están y a quién llamar si se pierden.
      </p>
      <ul className={`rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card px-4`}>
        {docs.map((doc) => (
          <li
            key={`${doc.name}-${doc.where}`}
            className="flex flex-col gap-0.5 border-t border-trip-line py-3.5 first:border-t-0"
          >
            <p className="text-[17px] font-semibold">{doc.name}</p>
            <p className="text-base text-trip-ink2">Dónde: {doc.where}</p>
            <p className="text-[15px] text-trip-muted">Si se pierde: {doc.who}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default DocList
