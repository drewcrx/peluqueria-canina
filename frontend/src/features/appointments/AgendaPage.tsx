import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BellRing, Calendar, Check, Clock, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../../components/Modal'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { cardClass, inputClass } from '../../components/ui/styles'
import { getErrorMessage } from '../../lib/getErrorMessage'
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
  const toast = useToast()
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
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo confirmar la fecha de la cita.')),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'Complete' | 'Cancel' }) => changeAppointmentStatus(id, action),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo actualizar la cita.')),
  })

  const reminderMutation = useMutation({
    mutationFn: (id: string) => sendAppointmentReminder(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo enviar el recordatorio.')),
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
      <PageHeader title="Agenda" subtitle="Citas por confirmar y próximas visitas." />

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-clay-dark">
            <Clock className="h-4 w-4" /> Por agendar ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((appt) => (
              <motion.div
                key={appt.id}
                layout
                className="flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3"
              >
                <div>
                  <Link to={`/mascotas/${appt.petId}`} className="font-medium text-ink hover:underline">
                    {appt.petName}
                  </Link>
                  <span className="text-ink-soft"> · {appt.clientFullName}</span>
                  {appt.serviceNames.length > 0 && (
                    <p className="text-xs text-ink-soft">{appt.serviceNames.join(', ')}</p>
                  )}
                </div>
                <button
                  onClick={() => setSchedulingId(appt.id)}
                  className="rounded-full bg-clay px-3 py-1.5 text-xs font-medium text-cream hover:bg-clay-dark"
                >
                  Confirmar fecha
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          <Calendar className="h-4 w-4" /> Próximas citas
        </h2>

        {upcoming.length === 0 ? (
          <EmptyState icon={Calendar} title="No tienes citas agendadas todavía." />
        ) : (
          <div className="space-y-6">
            {Object.entries(upcomingByDay).map(([day, appts]) => (
              <div key={day}>
                <p className="mb-2 text-sm font-medium capitalize text-ink">{formatDay(appts[0].scheduledAt!)}</p>
                <div className="space-y-2">
                  {appts.map((appt) => (
                    <div
                      key={appt.id}
                      className={`flex items-center justify-between px-4 py-3 ${cardClass}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-14 shrink-0 text-sm font-medium text-clay-dark">
                          {formatTime(appt.scheduledAt!)}
                        </span>
                        <div>
                          <Link to={`/mascotas/${appt.petId}`} className="font-medium text-ink hover:underline">
                            {appt.petName}
                          </Link>
                          <span className="text-ink-soft"> · {appt.clientFullName}</span>
                          {appt.serviceNames.length > 0 && (
                            <p className="text-xs text-ink-soft">{appt.serviceNames.join(', ')}</p>
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
                                ? 'text-clay-dark hover:bg-clay/10'
                                : 'text-ink-soft hover:bg-sand/60 hover:text-clay-dark'
                            }`}
                          >
                            <BellRing className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => statusMutation.mutate({ id: appt.id, action: 'Complete' })}
                          title="Marcar como completada"
                          className="rounded-lg p-1.5 text-sage-dark hover:bg-sage-light"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: appt.id, action: 'Cancel' })}
                          title="Cancelar"
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
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
            className={inputClass}
          />
          <Button
            disabled={!dateTimeValue || scheduleMutation.isPending}
            onClick={() =>
              schedulingId && scheduleMutation.mutate({ id: schedulingId, scheduledAt: new Date(dateTimeValue).toISOString() })
            }
            className="w-full"
          >
            {scheduleMutation.isPending ? 'Guardando…' : 'Confirmar'}
          </Button>
        </div>
      </Modal>
    </TenantShell>
  )
}
