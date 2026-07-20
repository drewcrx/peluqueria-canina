import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { getMyTenant } from './api'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const { data: tenant, isLoading, isError } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-slate-800 dark:text-slate-100">Peluquería SaaS</span>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>{user?.fullName}</span>
          <button onClick={logout} className="text-indigo-600 hover:underline">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Dashboard</h1>

        {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}
        {isError && <p className="text-red-500">No se pudo cargar la información de tu peluquería.</p>}

        {tenant && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Peluquería</p>
              <p className="text-lg font-medium text-slate-800 dark:text-slate-100">{tenant.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Plan</p>
                <p className="text-slate-800 dark:text-slate-100">{tenant.planName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Estado de suscripción</p>
                <p className="text-slate-800 dark:text-slate-100">{tenant.subscriptionStatus}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Formulario público</p>
              <code className="text-sm text-indigo-600">/f/{tenant.publicFormSlug}</code>
            </div>

            {tenant.features.length > 0 && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Funcionalidades incluidas</p>
                <div className="flex flex-wrap gap-2">
                  {tenant.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
