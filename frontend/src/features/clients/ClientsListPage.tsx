import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { TenantShell } from '../../components/layout/TenantShell'
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Clientes</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Se crean automáticamente desde el formulario público, o puedes agregarlos aquí.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Agregar cliente
        </button>
      </div>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {clients && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <Users className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
          <p className="text-slate-500 dark:text-slate-400">Todavía no tienes clientes registrados.</p>
        </div>
      )}

      {clients && clients.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Mascotas</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3">
                    <Link to={`/clientes/${client.id}`} className="font-medium text-indigo-600 hover:underline">
                      {client.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{client.phone}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{client.email ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{client.petCount}</td>
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
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div>
            <input placeholder="Teléfono" {...register('phone')} className={inputClass} />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div>
            <input placeholder="Correo (opcional)" {...register('email')} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <input placeholder="Dirección (opcional)" {...register('address')} className={inputClass} />

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'No se pudo crear el cliente.'}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar cliente'}
          </button>
        </form>
      </Modal>
    </TenantShell>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500'
