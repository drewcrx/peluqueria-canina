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
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { inputClass, tableWrapClass, tdClass, thClass, trHoverClass } from '../../components/ui/styles'
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
  const isOwnerOrManager = user?.roles.some((r) => r === 'TenantOwner' || r === 'Manager') ?? false
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
      <PageHeader
        title="Inventario"
        subtitle="Productos y control de stock."
        actions={
          isOwnerOrManager && !isError ? (
            <Button variant="accent" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Agregar producto
            </Button>
          ) : undefined
        }
      />

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {isError && <PlanUpgradePrompt feature="Inventario" />}

      {products && products.length === 0 && (
        <EmptyState icon={PackageSearch} title="Todavía no tienes productos registrados." />
      )}

      {products && products.length > 0 && (
        <div className={`overflow-x-auto ${tableWrapClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand-dark/60">
              <tr>
                <th className={thClass}>Producto</th>
                <th className={thClass}>Stock</th>
                <th className={thClass}>Precio</th>
                <th className={thClass}>Estado</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={trHoverClass}>
                  <td className={tdClass}>
                    <Link to={`/inventario/${product.id}`} className="font-medium text-clay-dark hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className={tdClass}>
                    <span className="flex items-center gap-1.5">
                      {product.stockQuantity}
                      {product.isLowStock && (
                        <span title="Stock bajo">
                          <AlertTriangle className="h-3.5 w-3.5 text-gold" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={tdClass}>{product.unitPrice != null ? `$${product.unitPrice.toFixed(2)}` : '—'}</td>
                  <td className={tdClass}>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.isActive ? 'bg-sage-light text-sage-dark' : 'bg-sand text-ink-soft'
                      }`}
                    >
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <button
                      onClick={() => setMovementProduct(product)}
                      className="rounded-full bg-sand px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-sand-dark/60"
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
          {createMutation.isError && <p className="text-sm text-red-600">No se pudo crear el producto.</p>}
          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? 'Guardando…' : 'Guardar producto'}
          </Button>
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
            <p className="text-sm text-red-600">
              {(movementMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'No se pudo registrar el movimiento.'}
            </p>
          )}
          <Button type="submit" disabled={movementMutation.isPending} className="w-full">
            {movementMutation.isPending ? 'Guardando…' : 'Registrar movimiento'}
          </Button>
        </form>
      </Modal>
    </TenantShell>
  )
}
