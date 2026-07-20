import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, PawPrint, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { TenantShell } from '../../components/layout/TenantShell'
import { listBreeds } from '../breeds/api'
import { createPet, getClientDetail } from './api'

const petSchema = z.object({
  name: z.string().min(1, 'Ingresa el nombre'),
  breedId: z.string().min(1, 'Selecciona una raza'),
  sex: z.enum(['Male', 'Female']),
  ageYears: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  weightKg: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
})

type PetFormValues = z.infer<typeof petSchema>

const SEX_LABEL: Record<string, string> = { Male: 'Macho', Female: 'Hembra' }

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClientDetail(clientId!),
    enabled: Boolean(clientId),
  })

  const { data: breeds } = useQuery({ queryKey: ['breeds'], queryFn: listBreeds })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(petSchema) })

  const mutation = useMutation({
    mutationFn: (values: PetFormValues) => createPet(clientId!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setModalOpen(false)
      reset()
    },
  })

  return (
    <TenantShell>
      <Link to="/clientes" className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {client && (
        <>
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{client.fullName}</h1>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span>{client.phone}</span>
              {client.email && <span>{client.email}</span>}
              {client.address && <span>{client.address}</span>}
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-slate-900 dark:text-slate-50">Mascotas</h2>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Agregar mascota
            </button>
          </div>

          {client.pets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
              <PawPrint className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
              <p className="text-slate-500 dark:text-slate-400">Este cliente todavía no tiene mascotas registradas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {client.pets.map((pet) => (
                <Link
                  key={pet.id}
                  to={`/mascotas/${pet.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-50">{pet.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {pet.breedName} · {SEX_LABEL[pet.sex]}
                    {pet.ageYears != null && ` · ${pet.ageYears} años`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar mascota">
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-3">
          <div>
            <input placeholder="Nombre de la mascota" {...register('name')} className={inputClass} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <select {...register('breedId')} className={inputClass}>
              <option value="">Selecciona una raza</option>
              {breeds?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.breedId && <p className="mt-1 text-xs text-red-500">{errors.breedId.message}</p>}
          </div>
          <select {...register('sex')} className={inputClass} defaultValue="Male">
            <option value="Male">Macho</option>
            <option value="Female">Hembra</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Edad (años)" {...register('ageYears')} className={inputClass} />
            <input type="number" step="0.1" placeholder="Peso (kg)" {...register('weightKg')} className={inputClass} />
          </div>

          {mutation.isError && <p className="text-sm text-red-500">No se pudo agregar la mascota.</p>}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar mascota'}
          </button>
        </form>
      </Modal>
    </TenantShell>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500'
