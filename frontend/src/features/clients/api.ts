import { api } from '../../lib/api'

export interface ClientSummary {
  id: string
  fullName: string
  phone: string
  email: string | null
  petCount: number
  createdAt: string
}

export interface PetSummary {
  id: string
  name: string
  breedName: string
  sex: 'Male' | 'Female'
  ageYears: number | null
}

export interface ClientDetail {
  id: string
  fullName: string
  phone: string
  email: string | null
  address: string | null
  createdAt: string
  pets: PetSummary[]
}

export interface CreateClientInput {
  fullName: string
  phone: string
  email?: string
  address?: string
}

export interface CreatePetInput {
  name: string
  breedId: string
  sex: 'Male' | 'Female'
  ageYears?: number
  weightKg?: number
  color?: string
  photo?: File | null
  vaccines?: string
  diseases?: string
  medications?: string
  allergies?: string
}

export async function listClients(): Promise<ClientSummary[]> {
  const { data } = await api.get<ClientSummary[]>('/clients')
  return data
}

export async function getClientDetail(clientId: string): Promise<ClientDetail> {
  const { data } = await api.get<ClientDetail>(`/clients/${clientId}`)
  return data
}

export async function createClient(input: CreateClientInput): Promise<string> {
  const { data } = await api.post<string>('/clients', input)
  return data
}

export async function createPet(clientId: string, input: CreatePetInput): Promise<string> {
  const form = new FormData()
  form.append('Name', input.name)
  form.append('BreedId', input.breedId)
  form.append('Sex', input.sex)
  if (input.ageYears != null) form.append('AgeYears', String(input.ageYears))
  if (input.weightKg != null) form.append('WeightKg', String(input.weightKg))
  if (input.color) form.append('Color', input.color)
  if (input.photo) form.append('Photo', input.photo)
  if (input.vaccines) form.append('Vaccines', input.vaccines)
  if (input.diseases) form.append('Diseases', input.diseases)
  if (input.medications) form.append('Medications', input.medications)
  if (input.allergies) form.append('Allergies', input.allergies)

  const { data } = await api.post<string>(`/clients/${clientId}/pets`, form)
  return data
}
