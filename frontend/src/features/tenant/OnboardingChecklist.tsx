import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cardClass } from '../../components/ui/styles'
import { listAppointments } from '../appointments/api'
import { listClients } from '../clients/api'
import { listEmployees } from '../employees/api'
import { listServices } from '../services/api'

export function OnboardingChecklist({ publicFormUrl }: { publicFormUrl: string }) {
  const { data: services } = useQuery({ queryKey: ['services'], queryFn: listServices })
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: listClients })
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: listEmployees })
  const { data: appointments } = useQuery({ queryKey: ['appointments'], queryFn: () => listAppointments() })

  const steps = [
    {
      done: (services?.length ?? 0) > 0,
      label: 'Agrega tus servicios',
      to: '/servicios',
    },
    {
      done: (clients?.length ?? 0) > 0,
      label: 'Registra tu primer cliente',
      to: '/clientes',
    },
    {
      done: (employees?.length ?? 0) > 1,
      label: 'Invita a tu equipo',
      to: '/empleados',
    },
    {
      done: (appointments?.length ?? 0) > 0,
      label: 'Agenda tu primera cita',
      to: '/agenda',
    },
  ]

  const allLoaded = services && clients && employees && appointments
  const allDone = steps.every((s) => s.done)

  if (!allLoaded || allDone) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 p-6 ${cardClass}`}
    >
      <h2 className="font-display font-medium text-ink">Primeros pasos</h2>
      <p className="mt-1 text-sm text-ink-soft">Termina de configurar tu peluquería para sacarle todo el provecho.</p>

      <div className="mt-4 space-y-2">
        {steps.map((step) => (
          <Link
            key={step.label}
            to={step.to}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sand/40"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                step.done ? 'bg-sage-light text-sage-dark' : 'bg-sand text-ink-soft/50'
              }`}
            >
              {step.done ? <Check size={12} strokeWidth={3} /> : <Circle size={8} fill="currentColor" />}
            </span>
            <span className={step.done ? 'text-ink-soft line-through' : 'font-medium text-ink'}>{step.label}</span>
          </Link>
        ))}
        <a
          href={publicFormUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sand/40"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sand text-ink-soft/50">
            <Circle size={8} fill="currentColor" />
          </span>
          <span className="font-medium text-ink">Comparte tu formulario público con un cliente</span>
        </a>
      </div>
    </motion.div>
  )
}
