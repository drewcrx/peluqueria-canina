import { Menu, PawPrint } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function TenantShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-sand-dark/60 bg-white/70 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-sand/60 hover:text-ink"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-clay-dark text-cream">
            <PawPrint className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-sm font-semibold text-ink">
            AUREA <span className="text-clay-dark">Pet Spa</span>
          </span>
        </header>

        <main className="relative flex-1 overflow-y-auto">
          <div className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
