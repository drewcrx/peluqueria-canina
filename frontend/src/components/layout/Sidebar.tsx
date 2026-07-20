import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Lock, LogOut, Sparkles } from 'lucide-react'
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

function NavRow({ item, unlocked }: { item: NavItem; unlocked: boolean }) {
  const Icon = item.icon
  const isLive = Boolean(item.path)

  if (isLive) {
    return (
      <NavLink
        to={item.path!}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
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
      className="group flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 dark:text-slate-600"
      title={unlocked ? `Disponible en ${item.roadmapTag} de la hoja de ruta` : 'Incluido en un plan superior'}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
      <span className="flex-1">{item.label}</span>
      {unlocked ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-500">
          {item.roadmapTag}
        </span>
      ) : (
        <Lock className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-700" strokeWidth={2} />
      )}
    </div>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const { data: tenant } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant, staleTime: 60_000 })
  const planFeatures = tenant?.features

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <motion.div
          whileHover={{ rotate: 12, scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
        >
          <Sparkles className="h-4.5 w-4.5" strokeWidth={2.5} />
        </motion.div>
        <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Peluquería SaaS</span>
        <NotificationBell />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
            Tu negocio
          </p>
          {CORE_NAV_ITEMS.map((item) => (
            <NavRow key={item.label} item={item} unlocked />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
            Funcionalidades premium
          </p>
          {PREMIUM_NAV_ITEMS.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              unlocked={!item.requiresFeature || (planFeatures?.includes(item.requiresFeature) ?? false)}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 px-3 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {user ? initials(user.fullName) : ''}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{user?.fullName}</p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
