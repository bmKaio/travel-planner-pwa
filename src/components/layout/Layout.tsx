import { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen-safe flex-col bg-white dark:bg-slate-950">
      <Header />
      <main
        id="main-content"
        className="flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6"
        tabIndex={-1}
      >
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
