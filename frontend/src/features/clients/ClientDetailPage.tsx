import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Camera, PawPrint, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { TenantShell } from '../../components/layout/TenantShell'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { cardClass, inputClass } from '../../components/ui/styles'
import { listBreeds } from '../breeds/api'
import { createPet, getClientDetail } from './api'

const petSchema = z.object({
  name: z.string().min(1, 'Ingresa el nombre'),
  breedId: z.string().min(1, 'Selecciona una raza'),
  sex: z.enum(['Male', 'Female']),
  ageYears: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  weightKg: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  color: z.string().optional(),
})

type PetFormValues = z.infer<typeof petSchema>

const SEX_LABEL: Record<string, string> = { Male: 'Macho', Female: 'Hembra' }

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const [modalOpen, setModalOpen] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
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
    mutationFn: (values: PetFormValues) => createPet(clientId!, { ...values, photo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setModalOpen(false)
      setPhoto(null)
      reset()
    },
  })

  return (
    <TenantShell>
      <Link to="/clientes" className="mb-4 flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {client && (
        <>
          <div className={`mb-6 p-6 ${cardClass}`}>
            <h1 className="font-display text-xl font-semibold text-ink">{client.fullName}</h1>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
              <span>{client.phone}</span>
              {client.email && <span>{client.email}</span>}
              {client.address && <span>{client.address}</span>}
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-medium text-ink">Mascotas</h2>
            <Button variant="accent" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Agregar mascota
            </Button>
          </div>

          {client.pets.length === 0 ? (
            <EmptyState icon={PawPrint} title="Este cliente todavía no tiene mascotas registradas." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {client.pets.map((pet) => (
                <Link
                  key={pet.id}
                  to={`/mascotas/${pet.id}`}
                  className={`p-4 transition-colors hover:border-clay/50 ${cardClass}`}
                >
                  <p className="font-medium text-ink">{pet.name}</p>
                  <p className="text-sm text-ink-soft">
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
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
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
            {errors.breedId && <p className="mt-1 text-xs text-red-600">{errors.breedId.message}</p>}
          </div>
          <select {...register('sex')} className={inputClass} defaultValue="Male">
            <option value="Male">Macho</option>
            <option value="Female">Hembra</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Edad (años)" {...register('ageYears')} className={inputClass} />
            <input type="number" step="0.1" placeholder="Peso (kg)" {...register('weightKg')} className={inputClass} />
          </div>
          <input placeholder="Color" {...register('color')} className={inputClass} />

          <div>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <Camera className="h-4 w-4" strokeWidth={2} />
              Foto de la mascota (opcional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-clay/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-clay-dark"
            />
          </div>

          {mutation.isError && <p className="text-sm text-red-600">No se pudo agregar la mascota.</p>}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Guardando…' : 'Guardar mascota'}
          </Button>
        </form>
      </Modal>
    </TenantShell>
  )
}
