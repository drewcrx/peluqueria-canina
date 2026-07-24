import { AnimatePresence, motion } from 'framer-motion'
import { Menu, PawPrint, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { href: '#producto', label: 'Producto' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#planes', label: 'Planes' },
  { href: '#preguntas', label: 'Preguntas' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(251, 247, 241, 0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          boxShadow: scrolled ? 'var(--shadow-soft)' : 'none',
          border: scrolled ? '1px solid var(--color-sand-dark)' : '1px solid transparent',
        }}
      >
        <a href="#top" className="flex items-center gap-2 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay-dark text-cream shadow-soft">
            <PawPrint size={18} strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            AUREA <span className="text-clay-dark">Pet Spa</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream shadow-soft transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Prueba gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink md:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-2 overflow-hidden rounded-2xl border border-sand-dark bg-cream shadow-premium md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-sand/60 hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-sand-dark pt-3">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-ink-soft hover:bg-sand/60"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="rounded-full bg-ink px-3 py-2.5 text-center text-sm font-semibold text-cream"
                >
                  Prueba gratis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
