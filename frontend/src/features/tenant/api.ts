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
  logoUrl: string | null
  brandColor: string | null
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

export async function updateBranding(name: string, brandColor: string | null): Promise<void> {
  await api.put('/tenant/branding', { name, brandColor })
}

export async function uploadLogo(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('logo', file)
  const { data } = await api.post<string>('/tenant/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export type DayOfWeekName = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

export const DAYS_OF_WEEK: DayOfWeekName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export interface DayHours {
  dayOfWeek: DayOfWeekName
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
}

export interface BusinessHours {
  slotDurationMinutes: number
  days: DayHours[]
}

export async function getBusinessHours(): Promise<BusinessHours> {
  const { data } = await api.get<BusinessHours>('/tenant/business-hours')
  return data
}

export async function updateBusinessHours(input: BusinessHours): Promise<void> {
  await api.put('/tenant/business-hours', input)
}
