import { api } from '../../lib/api'

export type AppointmentStatus = 'PendingSchedule' | 'Scheduled' | 'Completed' | 'Cancelled'

export interface AppointmentSummary {
  id: string
  clientId: string
  clientFullName: string
  petId: string
  petName: string
  scheduledAt: string | null
  status: AppointmentStatus
  notes: string | null
  reminderSentAt: string | null
  serviceNames: string[]
}

export async function listAppointments(status?: AppointmentStatus): Promise<AppointmentSummary[]> {
  const { data } = await api.get<AppointmentSummary[]>('/appointments', { params: status ? { status } : undefined })
  return data
}

export async function createAppointment(input: {
  clientId: string
  petId: string
  scheduledAt?: string
  notes?: string
  serviceIds: string[]
}): Promise<string> {
  const { data } = await api.post<string>('/appointments', input)
  return data
}

export async function scheduleAppointment(appointmentId: string, scheduledAt: string): Promise<void> {
  await api.put(`/appointments/${appointmentId}/schedule`, { scheduledAt })
}

export async function changeAppointmentStatus(appointmentId: string, action: 'Complete' | 'Cancel'): Promise<void> {
  await api.put(`/appointments/${appointmentId}/status`, { action })
}

export async function sendAppointmentReminder(appointmentId: string): Promise<void> {
  await api.post(`/appointments/${appointmentId}/reminder`)
}
