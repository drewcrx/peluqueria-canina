import { api } from '../../lib/api'

export interface MyTenant {
  tenantId: string
  name: string
  publicFormSlug: string
  planCode: string
  planName: string
  planPriceUsd: number
  maxEmployees: number | null
  subscriptionStatus: 'Trialing' | 'Active' | 'PastDue' | 'Cancelled'
  startedAt: string
  currentPeriodEnd: string
  features: string[]
}

export async function getMyTenant(): Promise<MyTenant> {
  const { data } = await api.get<MyTenant>('/tenant/me')
  return data
}
