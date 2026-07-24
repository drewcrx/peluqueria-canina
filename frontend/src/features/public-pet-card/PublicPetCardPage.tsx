import { useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { AlertTriangle, Pill, Printer, Shield, Sparkles, Syringe } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { resolveUploadUrl } from '../../lib/apiBaseUrl'
import { getPetCard } from './api'

const SEX_LABEL: Record<string, string> = { Male: 'Macho', Female: 'Hembra' }

function formatVisitDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export function PublicPetCardPage() {
  const { petId } = useParams<{ petId: string }>()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const {
    data: pet,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-pet-card', petId],
    queryFn: () => getPetCard(petId!),
    enabled: Boolean(petId),
    retry: false,
  })

  useEffect(() => {
    if (!petId) return
    QRCode.toDataURL(window.location.href, { margin: 1, width: 240, color: { dark: '#2b2521', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [petId])

  if (isLoading) {
    return <CenteredMessage>Cargando tarjeta…</CenteredMessage>
  }

  if (isError || !pet) {
    return <CenteredMessage>No encontramos esta tarjeta de identificación.</CenteredMessage>
  }

  const brandColor = pet.tenantBrandColor ?? undefined

  return (
    <div className="min-h-screen bg-cream px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <p className="text-sm text-ink-soft">Tarjeta de identificación de mascota</p>
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer className="h-4 w-4" strokeWidth={2} />
            Imprimir
          </Button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-sand-dark/60 bg-white shadow-soft print:rounded-none print:border-2 print:border-ink/20 print:shadow-none">
          <div className="flex items-center gap-3 px-5 py-4 text-cream" style={{ backgroundColor: brandColor ?? '#8d593f' }}>
            {pet.tenantLogoUrl ? (
              <img src={resolveUploadUrl(pet.tenantLogoUrl)} alt={pet.tenantName} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <Sparkles className="h-4.5 w-4.5" strokeWidth={2.5} />
              </span>
            )}
            <div>
              <p className="font-display text-sm font-semibold leading-tight">{pet.tenantName}</p>
              <p className="text-xs text-cream/80">Cédula de identificación mascota</p>
            </div>
          </div>

          <div className="flex gap-4 p-5">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-sand-dark/60 bg-sand">
              {pet.photoUrl ? (
                <img src={resolveUploadUrl(pet.photoUrl)} alt={pet.petName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-soft/40">
                  <Shield className="h-10 w-10" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg font-semibold leading-tight text-ink">{pet.petName}</h1>
              <p className="mt-0.5 text-sm text-ink-soft">{pet.breedName}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <IdRow label="Sexo" value={SEX_LABEL[pet.sex]} />
                {pet.ageYears != null && <IdRow label="Edad" value={`${pet.ageYears} años`} />}
                {pet.weightKg != null && <IdRow label="Peso" value={`${pet.weightKg} kg`} />}
                {pet.color && <IdRow label="Color" value={pet.color} />}
              </dl>
            </div>
          </div>

          {(pet.vaccines || pet.diseases || pet.medications || pet.allergies) && (
            <div className="grid grid-cols-2 gap-3 border-t border-sand-dark/60 px-5 py-4 text-xs">
              {pet.vaccines && <HealthField icon={Syringe} label="Vacunas" value={pet.vaccines} />}
              {pet.diseases && <HealthField icon={AlertTriangle} label="Enfermedades" value={pet.diseases} />}
              {pet.medications && <HealthField icon={Pill} label="Medicamentos" value={pet.medications} />}
              {pet.allergies && <HealthField icon={Shield} label="Alergias" value={pet.allergies} />}
            </div>
          )}

          <div className="border-t border-sand-dark/60 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Dueño</p>
            <p className="text-sm text-ink">{pet.ownerFullName}</p>
            <p className="text-sm text-ink-soft">{pet.ownerPhone}</p>
          </div>

          {pet.recentVisits.length > 0 && (
            <div className="border-t border-sand-dark/60 px-5 py-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Historial reciente</p>
              <div className="space-y-1.5">
                {pet.recentVisits.map((visit, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-ink-soft">{formatVisitDate(visit.date)}</span>
                    <span className="text-right text-ink">{visit.serviceNames.join(', ') || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-sand-dark/60 bg-sand/30 px-5 py-4">
            <p className="max-w-[60%] text-[11px] leading-snug text-ink-soft">
              Escanea este código para volver a ver esta tarjeta con los datos de {pet.petName}.
            </p>
            {qrDataUrl && <img src={qrDataUrl} alt="Código QR" className="h-20 w-20 rounded-lg" />}
          </div>
        </div>
      </div>
    </div>
  )
}

function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-ink-soft/70">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </>
  )
}

function HealthField({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay-dark" strokeWidth={2} />
      <div>
        <p className="text-ink-soft/70">{label}</p>
        <p className="text-ink">{value}</p>
      </div>
    </div>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center text-ink-soft">
      {children}
    </div>
  )
}
