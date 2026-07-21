import { api } from '../../lib/api'

export interface ApiKeyStatus {
  hasActiveKey: boolean
  maskedPreview: string | null
  createdAt: string | null
  lastUsedAt: string | null
}

export async function getApiKeyStatus(): Promise<ApiKeyStatus> {
  const { data } = await api.get<ApiKeyStatus>('/api-keys/status')
  return data
}

export async function generateApiKey(): Promise<string> {
  const { data } = await api.post<string>('/api-keys/generate')
  return data
}
