interface PageHeaderProps {
  title: string
  subtitle: string
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-[32px] font-bold leading-tight tracking-tight">{title}</h1>
      <p className="text-[17px] font-medium text-trip-ink2">{subtitle}</p>
    </header>
  )
}

export default PageHeader
