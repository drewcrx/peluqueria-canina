import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Camera, CheckCircle2, Eraser, PawPrint, Sparkles, User, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import SignatureCanvas from 'react-signature-canvas'
import { z } from 'zod'
import { dataUrlToFile } from '../../lib/dataUrlToFile'
import { getPublicTenantInfo, submitIntake } from './api'

const MAX_PHOTOS = 6

const formSchema = z.object({
  clientFullName: z.string().min(2, 'Ingresa tu nombre completo'),
  clientPhone: z.string().min(7, 'Ingresa un teléfono válido'),
  clientEmail: z.union([z.string().email('Correo inválido'), z.literal('')]).optional(),
  clientAddress: z.string().optional(),
  petName: z.string().min(1, 'Ingresa el nombre de tu mascota'),
  breedId: z.string().min(1, 'Selecciona una raza'),
  petSex: z.enum(['Male', 'Female']),
  petAgeYears: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  petWeightKg: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  vaccines: z.string().optional(),
  diseases: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  observations: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>()

  const {
    data: info,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-tenant', slug],
    queryFn: () => getPublicTenantInfo(slug!),
    enabled: Boolean(slug),
    retry: false,
  })

  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [signatureError, setSignatureError] = useState(false)
  const [submitted, setSubmitted] = useState<{ petName: string; clientFullName: string } | null>(null)
  const signatureRef = useRef<SignatureCanvas>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(formSchema) })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const signatureFile =
        signatureRef.current && !signatureRef.current.isEmpty()
          ? dataUrlToFile(signatureRef.current.toDataURL('image/png'), 'signature.png')
          : null;

      return submitIntake(slug!, {
        ...values,
        requestedServiceIds: selectedServices,
        photos,
        signature: signatureFile,
      })
    },
    onSuccess: (result) => setSubmitted(result),
  })

  function onSubmit(values: FormValues) {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setSignatureError(true)
      document.getElementById('signature-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSignatureError(false)
    mutation.mutate(values)
  }

  function toggleService(id: string) {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  function handlePhotosChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS))
    e.target.value = ''
  }

  if (isLoading) {
    return <CenteredMessage>Cargando formulario…</CenteredMessage>
  }

  if (isError || !info) {
    return <CenteredMessage>Este formulario no existe o ya no está disponible.</CenteredMessage>
  }

  if (submitted) {
    return (
      <CenteredMessage>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950"
        >
          <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
        </motion.div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50">¡Listo, {submitted.clientFullName}!</h1>
        <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
          Registramos a <span className="font-medium">{submitted.petName}</span> en {info.tenantName}. Nos pondremos en
          contacto contigo pronto.
        </p>
      </CenteredMessage>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{info.tenantName}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Registra a tu mascota para su próxima visita</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Section icon={User} title="Tus datos">
            <Field label="Nombre completo" error={errors.clientFullName?.message}>
              <input {...register('clientFullName')} className={inputClass} />
            </Field>
            <Field label="Teléfono" error={errors.clientPhone?.message}>
              <input {...register('clientPhone')} className={inputClass} />
            </Field>
            <Field label="Correo (opcional)" error={errors.clientEmail?.message}>
              <input {...register('clientEmail')} className={inputClass} />
            </Field>
            <Field label="Dirección (opcional)">
              <input {...register('clientAddress')} className={inputClass} />
            </Field>
          </Section>

          <Section icon={PawPrint} title="Tu mascota">
            <Field label="Nombre" error={errors.petName?.message}>
              <input {...register('petName')} className={inputClass} />
            </Field>
            <Field label="Raza" error={errors.breedId?.message}>
              <select {...register('breedId')} className={inputClass} defaultValue="">
                <option value="" disabled>
                  Selecciona una raza
                </option>
                {info.breeds.map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Sexo">
                <select {...register('petSex')} className={inputClass} defaultValue="Male">
                  <option value="Male">Macho</option>
                  <option value="Female">Hembra</option>
                </select>
              </Field>
              <Field label="Edad (años)" error={errors.petAgeYears?.message}>
                <input type="number" {...register('petAgeYears')} className={inputClass} />
              </Field>
              <Field label="Peso (kg)" error={errors.petWeightKg?.message}>
                <input type="number" step="0.1" {...register('petWeightKg')} className={inputClass} />
              </Field>
            </div>
            <Field label="Vacunas (opcional)">
              <input {...register('vaccines')} className={inputClass} placeholder="Al día, pendiente rabia..." />
            </Field>
            <Field label="Enfermedades (opcional)">
              <input {...register('diseases')} className={inputClass} />
            </Field>
            <Field label="Medicamentos (opcional)">
              <input {...register('medications')} className={inputClass} />
            </Field>
            <Field label="Alergias (opcional)">
              <input {...register('allergies')} className={inputClass} />
            </Field>
          </Section>

          <Section icon={Sparkles} title="Servicios solicitados">
            {info.services.length === 0 ? (
              <p className="text-sm text-slate-400">Esta peluquería no tiene servicios configurados todavía.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {info.services.map((service) => {
                  const checked = selectedServices.includes(service.id)
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        checked
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {service.name}
                    </button>
                  )
                })}
              </div>
            )}

            <Field label="Observaciones (opcional)">
              <textarea {...register('observations')} rows={3} className={inputClass} />
            </Field>
          </Section>

          <Section icon={Camera} title="Fotos (opcional)">
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <img src={URL.createObjectURL(photo)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-slate-900/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-700">
                  <Camera className="h-5 w-5" strokeWidth={1.5} />
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handlePhotosChange} />
                </label>
              )}
            </div>
          </Section>

          <div id="signature-section">
            <Section icon={PawPrint} title="Firma">
              <p className="mb-2 text-xs text-slate-400 dark:text-slate-600">
                Al firmar confirmas los datos ingresados y autorizas el servicio.
              </p>
              <div
                className={`overflow-hidden rounded-lg border bg-white ${signatureError ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
              >
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-40' }}
                  clearOnResize={false}
                  onEnd={() => setSignatureError(false)}
                />
              </div>
              {signatureError && <p className="mt-1 text-xs text-red-500">Por favor firma antes de enviar.</p>}
              <button
                type="button"
                onClick={() => signatureRef.current?.clear()}
                className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                <Eraser className="h-3 w-3" /> Limpiar firma
              </button>
            </Section>
          </div>

          {mutation.isError && (
            <p className="text-center text-sm text-red-500">No se pudo enviar el formulario. Intenta de nuevo.</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Enviando…' : 'Enviar formulario'}
          </button>
        </form>
      </div>
    </div>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      {children}
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4.5 w-4.5 text-indigo-500" strokeWidth={2} />
        <h2 className="font-medium text-slate-900 dark:text-slate-50">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500'
