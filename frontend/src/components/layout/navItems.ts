import { BarChart3, Calendar, ClipboardList, LayoutDashboard, PackageSearch, Scissors, Users, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path?: string
  icon: LucideIcon
  /** Feature key required from the plan catalog; undefined = included in every plan (Básico). */
  requiresFeature?: string
  /** Shown as a small pill next to the label. */
  roadmapTag: string
}

export const CORE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roadmapTag: 'Fase 1' },
  { label: 'Clientes', path: '/clientes', icon: Users, roadmapTag: 'Fase 2' },
  { label: 'Servicios', path: '/servicios', icon: Scissors, roadmapTag: 'Fase 2' },
  { label: 'Agenda', icon: Calendar, roadmapTag: 'Fase 3' },
  { label: 'Historial', icon: ClipboardList, roadmapTag: 'Fase 3' },
]

export const PREMIUM_NAV_ITEMS: NavItem[] = [
  { label: 'Inventario', icon: PackageSearch, requiresFeature: 'Inventory', roadmapTag: 'Fase 5' },
  { label: 'Caja', icon: Wallet, requiresFeature: 'Caja', roadmapTag: 'Fase 5' },
  { label: 'Estadísticas', icon: BarChart3, requiresFeature: 'Stats', roadmapTag: 'Fase 6' },
]
