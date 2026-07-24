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
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { cardClass, inputClass, tableWrapClass, tdClass, thClass, trHoverClass } from '../../components/ui/styles'
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
      <PageHeader title="Caja" subtitle="Control de efectivo del día." />

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {isError && <PlanUpgradePrompt feature="Caja" />}

      {!isLoading && !isError && !session && (
        <div className={`p-6 ${cardClass}`}>
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-clay-dark" />
            <h2 className="font-display font-medium text-ink">No hay una caja abierta</h2>
          </div>
          <form onSubmit={openForm.handleSubmit((v) => openMutation.mutate(v))} className="flex max-w-sm gap-2">
            <input type="number" step="0.01" placeholder="Monto inicial" {...openForm.register('openingAmount')} className={inputClass} />
            <Button type="submit" variant="accent" disabled={openMutation.isPending} className="shrink-0">
              Abrir caja
            </Button>
          </form>
        </div>
      )}

      {session && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Apertura" value={money(session.openingAmount)} />
            <StatCard label="Ingresos" value={money(session.totalIncome)} tone="text-sage-dark" />
            <StatCard label="Egresos" value={money(session.totalExpense)} tone="text-red-600" />
            <StatCard label="Esperado en caja" value={money(session.expectedAmount)} tone="font-semibold" />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className={`lg:col-span-2 p-5 ${cardClass}`}>
              <h2 className="mb-3 font-display font-medium text-ink">Registrar movimiento</h2>
              <form onSubmit={txForm.handleSubmit((v) => txMutation.mutate(v))} className="space-y-3">
                <select {...txForm.register('type')} className={inputClass}>
                  <option value="Income">Ingreso</option>
                  <option value="Expense">Egreso</option>
                </select>
                <input type="number" step="0.01" placeholder="Monto" {...txForm.register('amount')} className={inputClass} />
                <input placeholder="Descripción (opcional)" {...txForm.register('description')} className={inputClass} />
                {txMutation.isError && <p className="text-sm text-red-600">No se pudo registrar el movimiento.</p>}
                <Button type="submit" disabled={txMutation.isPending} className="w-full">
                  Registrar
                </Button>
              </form>

              <button
                onClick={() => setCloseOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border border-sand-dark bg-white/60 py-2 text-sm font-medium text-ink-soft hover:bg-sand/40"
              >
                <Lock className="h-4 w-4" /> Cerrar caja
              </button>
            </div>

            <div className={`lg:col-span-3 p-5 ${cardClass}`}>
              <h2 className="mb-3 font-display font-medium text-ink">Movimientos de hoy</h2>
              {session.transactions.length === 0 ? (
                <p className="text-sm text-ink-soft">Sin movimientos todavía.</p>
              ) : (
                <div className="space-y-2">
                  {session.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border-b border-sand-dark/50 pb-2 text-sm last:border-0">
                      <div className="flex items-center gap-2">
                        {t.type === 'Income' ? (
                          <ArrowUpCircle className="h-4 w-4 text-sage-dark" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-ink">{t.description || (t.type === 'Income' ? 'Ingreso' : 'Egreso')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={t.type === 'Income' ? 'text-sage-dark' : 'text-red-600'}>
                          {t.type === 'Income' ? '+' : '-'}{money(t.amount)}
                        </span>
                        <span className="text-xs text-ink-soft">{formatDate(t.createdAt)}</span>
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
          <h2 className="mb-3 font-display font-medium text-ink">Cajas anteriores</h2>
          <div className={`overflow-x-auto ${tableWrapClass}`}>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sand-dark/60">
                <tr>
                  <th className={thClass}>Cerrada</th>
                  <th className={thClass}>Apertura</th>
                  <th className={thClass}>Cierre</th>
                  <th className={thClass}>Diferencia</th>
                  <th className={thClass}>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <tr key={s.id} className={trHoverClass}>
                    <td className={tdClass}>{s.closedAt ? formatDate(s.closedAt) : '—'}</td>
                    <td className={tdClass}>{money(s.openingAmount)}</td>
                    <td className={tdClass}>{s.closingAmount != null ? money(s.closingAmount) : '—'}</td>
                    <td className={`${tdClass} ${s.difference && s.difference !== 0 ? 'text-clay-dark' : ''}`}>
                      {s.difference != null ? money(s.difference) : '—'}
                    </td>
                    <td className={tdClass}>{s.openedByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={closeOpen} onClose={() => setCloseOpen(false)} title="Cerrar caja">
        <form onSubmit={closeForm.handleSubmit((v) => closeMutation.mutate(v))} className="space-y-3">
          <p className="text-sm text-ink-soft">
            Monto esperado en caja: <strong className="text-ink">{session ? money(session.expectedAmount) : '—'}</strong>. Cuenta el
            efectivo real e ingrésalo aquí.
          </p>
          <input type="number" step="0.01" placeholder="Monto contado" {...closeForm.register('closingAmount')} className={inputClass} />
          <Button type="submit" disabled={closeMutation.isPending} className="w-full">
            Confirmar cierre
          </Button>
        </form>
      </Modal>

      <Modal open={closeResult !== null} onClose={() => setCloseResult(null)} title="Caja cerrada">
        {closeResult && (
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-ink-soft">Esperado</span> <span className="text-ink">{money(closeResult.expectedAmount)}</span></p>
            <p className="flex justify-between"><span className="text-ink-soft">Contado</span> <span className="text-ink">{money(closeResult.closingAmount)}</span></p>
            <p className="flex justify-between font-medium">
              <span className="text-ink">Diferencia</span>
              <span className={closeResult.difference === 0 ? 'text-sage-dark' : 'text-clay-dark'}>
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
    <div className={`p-4 ${cardClass}`}>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className={`mt-1 text-lg text-ink ${tone ?? ''}`}>{value}</p>
    </div>
  )
}
