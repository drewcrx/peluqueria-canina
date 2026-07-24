import { motion } from 'framer-motion'
import { ArrowRight, Bell, PawPrint, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BackgroundBlobs } from '../../components/BackgroundBlobs'
import { useCountUp } from '../../lib/useCountUp'

const APPOINTMENTS = [
  { pet: 'Toby', service: 'Baño + corte', time: '10:30', tone: 'bg-sage-light text-sage-dark' },
  { pet: 'Mia', service: 'Spa completo', time: '11:15', tone: 'bg-clay-light/60 text-clay-dark' },
  { pet: 'Rocco', service: 'Corte de uñas', time: '12:00', tone: 'bg-sand text-ink-soft' },
]

function AgendaMockCard() {
  return (
    <motion.div
      className="mt-20 w-[300px] rounded-3xl border border-sand-dark/70 bg-white/80 p-5 shadow-premium backdrop-blur-xl sm:w-[340px]"
      initial={{ opacity: 0, y: 40, rotate: -6 }}
      animate={{ opacity: 1, y: [0, -14, 0], rotate: -4 }}
      transition={{
        opacity: { duration: 0.8, delay: 0.3 },
        y: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
        rotate: { duration: 0.8, delay: 0.3 },
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-ink">Agenda de hoy</p>
        <span className="rounded-full bg-sage-light px-2.5 py-1 text-xs font-medium text-sage-dark">
          3 citas
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {APPOINTMENTS.map((appt) => (
          <div
            key={appt.pet}
            className="flex items-center justify-between rounded-xl bg-cream-dark/60 px-3 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-clay-dark shadow-soft">
                <PawPrint size={14} />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{appt.pet}</p>
                <p className="text-xs text-ink-soft">{appt.service}</p>
              </div>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${appt.tone}`}>
              {appt.time}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function StatsMockCard() {
  const value = useCountUp(128, 1400)
  return (
    <motion.div
      className="absolute -right-2 -top-10 w-44 rounded-2xl border border-sand-dark/70 bg-white/85 p-4 shadow-premium backdrop-blur-xl sm:-right-8"
      initial={{ opacity: 0, y: -30, rotate: 6 }}
      animate={{ opacity: 1, y: [0, 8, 0], rotate: 6 }}
      transition={{
        opacity: { duration: 0.8, delay: 0.6 },
        y: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
        rotate: { duration: 0.8, delay: 0.6 },
      }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay/15 text-clay-dark">
        <TrendingUp size={16} />
      </span>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-soft">citas este mes</p>
    </motion.div>
  )
}

function ReminderChip() {
  return (
    <motion.div
      className="absolute -bottom-6 left-4 flex w-fit items-center gap-2 rounded-2xl border border-sand-dark/70 bg-white/85 px-4 py-3 shadow-premium backdrop-blur-xl sm:-left-10"
      initial={{ opacity: 0, y: 30, rotate: -4 }}
      animate={{ opacity: 1, y: [0, -10, 0], rotate: -4 }}
      transition={{
        opacity: { duration: 0.8, delay: 0.9 },
        y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 },
        rotate: { duration: 0.8, delay: 0.9 },
      }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-light text-sage-dark">
        <Bell size={14} />
      </span>
      <div>
        <p className="text-xs font-semibold text-ink">Recordatorio enviado</p>
        <p className="text-[11px] text-ink-soft">a Toby · mañana 10:30</p>
      </div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-40 pb-24 sm:pt-48">
      <BackgroundBlobs />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-sand-dark bg-white/70 px-4 py-1.5 text-xs font-semibold text-ink-soft shadow-soft"
          >
            <Sparkles size={13} className="text-clay-dark" />
            Software para peluquerías caninas
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Tu peluquería canina,{' '}
            <span className="italic text-clay-dark">tan bien organizada</span> como se ve.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft"
          >
            Agenda, clientes, mascotas, caja e inventario en un solo lugar — con una
            experiencia hecha a la medida de tu marca. Deja el cuaderno y las hojas de cálculo
            atrás.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/registro"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream shadow-premium transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Crear mi cuenta gratis
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-full border border-sand-dark bg-white/60 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white"
            >
              Ver cómo funciona
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8 text-sm text-ink-soft"
          >
            Multi-tenant seguro · Roles por empleado · Formulario público para tus clientes
          </motion.p>
        </div>

        <div className="relative mx-auto h-[460px] w-[340px] sm:w-[380px]">
          <AgendaMockCard />
          <StatsMockCard />
          <ReminderChip />
        </div>
      </div>
    </section>
  )
}
