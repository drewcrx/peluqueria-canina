import { api } from '../../lib/api'

export interface HistoryEntry {
  id: string
  scheduledAt: string | null
  status: string
  notes: string | null
  completedAt: string | null
  serviceNames: string[]
}

export interface PetHistory {
  petId: string
  petName: string
  breedName: string
  sex: 'Male' | 'Female'
  ageYears: number | null
  weightKg: number | null
  vaccines: string | null
  diseases: string | null
  medications: string | null
  allergies: string | null
  clientFullName: string
  clientId: string
  appointments: HistoryEntry[]
}

export async function getPetHistory(petId: string): Promise<PetHistory> {
  const { data } = await api.get<PetHistory>(`/pets/${petId}/history`)
  return data
}
