import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Reveal } from './Reveal'

export function CallToAction() {
  return (
    <section className="relative px-6 py-16">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-8 py-16 text-center shadow-premium sm:px-16">
          <motion.div
            className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-clay/30 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-sage/30 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          <h2 className="relative font-display text-3xl font-medium tracking-tight text-cream sm:text-4xl">
            Dale a tu peluquería la imagen que se merece
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-cream/70">
            Crea tu cuenta hoy y ten tu agenda, tu equipo y tu marca funcionando en un solo lugar.
          </p>
          <Link
            to="/registro"
            className="group relative mt-9 inline-flex items-center gap-2 rounded-full bg-clay-dark px-8 py-3.5 text-sm font-semibold text-cream shadow-soft transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Crear mi cuenta gratis
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
