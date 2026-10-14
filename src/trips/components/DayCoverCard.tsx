import { useState } from 'react'
import { visibleCover, type CoverView } from '../domain/dayCover'
import { COVER_FALLBACK } from './sectionStyle'

function DayCoverCard({ view }: { view: CoverView }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const cover = visibleCover(view, failedSrc)

  return (
    <header
      className={`relative flex min-h-[200px] items-end overflow-hidden rounded-[20px] sm:min-h-[260px] ${
        cover ? 'bg-slate-800 text-white' : `${COVER_FALLBACK.surface} ${COVER_FALLBACK.text}`
      }`}
    >
      {cover && (
        <>
          <img
            src={cover.image}
            alt={cover.alt}
            loading="eager"
            decoding="async"
            onError={() => setFailedSrc(cover.image)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          />
        </>
      )}
      <div className="relative flex w-full flex-col gap-1 p-5">
        <p className="text-[13px] font-bold uppercase tracking-wider">{view.eyebrow}</p>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">{view.place}</h1>
        <p className="text-[17px] font-medium">{view.dateLabel}</p>
        {cover && (
          <a
            href={cover.creditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-end text-xs text-white/80 underline"
          >
            Foto: {cover.credit}
          </a>
        )}
      </div>
    </header>
  )
}

export default DayCoverCard
