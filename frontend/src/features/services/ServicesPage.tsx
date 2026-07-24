import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Scissors } from 'lucide-react'
import { useState } from 'react'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { cardClass, inputClass } from '../../components/ui/styles'
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
      <PageHeader
        title="Servicios"
        subtitle="Los clientes eligen entre estos servicios al llenar tu formulario público."
      />

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
          className={`flex-1 ${inputClass}`}
        />
        <Button type="submit" variant="accent" disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Agregar
        </Button>
      </form>

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {services && services.length === 0 && (
        <EmptyState icon={Scissors} title="Todavía no tienes servicios configurados." />
      )}

      {services && services.length > 0 && (
        <div className={`divide-y divide-sand-dark/50 ${cardClass}`}>
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between px-4 py-3">
              <span className={service.isActive ? 'text-ink' : 'text-ink-soft/50 line-through'}>
                {service.name}
              </span>
              <button
                onClick={() => toggleMutation.mutate(service)}
                disabled={toggleMutation.isPending}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  service.isActive
                    ? 'bg-sage-light text-sage-dark hover:bg-sage-light/70'
                    : 'bg-sand text-ink-soft hover:bg-sand-dark/60'
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
