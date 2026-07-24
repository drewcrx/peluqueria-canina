import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Camera, ClipboardList, IdCard, Loader2, Shield } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
import { EmptyState } from '../../components/ui/EmptyState'
import { cardClass } from '../../components/ui/styles'
import { resolveUploadUrl } from '../../lib/apiBaseUrl'
import { getErrorMessage } from '../../lib/getErrorMessage'
import { getMyTenant } from '../tenant/api'
import { getPetHistory, updatePetPhoto, uploadAppointmentPhoto } from './api'

const SEX_LABEL: Record<string, string> = { Male: 'Macho', Female: 'Hembra' }

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PendingSchedule: { label: 'Por agendar', className: 'bg-gold/25 text-ink-soft' },
  Scheduled: { label: 'Agendada', className: 'bg-clay/15 text-clay-dark' },
  Completed: { label: 'Completada', className: 'bg-sage-light text-sage-dark' },
  Cancelled: { label: 'Cancelada', className: 'bg-sand text-ink-soft' },
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  )
}

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>()
  const queryClient = useQueryClient()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const petPhotoInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  const { data: pet, isLoading } = useQuery({
    queryKey: ['pet-history', petId],
    queryFn: () => getPetHistory(petId!),
    enabled: Boolean(petId),
  })

  const { data: tenant } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant, staleTime: 60_000 })
  const canUploadPhotos = tenant?.features.includes('Photos') ?? false

  const uploadMutation = useMutation({
    mutationFn: ({ appointmentId, photo }: { appointmentId: string; photo: File }) => uploadAppointmentPhoto(appointmentId, photo),
    onSuccess: () => {
      setUploadingFor(null)
      queryClient.invalidateQueries({ queryKey: ['pet-history', petId] })
    },
    onError: (error) => {
      setUploadingFor(null)
      toast.error(getErrorMessage(error, 'No se pudo subir la foto.'))
    },
  })

  function triggerUpload(appointmentId: string) {
    setUploadingFor(appointmentId)
    fileInputRef.current?.click()
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file && uploadingFor) {
      uploadMutation.mutate({ appointmentId: uploadingFor, photo: file })
    } else {
      setUploadingFor(null)
    }
  }

  const petPhotoMutation = useMutation({
    mutationFn: (photo: File) => updatePetPhoto(petId!, photo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pet-history', petId] }),
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo actualizar la foto.')),
  })

  function handlePetPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) petPhotoMutation.mutate(file)
  }

  return (
    <TenantShell>
      {pet && (
        <Link to={`/clientes/${pet.clientId}`} className="mb-4 flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Volver a {pet.clientFullName}
        </Link>
      )}

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {pet && (
        <>
          <div className={`mb-6 p-6 ${cardClass}`}>
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-sand-dark/60 bg-sand">
                {pet.photoUrl ? (
                  <img src={resolveUploadUrl(pet.photoUrl)} alt={pet.petName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-soft/40">
                    <Shield className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                )}
                <button
                  onClick={() => petPhotoInputRef.current?.click()}
                  disabled={petPhotoMutation.isPending}
                  title="Cambiar foto"
                  className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-cream hover:bg-ink disabled:opacity-50"
                >
                  {petPhotoMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h1 className="font-display text-xl font-semibold text-ink">{pet.petName}</h1>
                  <a
                    href={`/mascota/${pet.petId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-clay-dark hover:text-clay"
                  >
                    <IdCard className="h-3.5 w-3.5" strokeWidth={2} />
                    Tarjeta de identificación
                  </a>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {pet.breedName} · {SEX_LABEL[pet.sex]}
                  {pet.ageYears != null && ` · ${pet.ageYears} años`}
                  {pet.weightKg != null && ` · ${pet.weightKg} kg`}
                  {pet.color && ` · ${pet.color}`}
                </p>
              </div>
            </div>

            {(pet.vaccines || pet.diseases || pet.medications || pet.allergies) && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {pet.vaccines && <MedField label="Vacunas" value={pet.vaccines} />}
                {pet.diseases && <MedField label="Enfermedades" value={pet.diseases} />}
                {pet.medications && <MedField label="Medicamentos" value={pet.medications} />}
                {pet.allergies && <MedField label="Alergias" value={pet.allergies} />}
              </div>
            )}

            <input
              ref={petPhotoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePetPhotoSelected}
            />
          </div>

          <h2 className="mb-3 font-display font-medium text-ink">Historial</h2>

          {pet.appointments.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Todavía no hay visitas registradas." />
          ) : (
            <div className="space-y-2">
              {pet.appointments.map((entry) => (
                <div key={entry.id} className={`p-4 ${cardClass}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">
                      {entry.scheduledAt ? formatDate(entry.scheduledAt) : 'Sin fecha asignada'}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[entry.status].className}`}>
                      {STATUS_STYLES[entry.status].label}
                    </span>
                  </div>
                  {entry.serviceNames.length > 0 && (
                    <p className="mt-1 text-sm text-ink-soft">{entry.serviceNames.join(', ')}</p>
                  )}
                  {entry.notes && <p className="mt-1 text-sm text-ink-soft">{entry.notes}</p>}

                  {entry.photoUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.photoUrls.map((url) => (
                        <a key={url} href={resolveUploadUrl(url)} target="_blank" rel="noreferrer">
                          <img
                            src={resolveUploadUrl(url)}
                            alt="Foto de la visita"
                            className="h-16 w-16 rounded-lg object-cover ring-1 ring-sand-dark"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {canUploadPhotos && (
                    <button
                      onClick={() => triggerUpload(entry.id)}
                      disabled={uploadMutation.isPending && uploadingFor === entry.id}
                      className="mt-3 flex items-center gap-1.5 text-xs font-medium text-clay-dark hover:text-clay disabled:opacity-50"
                    >
                      {uploadMutation.isPending && uploadingFor === entry.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5" />
                      )}
                      Agregar foto
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
    </TenantShell>
  )
}

function MedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="text-ink-soft">{value}</p>
    </div>
  )
}
