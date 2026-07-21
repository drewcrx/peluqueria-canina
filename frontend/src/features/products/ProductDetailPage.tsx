import { useQuery } from '@tanstack/react-query'
import { ArrowDownCircle, ArrowLeft, ArrowUpCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { TenantShell } from '../../components/layout/TenantShell'
import { getProductDetail } from './api'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  )
}

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductDetail(productId!),
    enabled: Boolean(productId),
  })

  return (
    <TenantShell>
      <Link to="/inventario" className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Volver a inventario
      </Link>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}

      {product && (
        <>
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{product.name}</h1>
            <div className="mt-2 flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <span>Stock actual: <strong className="text-slate-700 dark:text-slate-200">{product.stockQuantity}</strong></span>
              {product.minStock != null && <span>Mínimo: {product.minStock}</span>}
              {product.unitPrice != null && <span>Precio: ${product.unitPrice.toFixed(2)}</span>}
            </div>
          </div>

          <h2 className="mb-3 font-medium text-slate-900 dark:text-slate-50">Movimientos</h2>

          {product.movements.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">Todavía no hay movimientos registrados.</p>
          ) : (
            <div className="space-y-2">
              {product.movements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    {m.type === 'In' ? (
                      <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {m.type === 'In' ? 'Entrada' : 'Salida'} · {m.quantity}
                      </p>
                      {m.reason && <p className="text-xs text-slate-500 dark:text-slate-400">{m.reason}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-600">{formatDate(m.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </TenantShell>
  )
}
