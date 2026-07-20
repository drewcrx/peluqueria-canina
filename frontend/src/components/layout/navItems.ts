import { BarChart3, Calendar, ClipboardList, LayoutDashboard, PackageSearch, Scissors, UserCog, Users, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path?: string
  icon: LucideIcon
  /** Feature key required from the plan catalog; undefined = included in every plan (Básico). */
  requiresFeature?: string
  /** Only TenantOwner sees this item — hidden entirely for Employee (not just locked). */
  ownerOnly?: boolean
  /** Shown as a small pill next to the label. */
  roadmapTag: string
}

export const CORE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roadmapTag: 'Fase 1' },
  { label: 'Clientes', path: '/clientes', icon: Users, roadmapTag: 'Fase 2' },
  { label: 'Agenda', path: '/agenda', icon: Calendar, roadmapTag: 'Fase 3' },
  { label: 'Historial', path: '/historial', icon: ClipboardList, roadmapTag: 'Fase 3' },
  { label: 'Servicios', path: '/servicios', icon: Scissors, ownerOnly: true, roadmapTag: 'Fase 2' },
  { label: 'Empleados', path: '/empleados', icon: UserCog, ownerOnly: true, roadmapTag: 'Fase 4' },
]

export const PREMIUM_NAV_ITEMS: NavItem[] = [
  { label: 'Inventario', icon: PackageSearch, requiresFeature: 'Inventory', roadmapTag: 'Fase 5' },
  { label: 'Caja', icon: Wallet, requiresFeature: 'Caja', roadmapTag: 'Fase 5' },
  { label: 'Estadísticas', icon: BarChart3, requiresFeature: 'Stats', roadmapTag: 'Fase 6' },
]
