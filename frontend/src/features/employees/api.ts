import { api } from '../../lib/api'

export interface Employee {
  id: string
  fullName: string
  email: string
  isActive: boolean
  roles: string[]
}

export interface CreateEmployeeResult {
  userId: string
  temporaryPassword: string
}

export async function listEmployees(): Promise<Employee[]> {
  const { data } = await api.get<Employee[]>('/employees')
  return data
}

export async function createEmployee(fullName: string, email: string): Promise<CreateEmployeeResult> {
  const { data } = await api.post<CreateEmployeeResult>('/employees', { fullName, email })
  return data
}

export async function setEmployeeActive(employeeId: string, isActive: boolean): Promise<void> {
  await api.put(`/employees/${employeeId}/status`, { isActive })
}
