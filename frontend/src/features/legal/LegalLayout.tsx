import { ArrowLeft, PawPrint } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function LegalLayout({ title, updatedAt, children }: { title: string; updatedAt: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-sand-dark/60 bg-white/70 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay-dark text-cream shadow-soft">
              <PawPrint size={16} strokeWidth={2.2} />
            </span>
            <span className="font-display text-sm font-semibold text-ink">
              AUREA <span className="text-clay-dark">Pet Spa</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink-soft">
          Este documento es una plantilla general y no constituye asesoría legal. Revísalo con un abogado antes de
          publicarlo o de operar comercialmente con clientes reales.
        </div>

        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">Última actualización: {updatedAt}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3 [&_strong]:text-ink">
          {children}
        </div>
      </main>
    </div>
  )
}
