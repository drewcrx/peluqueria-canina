import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Reveal } from './Reveal'

const QUESTIONS = [
  {
    question: '¿Mis datos están separados de los de otras peluquerías?',
    answer:
      'Sí. Cada peluquería tiene su información completamente aislada de las demás, reforzado a nivel de base de datos, no solo de la aplicación.',
  },
  {
    question: '¿Necesito instalar algo?',
    answer:
      'No. AUREA es 100% web: se usa desde el navegador, tanto en computadora como en celular, sin instalar nada.',
  },
  {
    question: '¿Puedo dar accesos distintos a cada empleado?',
    answer:
      'Sí. Según tu plan puedes asignar roles como dueño, encargado o empleado, cada uno con permisos distintos dentro del sistema.',
  },
  {
    question: '¿Puedo cambiar de plan más adelante?',
    answer:
      'Sí, puedes subir de plan cuando tu peluquería lo necesite, sin perder tu historial ni tu información.',
  },
  {
    question: '¿Cómo reciben citas mis clientes nuevos?',
    answer:
      'Cada peluquería tiene un formulario público propio para que los clientes soliciten citas y dejen los datos de su mascota antes de la primera visita.',
  },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="preguntas" className="relative py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sage-dark">
            Preguntas frecuentes
          </p>
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Todo lo que quieres saber antes de empezar
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col gap-3">
          {QUESTIONS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-sand-dark/60 bg-white/60 backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-medium text-ink">{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand text-ink-soft"
                  >
                    <Plus size={14} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
