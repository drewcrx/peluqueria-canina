import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, Camera, CheckCircle2, Clock, Eraser, PawPrint, Sparkles, User, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import SignatureCanvas from 'react-signature-canvas'
import { z } from 'zod'
import { BackgroundBlobs } from '../../components/BackgroundBlobs'
import { Button } from '../../components/ui/Button'
import { cardClass, inputClass, labelClass } from '../../components/ui/styles'
import { resolveUploadUrl } from '../../lib/apiBaseUrl'
import { dataUrlToFile } from '../../lib/dataUrlToFile'
import { getAvailableSlots, getPublicTenantInfo, submitIntake } from './api'

const MAX_PHOTOS = 6

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatTime(time: string) {
  const [h, m] = time.split(':')
  const hour = Number(h)
  const period = hour >= 12 ? 'p.m.' : 'a.m.'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${m} ${period}`
}

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
  petColor: z.string().optional(),
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
  const [petPhoto, setPetPhoto] = useState<File | null>(null)
  const [signatureError, setSignatureError] = useState(false)
  const [submitted, setSubmitted] = useState<{ petName: string; clientFullName: string; scheduledAt: string | null } | null>(null)
  const signatureRef = useRef<SignatureCanvas>(null)

  const [selectedDate, setSelectedDate] = useState(todayIso())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [slotError, setSlotError] = useState(false)

  const { data: availability, isLoading: loadingSlots } = useQuery({
    queryKey: ['available-slots', slug, selectedDate],
    queryFn: () => getAvailableSlots(slug!, selectedDate),
    enabled: Boolean(slug && selectedDate),
  })

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
        petPhoto,
        requestedAt: selectedSlot ? `${selectedDate}T${selectedSlot}` : undefined,
        requestedServiceIds: selectedServices,
        photos,
        signature: signatureFile,
      })
    },
    onSuccess: (result) => setSubmitted(result),
  })

  function onSubmit(values: FormValues) {
    if (!selectedSlot) {
      setSlotError(true)
      document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSlotError(false)

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
          className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-light text-sage-dark"
        >
          <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
        </motion.div>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink">¡Listo, {submitted.clientFullName}!</h1>
        {submitted.scheduledAt ? (
          <p className="mt-2 max-w-sm text-ink-soft">
            La cita de <span className="font-medium text-ink">{submitted.petName}</span> en {info.tenantName} quedó confirmada
            para el{' '}
            <span className="font-medium text-ink">
              {new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }).format(
                new Date(submitted.scheduledAt),
              )}
            </span>
            .
          </p>
        ) : (
          <p className="mt-2 max-w-sm text-ink-soft">
            Registramos a <span className="font-medium text-ink">{submitted.petName}</span> en {info.tenantName}. El horario que
            elegiste ya no estaba disponible — nos pondremos en contacto contigo para coordinar otro.
          </p>
        )}
      </CenteredMessage>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream px-4 py-8 sm:py-12">
      <BackgroundBlobs />
      <div className="relative mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl text-cream shadow-soft"
            style={{ backgroundColor: info.brandColor ?? undefined }}
          >
            {info.logoUrl ? (
              <img src={resolveUploadUrl(info.logoUrl)} alt={info.tenantName} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-clay-dark">
                <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              </span>
            )}
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">{info.tenantName}</h1>
          <p className="text-sm text-ink-soft">Registra a tu mascota para su próxima visita</p>
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
            <Field label="Color">
              <input {...register('petColor')} className={inputClass} />
            </Field>
            <Field label="Foto de tu mascota (opcional)">
              <div className="flex items-center gap-3">
                {petPhoto && (
                  <img
                    src={URL.createObjectURL(petPhoto)}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-sand-dark"
                  />
                )}
                <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-sand-dark px-3 py-2 text-sm text-ink-soft hover:border-clay/50 hover:text-clay-dark">
                  <Camera className="h-4 w-4" strokeWidth={1.5} />
                  {petPhoto ? 'Cambiar foto' : 'Subir foto'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    capture="environment"
                    hidden
                    onChange={(e) => setPetPhoto(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </Field>
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
              <p className="text-sm text-ink-soft">Esta peluquería no tiene servicios configurados todavía.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {info.services.map((service) => {
                  const checked = selectedServices.includes(service.id)
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        checked
                          ? 'border-clay bg-clay/10 text-clay-dark'
                          : 'border-sand-dark text-ink-soft hover:border-clay/40'
                      }`}
                      style={checked && info.brandColor ? { borderColor: info.brandColor, color: info.brandColor } : undefined}
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

          <div id="schedule-section">
            <Section icon={Calendar} title="Elige fecha y hora">
              <Field label="Fecha">
                <input
                  type="date"
                  value={selectedDate}
                  min={todayIso()}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedSlot(null)
                  }}
                  className={inputClass}
                />
              </Field>

              <div>
                <label className={labelClass}>Hora disponible</label>
                {loadingSlots && <p className="text-sm text-ink-soft">Buscando horarios…</p>}
                {!loadingSlots && availability && availability.slots.length === 0 && (
                  <p className="text-sm text-ink-soft">No hay horarios disponibles este día. Prueba con otra fecha.</p>
                )}
                {!loadingSlots && availability && availability.slots.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {availability.slots.map((slot) => {
                      const checked = selectedSlot === slot
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => {
                            setSelectedSlot(slot)
                            setSlotError(false)
                          }}
                          className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-sm transition-colors ${
                            checked
                              ? 'border-clay bg-clay/10 text-clay-dark'
                              : 'border-sand-dark text-ink-soft hover:border-clay/40'
                          }`}
                          style={checked && info.brandColor ? { borderColor: info.brandColor, color: info.brandColor } : undefined}
                        >
                          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                          {formatTime(slot)}
                        </button>
                      )
                    })}
                  </div>
                )}
                {slotError && <p className="mt-1 text-xs text-red-600">Elige un horario disponible antes de enviar.</p>}
              </div>
            </Section>
          </div>

          <Section icon={Camera} title="Fotos (opcional)">
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-sand-dark">
                  <img src={URL.createObjectURL(photo)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-ink/60 p-0.5 text-cream"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border border-dashed border-sand-dark text-ink-soft/50 hover:border-clay/50 hover:text-clay-dark">
                  <Camera className="h-5 w-5" strokeWidth={1.5} />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    multiple
                    hidden
                    onChange={handlePhotosChange}
                  />
                </label>
              )}
            </div>
          </Section>

          <div id="signature-section">
            <Section icon={PawPrint} title="Firma">
              <p className="mb-2 text-xs text-ink-soft">
                Al firmar confirmas los datos ingresados y autorizas el servicio.
              </p>
              <div
                className={`overflow-hidden rounded-xl border bg-white ${signatureError ? 'border-red-400' : 'border-sand-dark'}`}
              >
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-40' }}
                  clearOnResize={false}
                  onEnd={() => setSignatureError(false)}
                />
              </div>
              {signatureError && <p className="mt-1 text-xs text-red-600">Por favor firma antes de enviar.</p>}
              <button
                type="button"
                onClick={() => signatureRef.current?.clear()}
                className="mt-2 flex items-center gap-1 text-xs text-ink-soft hover:text-ink"
              >
                <Eraser className="h-3 w-3" /> Limpiar firma
              </button>
            </Section>
          </div>

          {mutation.isError && (
            <p className="text-center text-sm text-red-600">No se pudo enviar el formulario. Intenta de nuevo.</p>
          )}

          <Button
            type="submit"
            variant="accent"
            disabled={mutation.isPending}
            className="w-full"
            style={info.brandColor ? { backgroundColor: info.brandColor } : undefined}
          >
            {mutation.isPending ? 'Enviando…' : 'Enviar formulario'}
          </Button>
        </form>
      </div>
    </div>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      {children}
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <div className={`p-5 ${cardClass}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4.5 w-4.5 text-clay-dark" strokeWidth={2} />
        <h2 className="font-display font-medium text-ink">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
