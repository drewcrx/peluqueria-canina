import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function TenantShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto">
        <div className="relative mx-auto max-w-5xl px-8 py-10">{children}</div>
      </main>
    </div>
  )
}
