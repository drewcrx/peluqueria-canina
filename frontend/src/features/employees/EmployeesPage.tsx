import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { inputClass, labelClass, tableWrapClass, tdClass, thClass, trHoverClass } from '../../components/ui/styles'
import { getErrorMessage } from '../../lib/getErrorMessage'
import { useAuth } from '../auth/AuthContext'
import { ROLE_TENANT_OWNER } from '../auth/types'
import { getMyTenant } from '../tenant/api'
import { createEmployee, listEmployees, setEmployeeActive, type CreateEmployeeResult } from './api'

const ROLE_LABELS: Record<string, string> = { TenantOwner: 'Dueño', Manager: 'Gerente', Employee: 'Empleado' }

function roleLabel(roles: string[]) {
  if (roles.includes('TenantOwner')) return ROLE_LABELS.TenantOwner
  if (roles.includes('Manager')) return ROLE_LABELS.Manager
  return ROLE_LABELS.Employee
}

const employeeSchema = z.object({
  fullName: z.string().min(2, 'Ingresa el nombre completo'),
  email: z.string().min(1, 'Requerido').email('Correo inválido'),
  role: z.enum(['Employee', 'Manager']),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export function EmployeesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [createdResult, setCreatedResult] = useState<CreateEmployeeResult | null>(null)
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()
  const toast = useToast()
  const { user } = useAuth()
  const isOwner = user?.roles.includes(ROLE_TENANT_OWNER) ?? false

  const { data: employees, isLoading } = useQuery({ queryKey: ['employees'], queryFn: listEmployees })
  const { data: tenant } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant })
  const canAssignManager = isOwner && (tenant?.features.includes('AdvancedRoles') ?? false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({ resolver: zodResolver(employeeSchema), defaultValues: { role: 'Employee' } })

  const createMutation = useMutation({
    mutationFn: (values: EmployeeFormValues) => createEmployee(values.fullName, values.email, values.role),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['my-tenant'] })
      setModalOpen(false)
      reset()
      setCreatedResult(result)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setEmployeeActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
    onError: (error) => toast.error(getErrorMessage(error, 'No se pudo cambiar el estado del empleado.')),
  })

  async function copyPassword() {
    if (!createdResult) return
    await navigator.clipboard.writeText(createdResult.temporaryPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const atLimit = tenant?.maxEmployees != null && tenant.employeeCount >= tenant.maxEmployees

  return (
    <TenantShell>
      <PageHeader
        title="Empleados"
        subtitle={
          tenant
            ? `${tenant.employeeCount} de ${tenant.maxEmployees ?? '∞'} en tu plan ${tenant.planName}`
            : undefined
        }
        actions={
          <Button
            variant="accent"
            onClick={() => setModalOpen(true)}
            disabled={atLimit}
            title={atLimit ? 'Alcanzaste el límite de tu plan' : undefined}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Agregar empleado
          </Button>
        }
      />

      {atLimit && (
        <div className="mb-6 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink-soft">
          Alcanzaste el límite de empleados de tu plan. Actualiza tu plan para agregar más.
        </div>
      )}

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {employees && employees.length === 0 && (
        <EmptyState icon={Users} title="Todavía no tienes empleados registrados." />
      )}

      {employees && employees.length > 0 && (
        <div className={`overflow-x-auto ${tableWrapClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand-dark/60">
              <tr>
                <th className={thClass}>Nombre</th>
                <th className={thClass}>Correo</th>
                <th className={thClass}>Rol</th>
                <th className={thClass}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className={trHoverClass}>
                  <td className={`${tdClass} font-medium`}>{employee.fullName}</td>
                  <td className={tdClass}>{employee.email}</td>
                  <td className={tdClass}>{roleLabel(employee.roles)}</td>
                  <td className={tdClass}>
                    {employee.roles.includes('TenantOwner') || (employee.roles.includes('Manager') && !isOwner) ? (
                      <span className="text-xs text-ink-soft/50">—</span>
                    ) : (
                      <button
                        onClick={() => statusMutation.mutate({ id: employee.id, isActive: !employee.isActive })}
                        disabled={statusMutation.isPending}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          employee.isActive
                            ? 'bg-sage-light text-sage-dark hover:bg-sage-light/70'
                            : 'bg-sand text-ink-soft hover:bg-sand-dark/60'
                        }`}
                      >
                        {employee.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar empleado">
        <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="space-y-3">
          <div>
            <input placeholder="Nombre completo" {...register('fullName')} className={inputClass} />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
          </div>
          <div>
            <input placeholder="Correo" {...register('email')} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {canAssignManager && (
            <div>
              <label className={labelClass}>Rol</label>
              <select {...register('role')} className={inputClass}>
                <option value="Employee">Empleado</option>
                <option value="Manager">Gerente</option>
              </select>
              <p className="mt-1 text-xs text-ink-soft">
                El Gerente también puede gestionar Servicios, Productos y Empleados.
              </p>
            </div>
          )}

          {createMutation.isError && (
            <p className="text-sm text-red-600">
              {(createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'No se pudo crear el empleado.'}
            </p>
          )}

          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? 'Creando…' : 'Crear empleado'}
          </Button>
        </form>
      </Modal>

      <Modal open={createdResult !== null} onClose={() => setCreatedResult(null)} title="Empleado creado">
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">
            Comparte esta contraseña temporal con tu empleado — no se volverá a mostrar. Puede cambiarla después de
            iniciar sesión.
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-sand-dark/60 bg-cream-dark/50 px-3 py-2.5">
            <code className="flex-1 text-sm text-ink">{createdResult?.temporaryPassword}</code>
            <button
              onClick={copyPassword}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-ink-soft shadow-soft ring-1 ring-sand-dark hover:bg-sand/40"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-sage-dark" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </Modal>
    </TenantShell>
  )
}
