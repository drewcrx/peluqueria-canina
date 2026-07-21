import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Scissors } from 'lucide-react'
import { useState } from 'react'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
import { getErrorMessage } from '../../lib/getErrorMessage'
import { createService, listServices, updateService, type ServiceItem } from './api'

export function ServicesPage() {
  const [newName, setNewName] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: services, isLoading } = useQuery({ queryKey: ['services'], queryFn: listServices })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['services'] })

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      setNewName('')
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo crear el servicio.')),
  })

  const toggleMutation = useMutation({
    mutationFn: (service: ServiceItem) => updateService(service.id, service.name, !service.isActive),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo actualizar el servicio.')),
  })

  return (
    <TenantShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Servicios</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Los clientes eligen entre estos servicios al llenar tu formulario público.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (newName.trim()) createMutation.mutate(newName.trim())
        }}
        className="mb-6 flex gap-2"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del nuevo servicio"
          className="flex-1 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Agregar
        </button>
      </form>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {services && services.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <Scissors className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
          <p className="text-slate-500 dark:text-slate-400">Todavía no tienes servicios configurados.</p>
        </div>
      )}

      {services && services.length > 0 && (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between px-4 py-3">
              <span className={service.isActive ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 line-through dark:text-slate-600'}>
                {service.name}
              </span>
              <button
                onClick={() => toggleMutation.mutate(service)}
                disabled={toggleMutation.isPending}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  service.isActive
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {service.isActive ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          ))}
        </div>
      )}
    </TenantShell>
  )
}
