import { Check } from 'lucide-react'
import { Modal } from '../../components/Modal'

const SUPPORT_EMAIL = 'benjicool2002@hotmail.com'
const SUPPORT_WHATSAPP = '593987141307'

const PLANS = [
  {
    code: 'basico',
    name: 'Básico',
    price: 10,
    features: ['Clientes y mascotas', 'Agenda y disponibilidad', 'Historial', 'Formulario público'],
  },
  {
    code: 'intermedio',
    name: 'Intermedio',
    price: 15,
    features: ['Todo lo del plan Básico', 'Inventario y caja', 'Recordatorios y fotos', 'Estadísticas'],
    highlighted: true,
  },
  {
    code: 'pro',
    name: 'Pro',
    price: 20,
    features: ['Todo lo del plan Intermedio', 'Roles avanzados', 'API', 'WhatsApp, dominio y facturación'],
  },
]

export function PlansModal({
  open,
  onClose,
  currentPlanCode,
}: {
  open: boolean
  onClose: () => void
  currentPlanCode: string
}) {
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Quiero actualizar mi plan de AUREA Pet Spa')}`
  const whatsappHref = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Hola, quiero actualizar el plan de mi peluquería.')}`

  return (
    <Modal open={open} onClose={onClose} title="Planes disponibles">
      <div className="space-y-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.code === currentPlanCode
          return (
            <div
              key={plan.code}
              className={`rounded-xl border p-4 ${
                isCurrent ? 'border-clay bg-clay/10' : plan.highlighted ? 'border-sand-dark bg-sand/30' : 'border-sand-dark/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-ink">{plan.name}</span>
                  {isCurrent && (
                    <span className="rounded-full bg-clay-dark px-2 py-0.5 text-[10px] font-semibold text-cream">
                      Tu plan actual
                    </span>
                  )}
                </div>
                <span className="text-sm text-ink-soft">${plan.price}/mes</span>
              </div>
              <ul className="mt-2 space-y-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <Check size={12} className="shrink-0 text-sage-dark" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        <p className="pt-1 text-sm text-ink-soft">
          Todavía no tenemos pagos automáticos en línea — escríbenos y activamos tu nuevo plan en minutos, sin perder
          tu información.
        </p>

        <div className="flex gap-2">
          <a
            href={mailtoHref}
            className="flex-1 rounded-full bg-clay-dark py-2.5 text-center text-sm font-semibold text-cream shadow-soft transition-transform hover:scale-[1.02]"
          >
            Escribir por correo
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full border border-sand-dark bg-white py-2.5 text-center text-sm font-semibold text-ink hover:bg-sand/40"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </Modal>
  )
}
