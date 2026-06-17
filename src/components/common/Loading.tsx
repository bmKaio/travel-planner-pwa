interface LoadingProps {
  fullScreen?: boolean
  label?: string
}

function Loading({ fullScreen = false, label }: LoadingProps) {
  const spinner = (
    <div
      className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-200 border-t-travel-blue-600"
      role="status"
      aria-label={label ?? 'Cargando'}
    >
      <span className="sr-only">{label ?? 'Cargando'}</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        {spinner}
        {label && <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>}
      </div>
    )
  }

  return <div className="flex items-center justify-center p-6">{spinner}</div>
}

export default Loading
