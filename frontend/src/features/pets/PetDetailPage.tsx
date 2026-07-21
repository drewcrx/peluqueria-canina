import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Camera, ClipboardList, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TenantShell } from '../../components/layout/TenantShell'
import { getMyTenant } from '../tenant/api'
import { getPetHistory, uploadAppointmentPhoto } from './api'

const SEX_LABEL: Record<string, string> = { Male: 'Macho', Female: 'Hembra' }

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PendingSchedule: { label: 'Por agendar', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  Scheduled: { label: 'Agendada', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  Completed: { label: 'Completada', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  Cancelled: { label: 'Cancelada', className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  )
}

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    onError: () => setUploadingFor(null),
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

  return (
    <TenantShell>
      {pet && (
        <Link to={`/clientes/${pet.clientId}`} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400">
          <ArrowLeft className="h-4 w-4" /> Volver a {pet.clientFullName}
        </Link>
      )}

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {pet && (
        <>
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{pet.petName}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {pet.breedName} · {SEX_LABEL[pet.sex]}
              {pet.ageYears != null && ` · ${pet.ageYears} años`}
              {pet.weightKg != null && ` · ${pet.weightKg} kg`}
            </p>

            {(pet.vaccines || pet.diseases || pet.medications || pet.allergies) && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {pet.vaccines && <MedField label="Vacunas" value={pet.vaccines} />}
                {pet.diseases && <MedField label="Enfermedades" value={pet.diseases} />}
                {pet.medications && <MedField label="Medicamentos" value={pet.medications} />}
                {pet.allergies && <MedField label="Alergias" value={pet.allergies} />}
              </div>
            )}
          </div>

          <h2 className="mb-3 font-medium text-slate-900 dark:text-slate-50">Historial</h2>

          {pet.appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
              <ClipboardList className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
              <p className="text-slate-500 dark:text-slate-400">Todavía no hay visitas registradas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pet.appointments.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {entry.scheduledAt ? formatDate(entry.scheduledAt) : 'Sin fecha asignada'}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[entry.status].className}`}>
                      {STATUS_STYLES[entry.status].label}
                    </span>
                  </div>
                  {entry.serviceNames.length > 0 && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.serviceNames.join(', ')}</p>
                  )}
                  {entry.notes && <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{entry.notes}</p>}

                  {entry.photoUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.photoUrls.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer">
                          <img
                            src={url}
                            alt="Foto de la visita"
                            className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {canUploadPhotos && (
                    <button
                      onClick={() => triggerUpload(entry.id)}
                      disabled={uploadMutation.isPending && uploadingFor === entry.id}
                      className="mt-3 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400"
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
      <p className="text-xs text-slate-400 dark:text-slate-600">{label}</p>
      <p className="text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  )
}
