import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, KeyRound, PawPrint, Store } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { inputClass, labelClass } from '../../components/ui/styles'
import { resolveUploadUrl } from '../../lib/apiBaseUrl'
import { getErrorMessage } from '../../lib/getErrorMessage'
import { changePassword } from '../auth/api'
import { useAuth } from '../auth/AuthContext'
import { ROLE_TENANT_OWNER } from '../auth/types'
import {
  DAYS_OF_WEEK,
  getBusinessHours,
  getMyTenant,
  updateBranding,
  updateBusinessHours,
  uploadLogo,
  type BusinessHours,
  type DayHours,
  type DayOfWeekName,
} from '../tenant/api'

const DAY_LABELS: Record<DayOfWeekName, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
}

function toTimeInput(value: string | null): string {
  return value ? value.slice(0, 5) : ''
}

export function MyBusinessPage() {
  const { user } = useAuth()
  const isOwner = user?.roles.includes(ROLE_TENANT_OWNER) ?? false
  const { data: tenant, isLoading } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant })

  return (
    <TenantShell>
      <PageHeader title="Mi negocio y mi perfil" subtitle="La identidad de tu peluquería y los datos de tu cuenta." />

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {tenant && (
        <div className="space-y-6">
          <BrandingSection tenant={tenant} isOwner={isOwner} />
          <BusinessHoursSection isOwner={isOwner} />
          <PasswordSection />
        </div>
      )}
    </TenantShell>
  )
}

function BrandingSection({
  tenant,
  isOwner,
}: {
  tenant: { name: string; logoUrl: string | null; brandColor: string | null }
  isOwner: boolean
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(tenant.name)
  const [brandColor, setBrandColor] = useState(tenant.brandColor ?? '#c17a56')

  useEffect(() => {
    setName(tenant.name)
    setBrandColor(tenant.brandColor ?? '#c17a56')
  }, [tenant.name, tenant.brandColor])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['my-tenant'] })

  const brandingMutation = useMutation({
    mutationFn: () => updateBranding(name, brandColor),
    onSuccess: () => {
      toast.success('Marca actualizada.')
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo guardar la marca.')),
  })

  const logoMutation = useMutation({
    mutationFn: (file: File) => uploadLogo(file),
    onSuccess: () => {
      toast.success('Logo actualizado.')
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo subir el logo.')),
  })

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) logoMutation.mutate(file)
  }

  return (
    <SectionCard
      icon={Store}
      title="Marca de tu negocio"
      description="Así se ve tu peluquería para tus clientes en el formulario público."
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sand-dark/60 bg-cream-dark/50">
          {tenant.logoUrl ? (
            <img src={resolveUploadUrl(tenant.logoUrl)} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <PawPrint className="h-6 w-6 text-ink-soft/40" strokeWidth={1.5} />
          )}
        </div>
        {isOwner && (
          <div>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={logoMutation.isPending}>
              {logoMutation.isPending ? 'Subiendo…' : 'Cambiar logo'}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleLogoChange} />
          </div>
        )}
      </div>

      {isOwner ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label className={labelClass}>Nombre de la peluquería</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Color de acento</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border border-sand-dark bg-white/70 p-1"
              />
              <input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className={`w-28 ${inputClass}`}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">
          Solo el dueño de la peluquería puede editar el nombre, el logo y el color de marca.
        </p>
      )}

      {isOwner && (
        <Button
          className="mt-5"
          onClick={() => brandingMutation.mutate()}
          disabled={brandingMutation.isPending || !name.trim()}
        >
          {brandingMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      )}
    </SectionCard>
  )
}

function BusinessHoursSection({ isOwner }: { isOwner: boolean }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data } = useQuery({ queryKey: ['business-hours'], queryFn: getBusinessHours })

  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60)
  const [days, setDays] = useState<DayHours[]>([])

  useEffect(() => {
    if (!data) return
    setSlotDurationMinutes(data.slotDurationMinutes)
    setDays(data.days)
  }, [data])

  const mutation = useMutation({
    mutationFn: (input: BusinessHours) => updateBusinessHours(input),
    onSuccess: () => {
      toast.success('Horario actualizado.')
      queryClient.invalidateQueries({ queryKey: ['business-hours'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo guardar el horario.')),
  })

  function updateDay(day: DayOfWeekName, patch: Partial<DayHours>) {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === day ? { ...d, ...patch } : d)))
  }

  if (days.length === 0) {
    return null
  }

  return (
    <SectionCard
      icon={Clock}
      title="Horario de atención"
      description="Define cuándo estás abierto — tus clientes solo podrán elegir citas dentro de estas horas desde el formulario público."
    >
      <div className="space-y-2">
        {DAYS_OF_WEEK.map((day) => {
          const hours = days.find((d) => d.dayOfWeek === day)
          if (!hours) return null
          return (
            <div key={day} className="flex flex-wrap items-center gap-3 rounded-xl border border-sand-dark/60 px-3.5 py-2.5">
              <label className="flex w-32 shrink-0 items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={hours.isOpen}
                  disabled={!isOwner}
                  onChange={(e) => updateDay(day, { isOpen: e.target.checked })}
                  className="h-4 w-4 rounded border-sand-dark accent-clay-dark"
                />
                {DAY_LABELS[day]}
              </label>
              {hours.isOpen ? (
                <div className="flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="time"
                    value={toTimeInput(hours.openTime)}
                    disabled={!isOwner}
                    onChange={(e) => updateDay(day, { openTime: `${e.target.value}:00` })}
                    className={`${inputClass} w-32`}
                  />
                  <span>a</span>
                  <input
                    type="time"
                    value={toTimeInput(hours.closeTime)}
                    disabled={!isOwner}
                    onChange={(e) => updateDay(day, { closeTime: `${e.target.value}:00` })}
                    className={`${inputClass} w-32`}
                  />
                </div>
              ) : (
                <span className="text-sm text-ink-soft/60">Cerrado</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 max-w-xs">
        <label className={labelClass}>Duración de cada cita (minutos)</label>
        <input
          type="number"
          min={15}
          max={240}
          step={15}
          value={slotDurationMinutes}
          disabled={!isOwner}
          onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
          className={inputClass}
        />
      </div>

      {isOwner ? (
        <Button
          className="mt-5"
          onClick={() => mutation.mutate({ slotDurationMinutes, days })}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Guardando…' : 'Guardar horario'}
        </Button>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">Solo el dueño de la peluquería puede editar el horario.</p>
      )}
    </SectionCard>
  )
}

function PasswordSection() {
  const toast = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Contraseña actualizada.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo cambiar la contraseña.')),
  })

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  return (
    <SectionCard icon={KeyRound} title="Contraseña" description="Cambia la contraseña de tu propia cuenta.">
      <div className="grid grid-cols-1 gap-3 sm:max-w-md">
        <div>
          <label className={labelClass}>Contraseña actual</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nueva contraseña</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Confirmar nueva contraseña</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          {mismatch && <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden.</p>}
        </div>
      </div>

      <Button
        className="mt-4"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !currentPassword || newPassword.length < 8 || mismatch}
      >
        {mutation.isPending ? 'Guardando…' : 'Actualizar contraseña'}
      </Button>
    </SectionCard>
  )
}
