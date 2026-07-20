import { api } from '../../lib/api'

export interface MyTenant {
  tenantId: string
  name: string
  publicFormSlug: string
  planCode: string
  planName: string
  subscriptionStatus: string
  currentPeriodEnd: string
  features: string[]
}

export async function getMyTenant(): Promise<MyTenant> {
  const { data } = await api.get<MyTenant>('/tenant/me')
  return data
}
