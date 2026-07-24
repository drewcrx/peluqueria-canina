import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, FileText, Globe, KeyRound, MessageCircle, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '../../components/Modal'
import { PlanUpgradePrompt } from '../../components/PlanUpgradePrompt'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { inputClass } from '../../components/ui/styles'
import { getErrorMessage } from '../../lib/getErrorMessage'
import { getMyTenant, updateCustomDomain, updateWhatsAppSettings } from '../tenant/api'
import { generateApiKey, getApiKeyStatus } from './api'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  )
}

export function SettingsPage() {
  const { data: apiKeyStatus, isLoading, isError } = useQuery({
    queryKey: ['api-key-status'],
    queryFn: getApiKeyStatus,
    retry: false,
  })

  return (
    <TenantShell>
      <PageHeader
        title="Configuración"
        subtitle="Funcionalidades Pro: API, WhatsApp, dominio propio y facturación."
      />

      {isLoading && <p className="text-ink-soft">Cargando…</p>}
      {isError && <PlanUpgradePrompt feature="Configuración Pro" />}

      {apiKeyStatus && (
        <div className="space-y-6">
          <ApiKeySection status={apiKeyStatus} />
          <WhatsAppSection />
          <CustomDomainSection />
          <InvoicingStubCard />
        </div>
      )}
    </TenantShell>
  )
}

function ApiKeySection({ status }: { status: { hasActiveKey: boolean; maskedPreview: string | null; createdAt: string | null; lastUsedAt: string | null } }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateMutation = useMutation({
    mutationFn: generateApiKey,
    onSuccess: (rawKey) => {
      setNewKey(rawKey)
      queryClient.invalidateQueries({ queryKey: ['api-key-status'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo generar la clave de API.')),
  })

  async function copyKey() {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <SectionCard icon={KeyRound} title="API" description="Acceso programático de solo lectura a tus clientes y citas.">
      {status.hasActiveKey ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-sand-dark/60 bg-cream-dark/50 px-3 py-2.5">
            <code className="flex-1 text-sm text-ink">{status.maskedPreview}</code>
          </div>
          <p className="text-xs text-ink-soft">
            Creada el {status.createdAt && formatDate(status.createdAt)}
            {status.lastUsedAt && <> · último uso {formatDate(status.lastUsedAt)}</>}
          </p>
        </div>
      ) : (
        <p className="mb-3 text-sm text-ink-soft">Todavía no generas una clave de API.</p>
      )}

      <Button variant="accent" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="mt-3">
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
        {status.hasActiveKey ? 'Regenerar clave' : 'Generar clave'}
      </Button>
      {status.hasActiveKey && (
        <p className="mt-1.5 text-xs text-amber-700">Regenerar invalida la clave actual de inmediato.</p>
      )}

      <Modal open={newKey !== null} onClose={() => setNewKey(null)} title="Tu clave de API">
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">
            Cópiala ahora — no se volverá a mostrar completa. Envíala en el header <code>X-Api-Key</code>.
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-sand-dark/60 bg-cream-dark/50 px-3 py-2.5">
            <code className="flex-1 break-all text-sm text-ink">{newKey}</code>
            <button
              onClick={copyKey}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-ink-soft shadow-soft ring-1 ring-sand-dark hover:bg-sand/40"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-sage-dark" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-ink-soft">
            Ejemplo: <code>curl -H &quot;X-Api-Key: {'{clave}'}&quot; https://tu-dominio/api/v1/clients</code>
          </p>
        </div>
      </Modal>
    </SectionCard>
  )
}

function WhatsAppSection() {
  const { data: tenant } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant })
  const queryClient = useQueryClient()
  const toast = useToast()
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (tenant) setValue(tenant.whatsAppNumber ?? '')
  }, [tenant])

  const mutation = useMutation({
    mutationFn: (v: string) => updateWhatsAppSettings(v || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tenant'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo guardar el número de WhatsApp.')),
  })

  return (
    <SectionCard icon={MessageCircle} title="WhatsApp Business" description="Envía recordatorios por WhatsApp — próximamente.">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="+593 99 999 9999"
          className={`w-full max-w-xs ${inputClass}`}
        />
        <Button onClick={() => mutation.mutate(value)} disabled={mutation.isPending}>
          {saved ? 'Guardado' : 'Guardar'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Guardamos tu número para cuando se conecte la integración con WhatsApp Business — los recordatorios se siguen
        registrando por ahora.
      </p>
    </SectionCard>
  )
}

function CustomDomainSection() {
  const { data: tenant } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant })
  const queryClient = useQueryClient()
  const toast = useToast()
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (tenant) setValue(tenant.customDomainRequested ?? '')
  }, [tenant])

  const mutation = useMutation({
    mutationFn: (v: string) => updateCustomDomain(v || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tenant'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo guardar el dominio.')),
  })

  return (
    <SectionCard icon={Globe} title="Dominio propio" description="Usa tu propio dominio para el formulario público — próximamente.">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="reservas.tupeluqueria.com"
          className={`w-full max-w-xs ${inputClass}`}
        />
        <Button onClick={() => mutation.mutate(value)} disabled={mutation.isPending}>
          {saved ? 'Guardado' : 'Guardar'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Registramos el dominio que quieres usar — te contactaremos para configurar el DNS cuando esté disponible.
      </p>
    </SectionCard>
  )
}

function InvoicingStubCard() {
  return (
    <SectionCard icon={FileText} title="Facturación automática" description="Próximamente.">
      <p className="text-sm text-ink-soft">
        Estamos trabajando en la generación automática de facturas. Por ahora, sigue usando Caja para tu control de
        ingresos y egresos.
      </p>
    </SectionCard>
  )
}
