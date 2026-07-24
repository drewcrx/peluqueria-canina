import axios from 'axios'
import { API_BASE_URL } from '../../lib/apiBaseUrl'

export interface PetCardVisit {
  date: string
  serviceNames: string[]
}

export interface PetCard {
  petId: string
  petName: string
  breedName: string
  sex: 'Male' | 'Female'
  ageYears: number | null
  weightKg: number | null
  color: string | null
  photoUrl: string | null
  vaccines: string | null
  diseases: string | null
  medications: string | null
  allergies: string | null
  ownerFullName: string
  ownerPhone: string
  tenantName: string
  tenantLogoUrl: string | null
  tenantBrandColor: string | null
  recentVisits: PetCardVisit[]
}

// Cliente propio: la tarjeta se sirve de forma 100% anónima (alguien escaneando el QR), sin
// sesión que renovar, igual que el formulario público de intake.
const publicApi = axios.create({ baseURL: API_BASE_URL })

export async function getPetCard(petId: string): Promise<PetCard> {
  const { data } = await publicApi.get<PetCard>(`/public/pets/${petId}`)
  return data
}
