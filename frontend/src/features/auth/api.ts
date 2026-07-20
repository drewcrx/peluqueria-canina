import { api } from '../../lib/api'
import type { AuthUser } from './types'
import type { LoginFormValues, RegisterFormValues } from './schemas'

export async function login(values: LoginFormValues): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/auth/login', values)
  return data
}

export async function registerTenant(values: RegisterFormValues): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/auth/register', {
    companyName: values.companyName,
    ownerFullName: values.ownerFullName,
    ownerEmail: values.ownerEmail,
    ownerPassword: values.ownerPassword,
  })
  return data
}
