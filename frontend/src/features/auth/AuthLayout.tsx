import { motion } from 'framer-motion'
import { PawPrint } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BackgroundBlobs } from '../../components/BackgroundBlobs'

export function AuthLayout({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
  cardClassName,
}: {
  title: string
  subtitle: string
  eyebrow?: ReactNode
  children: ReactNode
  footer: ReactNode
  cardClassName?: string
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-4 py-12">
      <BackgroundBlobs />

      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay-dark text-cream shadow-soft">
          <PawPrint size={18} strokeWidth={2.2} />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          AUREA <span className="text-clay-dark">Pet Spa</span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full rounded-3xl border border-sand-dark/60 bg-white/75 p-8 shadow-premium backdrop-blur-xl sm:p-10 ${
          cardClassName ?? 'max-w-md'
        }`}
      >
        <div className="text-center">
          {eyebrow && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-sand-dark bg-white/70 px-4 py-1.5 text-xs font-semibold text-ink-soft">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
        </div>

        <div className="mt-8">{children}</div>
      </motion.div>

      <p className="relative mt-8 text-center text-sm text-ink-soft">{footer}</p>
    </div>
  )
}

export const authInputClass =
  'w-full rounded-xl border border-sand-dark bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition-colors focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/25'

export const authLabelClass = 'mb-1.5 block text-sm font-medium text-ink-soft'

export const authButtonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-cream shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100'
