import { Reveal, RevealGroup, revealItem } from './Reveal'
import { motion } from 'framer-motion'

const STEPS = [
  {
    number: '01',
    title: 'Crea tu peluquería',
    description:
      'Regístrate, elige tu plan y configura el nombre, slug y datos de tu negocio en minutos.',
  },
  {
    number: '02',
    title: 'Arma tu equipo y servicios',
    description:
      'Carga tus servicios y precios, invita a tus empleados y define qué puede ver cada rol.',
  },
  {
    number: '03',
    title: 'Recibe y agenda clientes',
    description:
      'Comparte tu formulario público para nuevos clientes y empieza a llenar tu agenda del día.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sage-dark">
            Cómo funciona
          </p>
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            De cero a tu primera cita, en tres pasos
          </h2>
        </Reveal>

        <RevealGroup className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="pointer-events-none absolute top-8 left-0 right-0 hidden h-px bg-sand-dark md:block" />
          {STEPS.map((step) => (
            <motion.div key={step.number} variants={revealItem} className="relative text-center md:text-left">
              <span className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sand-dark bg-cream font-display text-xl font-semibold text-clay-dark shadow-soft md:mx-0">
                {step.number}
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.description}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
