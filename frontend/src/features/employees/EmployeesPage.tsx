import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { TenantShell } from '../../components/layout/TenantShell'
import { useToast } from '../../components/toast/ToastProvider'
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Empleados</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {tenant && (
              <>
                {tenant.employeeCount} de {tenant.maxEmployees ?? '∞'} en tu plan {tenant.planName}
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={atLimit}
          title={atLimit ? 'Alcanzaste el límite de tu plan' : undefined}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Agregar empleado
        </button>
      </div>

      {atLimit && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Alcanzaste el límite de empleados de tu plan. Actualiza tu plan para agregar más.
        </div>
      )}

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {employees && employees.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <Users className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
          <p className="text-slate-500 dark:text-slate-400">Todavía no tienes empleados registrados.</p>
        </div>
      )}

      {employees && employees.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{employee.fullName}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{employee.email}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{roleLabel(employee.roles)}</td>
                  <td className="px-4 py-3">
                    {employee.roles.includes('TenantOwner') || (employee.roles.includes('Manager') && !isOwner) ? (
                      <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
                    ) : (
                      <button
                        onClick={() => statusMutation.mutate({ id: employee.id, isActive: !employee.isActive })}
                        disabled={statusMutation.isPending}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          employee.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
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
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div>
            <input placeholder="Correo" {...register('email')} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {canAssignManager && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Rol</label>
              <select {...register('role')} className={inputClass}>
                <option value="Employee">Empleado</option>
                <option value="Manager">Gerente</option>
              </select>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">
                El Gerente también puede gestionar Servicios, Productos y Empleados.
              </p>
            </div>
          )}

          {createMutation.isError && (
            <p className="text-sm text-red-500">
              {(createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'No se pudo crear el empleado.'}
            </p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creando…' : 'Crear empleado'}
          </button>
        </form>
      </Modal>

      <Modal open={createdResult !== null} onClose={() => setCreatedResult(null)} title="Empleado creado">
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comparte esta contraseña temporal con tu empleado — no se volverá a mostrar. Puede cambiarla después de
            iniciar sesión.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <code className="flex-1 text-sm text-slate-700 dark:text-slate-200">{createdResult?.temporaryPassword}</code>
            <button
              onClick={copyPassword}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </Modal>
    </TenantShell>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500'
