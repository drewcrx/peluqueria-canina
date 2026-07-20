import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Calendar, Check, Copy, ExternalLink, Sparkles, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DashboardSkeleton } from '../../components/layout/DashboardSkeleton'
import { TenantShell } from '../../components/layout/TenantShell'
import { useCountUp } from '../../lib/useCountUp'
import { useAuth } from '../auth/AuthContext'
import { getMyTenant, type MyTenant } from './api'

const STATUS_STYLES: Record<MyTenant['subscriptionStatus'], { label: string; className: string }> = {
  Trialing: { label: 'En prueba', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  Active: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  PastDue: { label: 'Pago pendiente', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  Cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
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
      {/* Decorative background glow — subtle, purely visual */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 -left-32 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/10"
          animate={{ y: [0, -16, 0], x: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {isLoading && <DashboardSkeleton />}
      {isError && <p className="text-red-500">No se pudo cargar la información de tu peluquería.</p>}

      {tenant && (
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Hola, {firstName}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Esto es lo que está pasando hoy en <span className="font-medium">{tenant.name}</span>.
                </p>
              </motion.div>

              {tenant.subscriptionStatus === 'Trialing' && (
                <motion.div
                  variants={itemVariants}
                  className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white shadow-lg shadow-indigo-600/20"
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15"
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
                        <p className="text-sm text-indigo-100">
                          Tu prueba termina el {formatDate(tenant.currentPeriodEnd)}. Actualiza cuando quieras — sin
                          perder tus datos.
                        </p>
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="shrink-0 cursor-default rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur-sm"
                    >
                      Actualizar plan · Próximamente
                    </motion.span>
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Plan actual" value={`${tenant.planName} · $${tenant.planPriceUsd}/mes`} />
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
                  label="Límite de empleados"
                  value={tenant.maxEmployees ? `1 de ${tenant.maxEmployees}` : 'Ilimitado'}
                />
              </motion.div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                      <ExternalLink className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="font-medium text-slate-900 dark:text-slate-50">Formulario público</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Compártelo con tus clientes para que registren a su mascota
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <code className="flex-1 truncate text-sm text-slate-600 dark:text-slate-300">{publicFormUrl}</code>
                    <motion.button
                      onClick={copyFormUrl}
                      whileTap={{ scale: 0.94 }}
                      className="flex shrink-0 items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
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
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
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
                  <p className="mt-3 text-xs text-slate-400 dark:text-slate-600">
                    Compártelo por WhatsApp o donde prefieras — cada envío crea el cliente y la mascota automáticamente.
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
                      <Calendar className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <h2 className="font-medium text-slate-900 dark:text-slate-50">Tu plan</h2>
                  </div>

                  {tenant.features.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tenant.features.map((feature, i) => (
                        <motion.span
                          key={feature}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        El Plan {tenant.planName} cubre lo esencial: clientes, mascotas, agenda, historial y formulario
                        público.
                      </p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Con <span className="font-medium text-slate-700 dark:text-slate-300">Intermedio</span>{' '}
                        desbloqueas {PREMIUM_TEASER.intermedio}.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
    </TenantShell>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: ReactNode; icon?: typeof Users }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">{value}</div>
    </motion.div>
  )
}
