import { api } from '../../lib/api'

export interface CashTransaction {
  id: string
  type: 'Income' | 'Expense'
  amount: number
  description: string | null
  createdAt: string
}

export interface CurrentCashSession {
  id: string
  openedAt: string
  openingAmount: number
  openedByName: string
  totalIncome: number
  totalExpense: number
  expectedAmount: number
  transactions: CashTransaction[]
}

export interface CashSessionSummary {
  id: string
  openedAt: string
  closedAt: string | null
  openingAmount: number
  closingAmount: number | null
  difference: number | null
  openedByName: string
}

export interface CloseCashSessionResult {
  expectedAmount: number
  closingAmount: number
  difference: number
}

export async function getCurrentSession(): Promise<CurrentCashSession | null> {
  const { data } = await api.get<CurrentCashSession | null>('/cash-register/current')
  return data
}

export async function listSessions(): Promise<CashSessionSummary[]> {
  const { data } = await api.get<CashSessionSummary[]>('/cash-register/sessions')
  return data
}

export async function openSession(openingAmount: number): Promise<string> {
  const { data } = await api.post<string>('/cash-register/open', { openingAmount })
  return data
}

export async function addTransaction(type: 'Income' | 'Expense', amount: number, description?: string): Promise<void> {
  await api.post('/cash-register/transactions', { type, amount, description })
}

export async function closeSession(closingAmount: number): Promise<CloseCashSessionResult> {
  const { data } = await api.post<CloseCashSessionResult>('/cash-register/close', { closingAmount })
  return data
}
