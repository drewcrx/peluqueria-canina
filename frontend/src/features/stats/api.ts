import { api } from '../../lib/api'

export interface AppointmentStatusCount {
  status: string
  count: number
}

export interface ServiceCount {
  serviceName: string
  count: number
}

export interface DailyCashFlow {
  date: string
  income: number
  expense: number
}

export interface DashboardStats {
  totalClients: number
  newClientsThisMonth: number
  appointmentsCompletedThisMonth: number
  lowStockProductsCount: number
  netCashThisMonth: number
  appointmentsByStatus: AppointmentStatusCount[]
  topServices: ServiceCount[]
  cashFlowLast30Days: DailyCashFlow[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/stats/dashboard')
  return data
}
