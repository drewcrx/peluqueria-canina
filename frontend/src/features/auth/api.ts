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

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/auth/change-password', { currentPassword, newPassword })
}

export interface ForgotPasswordResult {
  sent: boolean
  resetToken: string | null
  resetUrl: string | null
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  const { data } = await api.post<ForgotPasswordResult>('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(email: string, token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { email, token, newPassword })
}
