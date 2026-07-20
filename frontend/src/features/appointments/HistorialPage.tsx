import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TenantShell } from '../../components/layout/TenantShell'
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Historial</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Todas las visitas completadas.</p>
      </div>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {appointments && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <ClipboardList className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
          <p className="text-slate-500 dark:text-slate-400">Todavía no hay visitas completadas.</p>
        </div>
      )}

      {appointments && appointments.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Mascota</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Servicios</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {appt.scheduledAt ? formatDate(appt.scheduledAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/mascotas/${appt.petId}`} className="font-medium text-indigo-600 hover:underline">
                      {appt.petName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{appt.clientFullName}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{appt.serviceNames.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TenantShell>
  )
}
