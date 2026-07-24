import { api } from '../../lib/api'

export interface TenantSummary {
  tenantId: string
  name: string
  status: string
  planCode: string
  subscriptionStatus: string
  currentPeriodEnd: string
  createdAt: string
}

export async function listTenants(): Promise<TenantSummary[]> {
  const { data } = await api.get<TenantSummary[]>('/admin/tenants')
  return data
}

export async function setTenantStatus(tenantId: string, suspend: boolean): Promise<void> {
  await api.post(`/admin/tenants/${tenantId}/status`, { suspend })
}

export async function activateSubscription(tenantId: string): Promise<void> {
  await api.post(`/admin/tenants/${tenantId}/subscription`, { action: 'Activate' })
}

export async function changeTenantPlan(tenantId: string, newPlanCode: string): Promise<void> {
  await api.post(`/admin/tenants/${tenantId}/subscription`, { action: 'Activate', newPlanCode })
}

export async function seedDemoData(tenantId: string): Promise<void> {
  await api.post(`/admin/tenants/${tenantId}/seed-demo-data`)
}
