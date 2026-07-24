import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Calendar, Check, Copy, ExternalLink, Sparkles, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { BackgroundBlobs } from '../../components/BackgroundBlobs'
import { DashboardSkeleton } from '../../components/layout/DashboardSkeleton'
import { TenantShell } from '../../components/layout/TenantShell'
import { cardClass } from '../../components/ui/styles'
import { useCountUp } from '../../lib/useCountUp'
import { useAuth } from '../auth/AuthContext'
import { getMyTenant, type MyTenant } from './api'
import { OnboardingChecklist } from './OnboardingChecklist'
import { PlansModal } from './PlansModal'

const STATUS_STYLES: Record<MyTenant['subscriptionStatus'], { label: string; className: string }> = {
  Trialing: { label: 'En prueba', className: 'bg-clay/15 text-clay-dark' },
  Active: { label: 'Activa', className: 'bg-sage-light text-sage-dark' },
  PastDue: { label: 'Pago pendiente', className: 'bg-gold/25 text-ink-soft' },
  Cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700' },
}

const PREMIUM_TEASER: Record<string, string> = {
  intermedio: 'Inventario, Caja, Recordatorios, Fotografías y Estadísticas',
  pro: 'Roles avanzados, API, WhatsApp Business, Facturación y Backups automáticos',
}

function daysUntil(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / 86_400_000))
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
} satisfies Variants

export function DashboardPage() {
  const { user } = useAuth()
  const { data: tenant, isLoading, isError } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant })
  const [copied, setCopied] = useState(false)
  const [plansOpen, setPlansOpen] = useState(false)

  const firstName = user?.fullName.split(' ')[0]
  const publicFormUrl = tenant ? `${window.location.origin}/f/${tenant.publicFormSlug}` : ''
  const daysLeft = useCountUp(tenant ? daysUntil(tenant.currentPeriodEnd) : 0)

  async function copyFormUrl() {
    await navigator.clipboard.writeText(publicFormUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <TenantShell>
      <BackgroundBlobs />

      {isLoading && <DashboardSkeleton />}
      {isError && <p className="text-red-600">No se pudo cargar la información de tu peluquería.</p>}

      {tenant && (
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="font-display text-2xl font-medium tracking-tight text-ink">Hola, {firstName}</h1>
                <p className="mt-1 text-ink-soft">
                  Esto es lo que está pasando hoy en <span className="font-medium text-ink">{tenant.name}</span>.
                </p>
              </motion.div>

              <OnboardingChecklist publicFormUrl={publicFormUrl} />

              {tenant.subscriptionStatus === 'Trialing' && (
                <motion.div
                  variants={itemVariants}
                  className="relative mb-8 overflow-hidden rounded-2xl bg-ink px-6 py-5 text-cream shadow-premium"
                >
                  {/* Shine sweep */}
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-white/10"
                    animate={{ left: ['-40%', '140%'] }}
                    transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                  />

                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay/25"
                        animate={{ rotate: [0, 12, -12, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Sparkles className="h-5 w-5" strokeWidth={2} />
                      </motion.div>
                      <div>
                        <p className="font-medium">
                          Te quedan <span className="tabular-nums">{daysLeft}</span> días de prueba en el Plan{' '}
                          {tenant.planName}
                        </p>
                        <p className="text-sm text-cream/70">
                          Tu prueba termina el {formatDate(tenant.currentPeriodEnd)}. Actualiza cuando quieras — sin
                          perder tus datos.
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setPlansOpen(true)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="shrink-0 rounded-full bg-clay-dark px-3 py-1.5 text-sm font-medium"
                    >
                      Ver planes
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  label="Plan actual"
                  value={
                    <span className="flex items-center gap-2">
                      {tenant.planName} · ${tenant.planPriceUsd}/mes
                      <button
                        onClick={() => setPlansOpen(true)}
                        className="text-xs font-medium text-clay-dark hover:underline"
                      >
                        Ver planes
                      </button>
                    </span>
                  }
                />
                <StatCard
                  label="Estado de suscripción"
                  value={
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${STATUS_STYLES[tenant.subscriptionStatus].className}`}
                    >
                      {STATUS_STYLES[tenant.subscriptionStatus].label}
                    </span>
                  }
                />
                <StatCard
                  icon={Users}
                  label="Empleados"
                  value={tenant.maxEmployees ? `${tenant.employeeCount} de ${tenant.maxEmployees}` : `${tenant.employeeCount} · Ilimitado`}
                />
              </motion.div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`lg:col-span-3 p-6 ${cardClass}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay/15 text-clay-dark">
                      <ExternalLink className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="font-display font-medium text-ink">Formulario público</h2>
                      <p className="text-sm text-ink-soft">
                        Compártelo con tus clientes para que registren a su mascota
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-sand-dark/60 bg-cream-dark/50 px-3 py-2.5">
                    <code className="flex-1 truncate text-sm text-ink-soft">{publicFormUrl}</code>
                    <motion.button
                      onClick={copyFormUrl}
                      whileTap={{ scale: 0.94 }}
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-ink-soft shadow-soft ring-1 ring-sand-dark hover:bg-sand/40"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5 text-sage-dark" />
                            Copiado
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-1.5"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copiar
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                  <p className="mt-3 text-xs text-ink-soft">
                    Compártelo por WhatsApp o donde prefieras — cada envío crea el cliente y la mascota automáticamente.
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`lg:col-span-2 p-6 ${cardClass}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-light text-sage-dark">
                      <Calendar className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <h2 className="font-display font-medium text-ink">Tu plan</h2>
                  </div>

                  {tenant.features.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tenant.features.map((feature, i) => (
                        <motion.span
                          key={feature}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className="rounded-full bg-clay/15 px-2.5 py-1 text-xs font-medium text-clay-dark"
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-ink-soft">
                        El Plan {tenant.planName} cubre lo esencial: clientes, mascotas, agenda, historial y formulario
                        público.
                      </p>
                      <p className="mt-2 text-sm text-ink-soft">
                        Con <span className="font-medium text-ink">Intermedio</span>{' '}
                        desbloqueas {PREMIUM_TEASER.intermedio}.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

      {tenant && <PlansModal open={plansOpen} onClose={() => setPlansOpen(false)} currentPlanCode={tenant.planCode} />}
    </TenantShell>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: ReactNode; icon?: typeof Users }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`p-5 ${cardClass}`}
    >
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-ink">{value}</div>
    </motion.div>
  )
}
