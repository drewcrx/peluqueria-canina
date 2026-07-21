import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownCircle, ArrowUpCircle, Lock, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { PlanUpgradePrompt } from '../../components/PlanUpgradePrompt'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
import { getErrorMessage } from '../../lib/getErrorMessage'
import {
  addTransaction,
  closeSession,
  getCurrentSession,
  listSessions,
  openSession,
  type CloseCashSessionResult,
} from './api'

const openSchema = z.object({ openingAmount: z.coerce.number().min(0) })
const transactionSchema = z.object({
  type: z.enum(['Income', 'Expense']),
  amount: z.coerce.number().positive('Ingresa un monto válido'),
  description: z.string().optional(),
})
const closeSchema = z.object({ closingAmount: z.coerce.number().min(0) })

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

const money = (n: number) => `$${n.toFixed(2)}`

export function CashRegisterPage() {
  const [closeOpen, setCloseOpen] = useState(false)
  const [closeResult, setCloseResult] = useState<CloseCashSessionResult | null>(null)
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: session, isLoading, isError } = useQuery({ queryKey: ['cash-session'], queryFn: getCurrentSession, retry: false })
  const { data: history } = useQuery({ queryKey: ['cash-sessions'], queryFn: listSessions, enabled: !isError })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['cash-session'] })
    queryClient.invalidateQueries({ queryKey: ['cash-sessions'] })
  }

  const openForm = useForm({ resolver: zodResolver(openSchema) })
  const openMutation = useMutation({
    mutationFn: (values: { openingAmount: number }) => openSession(values.openingAmount),
    onSuccess: () => {
      openForm.reset()
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo abrir la caja.')),
  })

  const txForm = useForm({ resolver: zodResolver(transactionSchema), defaultValues: { type: 'Income' as const } })
  const txMutation = useMutation({
    mutationFn: (values: { type: 'Income' | 'Expense'; amount: number; description?: string }) =>
      addTransaction(values.type, values.amount, values.description),
    onSuccess: () => {
      txForm.reset({ type: 'Income' })
      invalidate()
    },
  })

  const closeForm = useForm({ resolver: zodResolver(closeSchema) })
  const closeMutation = useMutation({
    mutationFn: (values: { closingAmount: number }) => closeSession(values.closingAmount),
    onSuccess: (result) => {
      setCloseOpen(false)
      closeForm.reset()
      setCloseResult(result)
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo cerrar la caja.')),
  })

  return (
    <TenantShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Caja</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Control de efectivo del día.</p>
      </div>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {isError && <PlanUpgradePrompt feature="Caja" />}

      {!isLoading && !isError && !session && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-500" />
            <h2 className="font-medium text-slate-900 dark:text-slate-50">No hay una caja abierta</h2>
          </div>
          <form onSubmit={openForm.handleSubmit((v) => openMutation.mutate(v))} className="flex max-w-sm gap-2">
            <input type="number" step="0.01" placeholder="Monto inicial" {...openForm.register('openingAmount')} className={inputClass} />
            <button
              type="submit"
              disabled={openMutation.isPending}
              className="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Abrir caja
            </button>
          </form>
        </div>
      )}

      {session && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Apertura" value={money(session.openingAmount)} />
            <StatCard label="Ingresos" value={money(session.totalIncome)} tone="text-emerald-600 dark:text-emerald-400" />
            <StatCard label="Egresos" value={money(session.totalExpense)} tone="text-red-500" />
            <StatCard label="Esperado en caja" value={money(session.expectedAmount)} tone="font-semibold" />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 font-medium text-slate-900 dark:text-slate-50">Registrar movimiento</h2>
              <form onSubmit={txForm.handleSubmit((v) => txMutation.mutate(v))} className="space-y-3">
                <select {...txForm.register('type')} className={inputClass}>
                  <option value="Income">Ingreso</option>
                  <option value="Expense">Egreso</option>
                </select>
                <input type="number" step="0.01" placeholder="Monto" {...txForm.register('amount')} className={inputClass} />
                <input placeholder="Descripción (opcional)" {...txForm.register('description')} className={inputClass} />
                {txMutation.isError && <p className="text-sm text-red-500">No se pudo registrar el movimiento.</p>}
                <button
                  type="submit"
                  disabled={txMutation.isPending}
                  className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Registrar
                </button>
              </form>

              <button
                onClick={() => setCloseOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Lock className="h-4 w-4" /> Cerrar caja
              </button>
            </div>

            <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 font-medium text-slate-900 dark:text-slate-50">Movimientos de hoy</h2>
              {session.transactions.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-600">Sin movimientos todavía.</p>
              ) : (
                <div className="space-y-2">
                  {session.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {t.type === 'Income' ? (
                          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-slate-700 dark:text-slate-200">{t.description || (t.type === 'Income' ? 'Ingreso' : 'Egreso')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={t.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                          {t.type === 'Income' ? '+' : '-'}{money(t.amount)}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-600">{formatDate(t.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {history && history.length > 0 && (
        <div>
          <h2 className="mb-3 font-medium text-slate-900 dark:text-slate-50">Cajas anteriores</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Cerrada</th>
                  <th className="px-4 py-3 font-medium">Apertura</th>
                  <th className="px-4 py-3 font-medium">Cierre</th>
                  <th className="px-4 py-3 font-medium">Diferencia</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.closedAt ? formatDate(s.closedAt) : '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{money(s.openingAmount)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.closingAmount != null ? money(s.closingAmount) : '—'}</td>
                    <td className={`px-4 py-3 ${s.difference && s.difference !== 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {s.difference != null ? money(s.difference) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.openedByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={closeOpen} onClose={() => setCloseOpen(false)} title="Cerrar caja">
        <form onSubmit={closeForm.handleSubmit((v) => closeMutation.mutate(v))} className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monto esperado en caja: <strong>{session ? money(session.expectedAmount) : '—'}</strong>. Cuenta el efectivo real e
            ingrésalo aquí.
          </p>
          <input type="number" step="0.01" placeholder="Monto contado" {...closeForm.register('closingAmount')} className={inputClass} />
          <button
            type="submit"
            disabled={closeMutation.isPending}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Confirmar cierre
          </button>
        </form>
      </Modal>

      <Modal open={closeResult !== null} onClose={() => setCloseResult(null)} title="Caja cerrada">
        {closeResult && (
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Esperado</span> <span>{money(closeResult.expectedAmount)}</span></p>
            <p className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Contado</span> <span>{money(closeResult.closingAmount)}</span></p>
            <p className="flex justify-between font-medium">
              <span>Diferencia</span>
              <span className={closeResult.difference === 0 ? 'text-emerald-600' : 'text-amber-600'}>
                {closeResult.difference > 0 ? '+' : ''}{money(closeResult.difference)}
              </span>
            </p>
          </div>
        )}
      </Modal>
    </TenantShell>
  )
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-lg text-slate-900 dark:text-slate-50 ${tone ?? ''}`}>{value}</p>
    </div>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500'
