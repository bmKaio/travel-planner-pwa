import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

function Card({ children, className = '', title }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      )}
      {children}
    </section>
  )
}

export default Card
