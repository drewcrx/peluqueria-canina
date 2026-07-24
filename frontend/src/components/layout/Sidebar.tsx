import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Lock, LogOut, PawPrint } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { getMyTenant } from '../../features/tenant/api'
import { CORE_NAV_ITEMS, PREMIUM_NAV_ITEMS, type NavItem } from './navItems'
import { NotificationBell } from './NotificationBell'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function NavRow({ item, unlocked, onNavigate }: { item: NavItem; unlocked: boolean; onNavigate: () => void }) {
  const Icon = item.icon
  // Un item con path pero sin "unlocked" ya está construido — el candado es por plan, no por
  // fase del roadmap, así que nunca debe comportarse como link aunque tenga ruta.
  const isLive = Boolean(item.path) && unlocked

  if (isLive) {
    return (
      <NavLink
        to={item.path!}
        onClick={onNavigate}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive ? 'bg-ink text-cream shadow-soft' : 'text-ink-soft hover:bg-sand/60 hover:text-ink'
          }`
        }
      >
        <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
        <span className="flex-1">{item.label}</span>
      </NavLink>
    )
  }

  return (
    <div
      className="group flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft/40"
      title={unlocked ? `Disponible en ${item.roadmapTag} de la hoja de ruta` : 'Incluido en un plan superior'}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
      <span className="flex-1">{item.label}</span>
      {unlocked ? (
        <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
          {item.roadmapTag}
        </span>
      ) : (
        <Lock className="h-3.5 w-3.5 shrink-0 text-ink-soft/30" strokeWidth={2} />
      )}
    </div>
  )
}

export function Sidebar({ open = false, onClose = () => {} }: { open?: boolean; onClose?: () => void }) {
  const { user, logout } = useAuth()
  const { data: tenant } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant, staleTime: 60_000 })
  const planFeatures = tenant?.features
  const isOwner = user?.roles.includes('TenantOwner') ?? false
  const isOwnerOrManager = isOwner || (user?.roles.includes('Manager') ?? false)
  const visibleCoreItems = CORE_NAV_ITEMS.filter((item) => !item.ownerOnly || isOwnerOrManager)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-sand-dark/60 bg-cream transition-transform duration-300 lg:relative lg:z-10 lg:w-64 lg:translate-x-0 lg:bg-white/60 lg:backdrop-blur-sm ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay-dark text-cream shadow-soft"
          >
            <PawPrint className="h-4.5 w-4.5" strokeWidth={2.2} />
          </motion.div>
          <span className="flex-1 font-display text-sm font-semibold text-ink">
            AUREA <span className="text-clay-dark">Pet Spa</span>
          </span>
          <NotificationBell />
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft/60">
              Tu negocio
            </p>
            {visibleCoreItems.map((item) => (
              <NavRow key={item.label} item={item} unlocked onNavigate={onClose} />
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft/60">
              Funcionalidades premium
            </p>
            {PREMIUM_NAV_ITEMS.filter((item) => !item.strictOwnerOnly || isOwner).map((item) => (
              <NavRow
                key={item.label}
                item={item}
                unlocked={!item.requiresFeature || (planFeatures?.includes(item.requiresFeature) ?? false)}
                onNavigate={onClose}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-sand-dark/60 px-3 py-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clay/15 text-xs font-semibold text-clay-dark">
              {user ? initials(user.fullName) : ''}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user?.fullName}</p>
              <p className="truncate text-xs text-ink-soft">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="rounded-lg p-1.5 text-ink-soft hover:bg-sand/60 hover:text-ink"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
