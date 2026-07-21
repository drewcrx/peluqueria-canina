import { api } from '../../lib/api'

export interface MyTenant {
  tenantId: string
  name: string
  publicFormSlug: string
  planCode: string
  planName: string
  planPriceUsd: number
  maxEmployees: number | null
  employeeCount: number
  subscriptionStatus: 'Trialing' | 'Active' | 'PastDue' | 'Cancelled'
  startedAt: string
  currentPeriodEnd: string
  features: string[]
  whatsAppNumber: string | null
  customDomainRequested: string | null
}

export async function getMyTenant(): Promise<MyTenant> {
  const { data } = await api.get<MyTenant>('/tenant/me')
  return data
}

export async function updateWhatsAppSettings(whatsAppNumber: string | null): Promise<void> {
  await api.put('/tenant/whatsapp-settings', { whatsAppNumber })
}

export async function updateCustomDomain(customDomainRequested: string | null): Promise<void> {
  await api.put('/tenant/custom-domain', { customDomainRequested })
}
