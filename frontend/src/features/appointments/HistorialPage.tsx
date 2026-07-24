import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TenantShell } from '../../components/layout/TenantShell'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { tableWrapClass, tdClass, thClass, trHoverClass } from '../../components/ui/styles'
import { listAppointments } from './api'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export function HistorialPage() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'Completed'],
    queryFn: () => listAppointments('Completed'),
  })

  return (
    <TenantShell>
      <PageHeader title="Historial" subtitle="Todas las visitas completadas." />

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {appointments && appointments.length === 0 && (
        <EmptyState icon={ClipboardList} title="Todavía no hay visitas completadas." />
      )}

      {appointments && appointments.length > 0 && (
        <div className={`overflow-x-auto ${tableWrapClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand-dark/60">
              <tr>
                <th className={thClass}>Fecha</th>
                <th className={thClass}>Mascota</th>
                <th className={thClass}>Cliente</th>
                <th className={thClass}>Servicios</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className={trHoverClass}>
                  <td className={tdClass}>{appt.scheduledAt ? formatDate(appt.scheduledAt) : '—'}</td>
                  <td className={tdClass}>
                    <Link to={`/mascotas/${appt.petId}`} className="font-medium text-clay-dark hover:underline">
                      {appt.petName}
                    </Link>
                  </td>
                  <td className={tdClass}>{appt.clientFullName}</td>
                  <td className={tdClass}>{appt.serviceNames.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TenantShell>
  )
}
