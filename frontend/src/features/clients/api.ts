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
  const { data } = await api.post<string>(`/clients/${clientId}/pets`, input)
  return data
}
