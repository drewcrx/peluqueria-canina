import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { ROLE_PLATFORM_ADMIN } from '../features/auth/types'

/** Catch-all for unmatched routes — sends an already-authenticated user back to their own
 * home instead of bouncing them out to /login just because the URL was a typo or stale link. */
export function NotFoundRedirect() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink-soft">
        Cargando…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={user.roles.includes(ROLE_PLATFORM_ADMIN) ? '/admin' : '/dashboard'} replace />
}
