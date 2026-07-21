import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, FileText, Globe, KeyRound, MessageCircle, RefreshCw } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Modal } from '../../components/Modal'
import { PlanUpgradePrompt } from '../../components/PlanUpgradePrompt'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Configuración</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Funcionalidades Pro: API, WhatsApp, dominio propio y facturación.</p>
      </div>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}
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

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof KeyRound
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-medium text-slate-900 dark:text-slate-50">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
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
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <code className="flex-1 text-sm text-slate-700 dark:text-slate-200">{status.maskedPreview}</code>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Creada el {status.createdAt && formatDate(status.createdAt)}
            {status.lastUsedAt && <> · último uso {formatDate(status.lastUsedAt)}</>}
          </p>
        </div>
      ) : (
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Todavía no generas una clave de API.</p>
      )}

      <button
        onClick={() => generateMutation.mutate()}
        disabled={generateMutation.isPending}
        className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
        {status.hasActiveKey ? 'Regenerar clave' : 'Generar clave'}
      </button>
      {status.hasActiveKey && (
        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">Regenerar invalida la clave actual de inmediato.</p>
      )}

      <Modal open={newKey !== null} onClose={() => setNewKey(null)} title="Tu clave de API">
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cópiala ahora — no se volverá a mostrar completa. Envíala en el header <code>X-Api-Key</code>.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <code className="flex-1 break-all text-sm text-slate-700 dark:text-slate-200">{newKey}</code>
            <button
              onClick={copyKey}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600">
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
          className="w-full max-w-xs rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          onClick={() => mutation.mutate(value)}
          disabled={mutation.isPending}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-600">
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
          className="w-full max-w-xs rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          onClick={() => mutation.mutate(value)}
          disabled={mutation.isPending}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-600">
        Registramos el dominio que quieres usar — te contactaremos para configurar el DNS cuando esté disponible.
      </p>
    </SectionCard>
  )
}

function InvoicingStubCard() {
  return (
    <SectionCard icon={FileText} title="Facturación automática" description="Próximamente.">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Estamos trabajando en la generación automática de facturas. Por ahora, sigue usando Caja para tu control de
        ingresos y egresos.
      </p>
    </SectionCard>
  )
}
