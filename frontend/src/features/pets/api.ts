import { api } from '../../lib/api'

export interface HistoryEntry {
  id: string
  scheduledAt: string | null
  status: string
  notes: string | null
  completedAt: string | null
  serviceNames: string[]
  photoUrls: string[]
}

export interface PetHistory {
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
  clientFullName: string
  clientId: string
  appointments: HistoryEntry[]
}

export interface PetListItem {
  id: string
  name: string
  breedName: string
  sex: 'Male' | 'Female'
  ageYears: number | null
  photoUrl: string | null
  clientId: string
  clientFullName: string
}

export async function listPets(): Promise<PetListItem[]> {
  const { data } = await api.get<PetListItem[]>('/pets')
  return data
}

export async function getPetHistory(petId: string): Promise<PetHistory> {
  const { data } = await api.get<PetHistory>(`/pets/${petId}/history`)
  return data
}

export async function uploadAppointmentPhoto(appointmentId: string, photo: File): Promise<string> {
  const form = new FormData()
  form.append('Photo', photo)
  const { data } = await api.post<string>(`/appointments/${appointmentId}/photos`, form)
  return data
}

export async function updatePetPhoto(petId: string, photo: File): Promise<string> {
  const form = new FormData()
  form.append('Photo', photo)
  const { data } = await api.post<string>(`/pets/${petId}/photo`, form)
  return data
}
