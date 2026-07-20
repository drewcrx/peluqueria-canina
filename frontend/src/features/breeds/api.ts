import { api } from '../../lib/api'

export interface Breed {
  id: string
  name: string
}

export async function listBreeds(): Promise<Breed[]> {
  const { data } = await api.get<Breed[]>('/breeds')
  return data
}
