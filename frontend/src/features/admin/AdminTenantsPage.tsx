import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PawPrint } from 'lucide-react'
import { useToast } from '../../components/toast/ToastProvider'
import { tableWrapClass, tdClass, thClass, trHoverClass } from '../../components/ui/styles'
import { getErrorMessage } from '../../lib/getErrorMessage'
import { useAuth } from '../auth/AuthContext'
import { activateSubscription, changeTenantPlan, listTenants, seedDemoData, setTenantStatus } from './api'

const PLAN_OPTIONS = [
  { code: 'basico', label: 'Básico' },
  { code: 'intermedio', label: 'Intermedio' },
  { code: 'pro', label: 'Pro' },
]

export function AdminTenantsPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: tenants, isLoading, isError } = useQuery({ queryKey: ['admin-tenants'], queryFn: listTenants })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })

  const statusMutation = useMutation({
    mutationFn: ({ tenantId, suspend }: { tenantId: string; suspend: boolean }) => setTenantStatus(tenantId, suspend),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo actualizar el estado de la peluquería.')),
  })

  const activateMutation = useMutation({
    mutationFn: (tenantId: string) => activateSubscription(tenantId),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo activar el pago.')),
  })

  const seedMutation = useMutation({
    mutationFn: (tenantId: string) => seedDemoData(tenantId),
    onSuccess: () => toast.success('Datos de demo generados.'),
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo generar los datos de demo.')),
  })

  const planMutation = useMutation({
    mutationFn: ({ tenantId, planCode }: { tenantId: string; planCode: string }) => changeTenantPlan(tenantId, planCode),
    onSuccess: () => {
      toast.success('Plan actualizado.')
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo cambiar el plan.')),
  })

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-sand-dark/60 bg-white/70 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay-dark text-cream shadow-soft">
            <PawPrint className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="font-display font-semibold text-ink">
            AUREA <span className="text-clay-dark">Pet Spa</span> · Platform Admin
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-ink-soft">
          <span>{user?.fullName}</span>
          <button onClick={logout} className="font-medium text-clay-dark hover:underline">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 font-display text-2xl font-medium tracking-tight text-ink">Peluquerías registradas</h1>

        {isLoading && <p className="text-ink-soft">Cargando…</p>}
        {isError && <p className="text-red-600">No se pudo cargar la lista de peluquerías.</p>}

        {tenants && (
          <div className={`overflow-x-auto ${tableWrapClass}`}>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sand-dark/60">
                <tr>
                  <th className={thClass}>Peluquería</th>
                  <th className={thClass}>Estado</th>
                  <th className={thClass}>Plan</th>
                  <th className={thClass}>Suscripción</th>
                  <th className={thClass}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.tenantId} className={trHoverClass}>
                    <td className={`${tdClass} font-medium`}>{tenant.name}</td>
                    <td className={tdClass}>{tenant.status}</td>
                    <td className={tdClass}>
                      <select
                        value={tenant.planCode}
                        disabled={planMutation.isPending}
                        onChange={(e) => planMutation.mutate({ tenantId: tenant.tenantId, planCode: e.target.value })}
                        className="rounded-lg border border-sand-dark bg-white/70 px-2 py-1 text-sm text-ink disabled:opacity-50"
                      >
                        {PLAN_OPTIONS.map((plan) => (
                          <option key={plan.code} value={plan.code}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={tdClass}>{tenant.subscriptionStatus}</td>
                    <td className={`${tdClass} space-x-3`}>
                      <button
                        className="font-medium text-clay-dark hover:underline disabled:opacity-50"
                        disabled={activateMutation.isPending}
                        onClick={() => activateMutation.mutate(tenant.tenantId)}
                      >
                        Activar pago
                      </button>
                      <button
                        className="font-medium text-amber-700 hover:underline disabled:opacity-50"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({ tenantId: tenant.tenantId, suspend: tenant.status === 'Active' })
                        }
                      >
                        {tenant.status === 'Active' ? 'Suspender' : 'Reactivar'}
                      </button>
                      <button
                        className="font-medium text-sage-dark hover:underline disabled:opacity-50"
                        disabled={seedMutation.isPending}
                        onClick={() => seedMutation.mutate(tenant.tenantId)}
                      >
                        {seedMutation.isPending && seedMutation.variables === tenant.tenantId
                          ? 'Generando…'
                          : 'Sembrar datos de demo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
