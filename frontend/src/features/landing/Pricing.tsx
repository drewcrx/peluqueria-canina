import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Reveal, RevealGroup, revealItem } from './Reveal'

type Plan = {
  name: string
  price: number
  employees: string
  description: string
  features: string[]
  highlighted?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Básico',
    price: 10,
    employees: '1 empleado',
    description: 'Para empezar a organizar tu peluquería sin papeles.',
    features: ['Clientes y mascotas', 'Agenda y disponibilidad', 'Historial de servicios', 'Formulario público de citas'],
  },
  {
    name: 'Intermedio',
    price: 15,
    employees: 'Hasta 5 empleados',
    description: 'Para equipos que ya venden productos y controlan caja.',
    features: [
      'Todo lo del plan Básico',
      'Inventario y productos',
      'Caja e ingresos',
      'Recordatorios automáticos',
      'Fotos por visita',
      'Estadísticas',
    ],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 20,
    employees: 'Empleados ilimitados',
    description: 'Para peluquerías que quieren llevar todo al siguiente nivel.',
    features: [
      'Todo lo del plan Intermedio',
      'Roles avanzados',
      'Acceso por API',
      'Dashboard avanzado',
      'Dominio propio',
      'Facturación y respaldos automáticos',
    ],
  },
]

export function Pricing() {
  return (
    <section id="planes" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-clay-dark">
            Planes
          </p>
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Un plan para cada etapa de tu negocio
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Cambia de plan cuando tu peluquería crezca, sin perder tu información.
          </p>
        </Reveal>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              variants={revealItem}
              whileHover={{ y: -6 }}
              className={`relative flex flex-col rounded-3xl border p-8 shadow-soft ${
                plan.highlighted
                  ? 'border-clay bg-ink text-cream shadow-premium lg:scale-[1.04]'
                  : 'border-sand-dark/60 bg-white/70 backdrop-blur-sm'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-clay-dark px-4 py-1 text-xs font-semibold text-cream shadow-soft">
                  Más elegido
                </span>
              )}

              <h3
                className={`font-display text-xl font-semibold ${plan.highlighted ? 'text-cream' : 'text-ink'}`}
              >
                {plan.name}
              </h3>
              <p className={`mt-1 text-sm ${plan.highlighted ? 'text-cream/70' : 'text-ink-soft'}`}>
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">${plan.price}</span>
                <span className={plan.highlighted ? 'text-cream/70' : 'text-ink-soft'}>
                  USD / mes
                </span>
              </div>
              <p
                className={`mt-1 text-xs font-medium uppercase tracking-wide ${
                  plan.highlighted ? 'text-cream/60' : 'text-ink-soft'
                }`}
              >
                {plan.employees}
              </p>

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-clay-light' : 'text-sage-dark'}`}
                    />
                    <span className={plan.highlighted ? 'text-cream/90' : 'text-ink-soft'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/registro"
                className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98] ${
                  plan.highlighted ? 'bg-clay-dark text-cream' : 'bg-ink text-cream'
                }`}
              >
                Prueba gratis
              </Link>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
