import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

export function ProtectedRoute({ requireRole, requireAnyRole }: { requireRole?: string; requireAnyRole?: string[] }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
        Cargando…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasRequiredRole = requireRole ? user.roles.includes(requireRole) : true
  const hasAnyRequiredRole = requireAnyRole ? requireAnyRole.some((r) => user.roles.includes(r)) : true

  if (!hasRequiredRole || !hasAnyRequiredRole) {
    // Autenticado pero sin el rol correcto (p. ej. un Employee entrando a una ruta de dueño):
    // lo mandamos a un lugar válido para su rol, no al login (ya inició sesión).
    return <Navigate to={user.tenantId ? '/dashboard' : '/login'} replace />
  }

  return <Outlet />
}
