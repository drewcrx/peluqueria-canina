import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, PawPrint, Store } from 'lucide-react'
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
import { getMyTenant, updateBranding, uploadLogo } from '../tenant/api'

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
