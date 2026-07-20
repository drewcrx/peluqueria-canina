import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { activateSubscription, listTenants, setTenantStatus } from './api'

export function AdminTenantsPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const { data: tenants, isLoading, isError } = useQuery({ queryKey: ['admin-tenants'], queryFn: listTenants })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })

  const statusMutation = useMutation({
    mutationFn: ({ tenantId, suspend }: { tenantId: string; suspend: boolean }) => setTenantStatus(tenantId, suspend),
    onSuccess: invalidate,
  })

  const activateMutation = useMutation({
    mutationFn: (tenantId: string) => activateSubscription(tenantId),
    onSuccess: invalidate,
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-slate-800 dark:text-slate-100">Platform Admin</span>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>{user?.fullName}</span>
          <button onClick={logout} className="text-indigo-600 hover:underline">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Peluquerías registradas</h1>

        {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}
        {isError && <p className="text-red-500">No se pudo cargar la lista de peluquerías.</p>}

        {tenants && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Peluquería</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Suscripción</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-100">{tenant.name}</td>
                    <td className="px-4 py-3">{tenant.status}</td>
                    <td className="px-4 py-3">{tenant.planCode}</td>
                    <td className="px-4 py-3">{tenant.subscriptionStatus}</td>
                    <td className="px-4 py-3 space-x-3">
                      <button
                        className="text-indigo-600 hover:underline disabled:opacity-50"
                        disabled={activateMutation.isPending}
                        onClick={() => activateMutation.mutate(tenant.tenantId)}
                      >
                        Activar pago
                      </button>
                      <button
                        className="text-amber-600 hover:underline disabled:opacity-50"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({ tenantId: tenant.tenantId, suspend: tenant.status === 'Active' })
                        }
                      >
                        {tenant.status === 'Active' ? 'Suspender' : 'Reactivar'}
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
