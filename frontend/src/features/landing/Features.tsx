import { BarChart3, Bell, CalendarClock, PawPrint, ShieldCheck, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal, RevealGroup, revealItem } from './Reveal'
import { motion } from 'framer-motion'

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  tone: string
}

const FEATURES: Feature[] = [
  {
    icon: CalendarClock,
    title: 'Agenda inteligente',
    description: 'Controla la disponibilidad de cada empleado y evita choques de horario en segundos.',
    tone: 'bg-clay/15 text-clay-dark',
  },
  {
    icon: PawPrint,
    title: 'Fichas de mascota',
    description: 'Historial completo por cliente y mascota: servicios, fotos de cada visita y notas del equipo.',
    tone: 'bg-sage-light text-sage-dark',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    description: 'Reduce las inasistencias avisando a tus clientes antes de cada cita, sin esfuerzo manual.',
    tone: 'bg-gold/20 text-ink-soft',
  },
  {
    icon: Wallet,
    title: 'Caja e inventario',
    description: 'Registra ventas, controla stock de productos y cierra caja al final del día con confianza.',
    tone: 'bg-clay/15 text-clay-dark',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas en tiempo real',
    description: 'Visualiza ingresos, servicios más pedidos y desempeño de tu equipo con datos, no corazonadas.',
    tone: 'bg-sage-light text-sage-dark',
  },
  {
    icon: ShieldCheck,
    title: 'Roles y permisos',
    description: 'Cada empleado ve solo lo que necesita: dueño, encargado o staff, con accesos a la medida.',
    tone: 'bg-gold/20 text-ink-soft',
  },
]

export function Features() {
  return (
    <section id="producto" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-clay-dark">
            Producto
          </p>
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Todo lo que tu peluquería necesita, en un solo lugar
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Deja de saltar entre cuadernos, chats y hojas de cálculo. AUREA junta cada parte de
            tu operación diaria en una sola experiencia cuidada.
          </p>
        </Reveal>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={revealItem}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-sand-dark/60 bg-white/60 p-7 shadow-soft backdrop-blur-sm"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${feature.tone}`}
              >
                <feature.icon size={20} strokeWidth={2} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.description}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
