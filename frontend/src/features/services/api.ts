import { api } from '../../lib/api'

export interface ServiceItem {
  id: string
  name: string
  isActive: boolean
}

export async function listServices(): Promise<ServiceItem[]> {
  const { data } = await api.get<ServiceItem[]>('/services')
  return data
}

export async function createService(name: string): Promise<string> {
  const { data } = await api.post<string>('/services', { name })
  return data
}

export async function updateService(id: string, name: string, isActive: boolean): Promise<void> {
  await api.put(`/services/${id}`, { name, isActive })
}
