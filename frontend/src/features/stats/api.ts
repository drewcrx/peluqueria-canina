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
  newClientsInRange: number
  appointmentsCompletedInRange: number
  lowStockProductsCount: number
  netCashInRange: number
  isCustomRange: boolean
  appointmentsByStatus: AppointmentStatusCount[]
  topServices: ServiceCount[]
  cashFlowByDay: DailyCashFlow[]
}

export async function getDashboardStats(range?: { fromDate: string; toDate: string }): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/stats/dashboard', { params: range })
  return data
}
