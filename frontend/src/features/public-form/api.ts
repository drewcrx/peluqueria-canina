import axios from 'axios'
import { API_BASE_URL } from '../../lib/apiBaseUrl'

export interface PublicBreed {
  id: string
  name: string
}

export interface PublicService {
  id: string
  name: string
}

export interface PublicTenantInfo {
  tenantId: string
  tenantName: string
  breeds: PublicBreed[]
  services: PublicService[]
  logoUrl: string | null
  brandColor: string | null
}

// Cliente propio (no el `api` compartido con withCredentials/refresh): este flujo es 100%
// anónimo, sin sesión que renovar.
const publicApi = axios.create({ baseURL: API_BASE_URL })

export async function getPublicTenantInfo(slug: string): Promise<PublicTenantInfo> {
  const { data } = await publicApi.get<PublicTenantInfo>(`/public/tenants/${slug}`)
  return data
}

export interface AvailableSlots {
  slotDurationMinutes: number
  slots: string[]
}

export async function getAvailableSlots(slug: string, date: string): Promise<AvailableSlots> {
  const { data } = await publicApi.get<AvailableSlots>(`/public/tenants/${slug}/availability`, { params: { date } })
  return data
}

export interface SubmitIntakeInput {
  clientFullName: string
  clientPhone: string
  clientEmail?: string
  clientAddress?: string
  petName: string
  breedId: string
  petSex: 'Male' | 'Female'
  petAgeYears?: number
  petWeightKg?: number
  petColor?: string
  petPhoto?: File | null
  vaccines?: string
  diseases?: string
  medications?: string
  allergies?: string
  observations?: string
  requestedAt?: string
  requestedServiceIds: string[]
  photos: File[]
  signature: File | null
}

export async function submitIntake(slug: string, input: SubmitIntakeInput) {
  const form = new FormData()
  form.append('ClientFullName', input.clientFullName)
  form.append('ClientPhone', input.clientPhone)
  if (input.clientEmail) form.append('ClientEmail', input.clientEmail)
  if (input.clientAddress) form.append('ClientAddress', input.clientAddress)
  form.append('PetName', input.petName)
  form.append('BreedId', input.breedId)
  form.append('PetSex', input.petSex)
  if (input.petAgeYears != null) form.append('PetAgeYears', String(input.petAgeYears))
  if (input.petWeightKg != null) form.append('PetWeightKg', String(input.petWeightKg))
  if (input.petColor) form.append('PetColor', input.petColor)
  if (input.petPhoto) form.append('PetPhoto', input.petPhoto)
  if (input.vaccines) form.append('Vaccines', input.vaccines)
  if (input.diseases) form.append('Diseases', input.diseases)
  if (input.medications) form.append('Medications', input.medications)
  if (input.allergies) form.append('Allergies', input.allergies)
  if (input.observations) form.append('Observations', input.observations)
  if (input.requestedAt) form.append('RequestedAt', input.requestedAt)
  input.requestedServiceIds.forEach((id) => form.append('RequestedServiceIds', id))
  input.photos.forEach((photo) => form.append('Photos', photo))
  if (input.signature) form.append('Signature', input.signature)

  const { data } = await publicApi.post(`/public/tenants/${slug}/submit`, form)
  return data as { clientId: string; petId: string; clientFullName: string; petName: string; scheduledAt: string | null }
}
