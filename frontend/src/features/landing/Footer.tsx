import { PawPrint } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="relative border-t border-sand-dark/60 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay-dark text-cream">
            <PawPrint size={15} />
          </span>
          <span className="font-display text-sm font-semibold text-ink">
            AUREA <span className="text-clay-dark">Pet Spa</span>
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-ink-soft">
          <a href="#producto" className="hover:text-ink">
            Producto
          </a>
          <a href="#beneficios" className="hover:text-ink">
            Beneficios
          </a>
          <a href="#planes" className="hover:text-ink">
            Planes
          </a>
          <a href="#preguntas" className="hover:text-ink">
            Preguntas
          </a>
          <Link to="/terminos" className="hover:text-ink">
            Términos
          </Link>
          <Link to="/privacidad" className="hover:text-ink">
            Privacidad
          </Link>
        </nav>

        <p className="text-xs text-ink-soft">© {new Date().getFullYear()} AUREA Pet Spa</p>
      </div>
    </footer>
  )
}
