import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, PackageSearch, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Modal } from '../../components/Modal'
import { PlanUpgradePrompt } from '../../components/PlanUpgradePrompt'
import { TenantShell } from '../../components/layout/TenantShell'
import { useAuth } from '../auth/AuthContext'
import { adjustStock, createProduct, listProducts, type Product } from './api'

const productSchema = z.object({
  name: z.string().min(1, 'Ingresa el nombre'),
  initialStock: z.coerce.number().int().min(0),
  minStock: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  unitPrice: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
})

const movementSchema = z.object({
  type: z.enum(['In', 'Out']),
  quantity: z.coerce.number().int().min(1),
  reason: z.string().optional(),
})

export function ProductsPage() {
  const { user } = useAuth()
  const isOwner = user?.roles.includes('TenantOwner') ?? false
  const [createOpen, setCreateOpen] = useState(false)
  const [movementProduct, setMovementProduct] = useState<Product | null>(null)
  const queryClient = useQueryClient()

  const { data: products, isLoading, isError } = useQuery({ queryKey: ['products'], queryFn: listProducts, retry: false })

  const createForm = useForm({ resolver: zodResolver(productSchema) })
  const movementForm = useForm({ resolver: zodResolver(movementSchema), defaultValues: { type: 'In' as const } })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products'] })

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      setCreateOpen(false)
      createForm.reset()
      invalidate()
    },
  })

  const movementMutation = useMutation({
    mutationFn: (values: { type: 'In' | 'Out'; quantity: number; reason?: string }) =>
      adjustStock(movementProduct!.id, values.type, values.quantity, values.reason),
    onSuccess: () => {
      setMovementProduct(null)
      movementForm.reset({ type: 'In' })
      invalidate()
    },
  })

  return (
    <TenantShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Inventario</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Productos y control de stock.</p>
        </div>
        {isOwner && !isError && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Agregar producto
          </button>
        )}
      </div>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {isError && <PlanUpgradePrompt feature="Inventario" />}

      {products && products.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <PackageSearch className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
          <p className="text-slate-500 dark:text-slate-400">Todavía no tienes productos registrados.</p>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3">
                    <Link to={`/inventario/${product.id}`} className="font-medium text-indigo-600 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      {product.stockQuantity}
                      {product.isLowStock && (
                        <span title="Stock bajo">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {product.unitPrice != null ? `$${product.unitPrice.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setMovementProduct(product)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Movimiento
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Agregar producto">
        <form onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))} className="space-y-3">
          <input placeholder="Nombre" {...createForm.register('name')} className={inputClass} />
          <div className="grid grid-cols-3 gap-3">
            <input type="number" placeholder="Stock inicial" {...createForm.register('initialStock')} className={inputClass} />
            <input type="number" placeholder="Stock mínimo" {...createForm.register('minStock')} className={inputClass} />
            <input type="number" step="0.01" placeholder="Precio" {...createForm.register('unitPrice')} className={inputClass} />
          </div>
          {createMutation.isError && <p className="text-sm text-red-500">No se pudo crear el producto.</p>}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Guardando…' : 'Guardar producto'}
          </button>
        </form>
      </Modal>

      <Modal open={movementProduct !== null} onClose={() => setMovementProduct(null)} title={`Movimiento — ${movementProduct?.name ?? ''}`}>
        <form onSubmit={movementForm.handleSubmit((values) => movementMutation.mutate(values))} className="space-y-3">
          <select {...movementForm.register('type')} className={inputClass}>
            <option value="In">Entrada (reponer)</option>
            <option value="Out">Salida (usar/vender)</option>
          </select>
          <input type="number" placeholder="Cantidad" {...movementForm.register('quantity')} className={inputClass} />
          <input placeholder="Motivo (opcional)" {...movementForm.register('reason')} className={inputClass} />
          {movementMutation.isError && (
            <p className="text-sm text-red-500">
              {(movementMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'No se pudo registrar el movimiento.'}
            </p>
          )}
          <button
            type="submit"
            disabled={movementMutation.isPending}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {movementMutation.isPending ? 'Guardando…' : 'Registrar movimiento'}
          </button>
        </form>
      </Modal>
    </TenantShell>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500'
