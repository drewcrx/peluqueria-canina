import { Lock, NotebookPen, Palette, PiggyBank, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Reveal, RevealGroup, revealItem } from './Reveal'

type Benefit = {
  icon: LucideIcon
  title: string
  description: string
  tone: string
}

const BENEFITS: Benefit[] = [
  {
    icon: NotebookPen,
    title: 'Deja el cuaderno atrás',
    description:
      'Toda la información de tus clientes y sus mascotas en un solo lugar. Tus clientes llenan sus propios datos desde el celular antes de llegar — tú no digitas nada.',
    tone: 'bg-clay/15 text-clay-dark',
  },
  {
    icon: Palette,
    title: 'Se ve profesional desde el primer contacto',
    description:
      'Tu logo y tus colores en el formulario que compartes por WhatsApp — no una plantilla genérica igual a la de cualquier otro negocio.',
    tone: 'bg-sage-light text-sage-dark',
  },
  {
    icon: PiggyBank,
    title: 'Deja de perder dinero sin darte cuenta',
    description:
      'Caja que cuadra sola al cerrar el día, inventario con alertas de stock bajo y recordatorios automáticos que reducen las inasistencias — que es dinero perdido directo.',
    tone: 'bg-gold/20 text-ink-soft',
  },
  {
    icon: TrendingUp,
    title: 'Decisiones con datos, no con memoria',
    description:
      'Ingresos, servicios más pedidos y desempeño de tu equipo siempre a la mano, para saber qué está funcionando de verdad en tu negocio.',
    tone: 'bg-clay/15 text-clay-dark',
  },
  {
    icon: Users,
    title: 'Crece sin perder el control',
    description:
      'Cada empleado ve solo lo que necesita para trabajar. Cuando tu equipo crece, subes de plan sin migrar de sistema ni perder tu historial.',
    tone: 'bg-sage-light text-sage-dark',
  },
  {
    icon: Lock,
    title: 'Tranquilidad de que tus datos están seguros',
    description:
      'La información de tu peluquería está completamente aislada de la de cualquier otro negocio en la plataforma — nadie más puede verla.',
    tone: 'bg-gold/20 text-ink-soft',
  },
]

export function Benefits() {
  return (
    <section id="beneficios" className="relative bg-sand/30 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sage-dark">
            Beneficios
          </p>
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Lo que gana tu peluquería al usar AUREA
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Más allá de las funciones: esto es lo que cambia de verdad en tu día a día como
            dueño.
          </p>
        </Reveal>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={revealItem}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex gap-4 rounded-3xl border border-sand-dark/60 bg-white/70 p-7 shadow-soft backdrop-blur-sm"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${benefit.tone}`}
              >
                <benefit.icon size={20} strokeWidth={2} />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
