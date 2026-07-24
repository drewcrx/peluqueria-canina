import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { TenantShell } from '../../components/layout/TenantShell'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { inputClass, tableWrapClass, tdClass, thClass, trHoverClass } from '../../components/ui/styles'
import { createClient, listClients } from './api'

const clientSchema = z.object({
  fullName: z.string().min(2, 'Ingresa el nombre completo'),
  phone: z.string().min(7, 'Ingresa un teléfono válido'),
  email: z.union([z.string().email('Correo inválido'), z.literal('')]).optional(),
  address: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

export function ClientsListPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: clients, isLoading } = useQuery({ queryKey: ['clients'], queryFn: listClients })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({ resolver: zodResolver(clientSchema) })

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setModalOpen(false)
      reset()
    },
  })

  return (
    <TenantShell>
      <PageHeader
        title="Clientes"
        subtitle="Se crean automáticamente desde el formulario público, o puedes agregarlos aquí."
        actions={
          <Button variant="accent" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Agregar cliente
          </Button>
        }
      />

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {clients && clients.length === 0 && (
        <EmptyState
          icon={Users}
          title="Todavía no tienes clientes registrados."
          description="Se crean solos cuando alguien llena tu formulario público, o agrégalos aquí a mano."
          action={
            <Link to="/dashboard" className="text-sm font-medium text-clay-dark hover:underline">
              Ir a compartir mi formulario público →
            </Link>
          }
        />
      )}

      {clients && clients.length > 0 && (
        <div className={`overflow-x-auto ${tableWrapClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand-dark/60">
              <tr>
                <th className={thClass}>Nombre</th>
                <th className={thClass}>Teléfono</th>
                <th className={thClass}>Correo</th>
                <th className={thClass}>Mascotas</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className={trHoverClass}>
                  <td className={tdClass}>
                    <Link to={`/clientes/${client.id}`} className="font-medium text-clay-dark hover:underline">
                      {client.fullName}
                    </Link>
                  </td>
                  <td className={tdClass}>{client.phone}</td>
                  <td className={tdClass}>{client.email ?? '—'}</td>
                  <td className={tdClass}>{client.petCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar cliente">
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-3">
          <div>
            <input placeholder="Nombre completo" {...register('fullName')} className={inputClass} />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
          </div>
          <div>
            <input placeholder="Teléfono" {...register('phone')} className={inputClass} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>
          <div>
            <input placeholder="Correo (opcional)" {...register('email')} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <input placeholder="Dirección (opcional)" {...register('address')} className={inputClass} />

          {mutation.isError && (
            <p className="text-sm text-red-600">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'No se pudo crear el cliente.'}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Guardando…' : 'Guardar cliente'}
          </Button>
        </form>
      </Modal>
    </TenantShell>
  )
}
