import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BellRing, Calendar, Check, Clock, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../../components/Modal'
import { TenantShell } from '../../components/layout/TenantShell'
import { getMyTenant } from '../tenant/api'
import { changeAppointmentStatus, listAppointments, scheduleAppointment, sendAppointmentReminder, type AppointmentSummary } from './api'

function formatDay(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso))
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

export function AgendaPage() {
  const queryClient = useQueryClient()
  const { data: appointments, isLoading } = useQuery({ queryKey: ['appointments'], queryFn: () => listAppointments() })
  const { data: tenant } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant, staleTime: 60_000 })
  const canRemind = tenant?.features.includes('Reminders') ?? false
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [dateTimeValue, setDateTimeValue] = useState('')

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['appointments'] })

  const scheduleMutation = useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) => scheduleAppointment(id, scheduledAt),
    onSuccess: () => {
      setSchedulingId(null)
      invalidate()
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'Complete' | 'Cancel' }) => changeAppointmentStatus(id, action),
    onSuccess: invalidate,
  })

  const reminderMutation = useMutation({
    mutationFn: (id: string) => sendAppointmentReminder(id),
    onSuccess: invalidate,
  })

  const pending = appointments?.filter((a) => a.status === 'PendingSchedule') ?? []
  const upcoming = (appointments ?? [])
    .filter((a) => a.status === 'Scheduled')
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())

  const upcomingByDay = upcoming.reduce<Record<string, AppointmentSummary[]>>((acc, appt) => {
    const dayKey = new Date(appt.scheduledAt!).toDateString()
    ;(acc[dayKey] ??= []).push(appt)
    return acc
  }, {})

  return (
    <TenantShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Agenda</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Citas por confirmar y próximas visitas.</p>
      </div>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" /> Por agendar ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((appt) => (
              <motion.div
                key={appt.id}
                layout
                className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40"
              >
                <div>
                  <Link to={`/mascotas/${appt.petId}`} className="font-medium text-slate-800 hover:underline dark:text-slate-100">
                    {appt.petName}
                  </Link>
                  <span className="text-slate-500 dark:text-slate-400"> · {appt.clientFullName}</span>
                  {appt.serviceNames.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{appt.serviceNames.join(', ')}</p>
                  )}
                </div>
                <button
                  onClick={() => setSchedulingId(appt.id)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Confirmar fecha
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Calendar className="h-4 w-4" /> Próximas citas
        </h2>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
            <Calendar className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
            <p className="text-slate-500 dark:text-slate-400">No tienes citas agendadas todavía.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(upcomingByDay).map(([day, appts]) => (
              <div key={day}>
                <p className="mb-2 text-sm font-medium capitalize text-slate-600 dark:text-slate-300">{formatDay(appts[0].scheduledAt!)}</p>
                <div className="space-y-2">
                  {appts.map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-14 shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {formatTime(appt.scheduledAt!)}
                        </span>
                        <div>
                          <Link to={`/mascotas/${appt.petId}`} className="font-medium text-slate-800 hover:underline dark:text-slate-100">
                            {appt.petName}
                          </Link>
                          <span className="text-slate-500 dark:text-slate-400"> · {appt.clientFullName}</span>
                          {appt.serviceNames.length > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{appt.serviceNames.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {canRemind && (
                          <button
                            onClick={() => reminderMutation.mutate(appt.id)}
                            disabled={reminderMutation.isPending}
                            title={appt.reminderSentAt ? `Recordatorio enviado ${formatTime(appt.reminderSentAt)}` : 'Enviar recordatorio'}
                            className={`rounded-lg p-1.5 disabled:opacity-50 ${
                              appt.reminderSentAt
                                ? 'text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800'
                            }`}
                          >
                            <BellRing className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => statusMutation.mutate({ id: appt.id, action: 'Complete' })}
                          title="Marcar como completada"
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: appt.id, action: 'Cancel' })}
                          title="Cancelar"
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={schedulingId !== null} onClose={() => setSchedulingId(null)} title="Confirmar fecha de la cita">
        <div className="space-y-3">
          <input
            type="datetime-local"
            value={dateTimeValue}
            onChange={(e) => setDateTimeValue(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            disabled={!dateTimeValue || scheduleMutation.isPending}
            onClick={() =>
              schedulingId && scheduleMutation.mutate({ id: schedulingId, scheduledAt: new Date(dateTimeValue).toISOString() })
            }
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {scheduleMutation.isPending ? 'Guardando…' : 'Confirmar'}
          </button>
        </div>
      </Modal>
    </TenantShell>
  )
}
