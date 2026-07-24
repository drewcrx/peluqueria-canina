import { useQuery } from '@tanstack/react-query'
import { ArrowDownCircle, ArrowLeft, ArrowUpCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { TenantShell } from '../../components/layout/TenantShell'
import { cardClass } from '../../components/ui/styles'
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
      <Link to="/inventario" className="mb-4 flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Volver a inventario
      </Link>

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {product && (
        <>
          <div className={`mb-6 p-6 ${cardClass}`}>
            <h1 className="font-display text-xl font-semibold text-ink">{product.name}</h1>
            <div className="mt-2 flex gap-6 text-sm text-ink-soft">
              <span>Stock actual: <strong className="text-ink">{product.stockQuantity}</strong></span>
              {product.minStock != null && <span>Mínimo: {product.minStock}</span>}
              {product.unitPrice != null && <span>Precio: ${product.unitPrice.toFixed(2)}</span>}
            </div>
          </div>

          <h2 className="mb-3 font-display font-medium text-ink">Movimientos</h2>

          {product.movements.length === 0 ? (
            <p className="text-ink-soft">Todavía no hay movimientos registrados.</p>
          ) : (
            <div className="space-y-2">
              {product.movements.map((m) => (
                <div key={m.id} className={`flex items-center justify-between px-4 py-3 ${cardClass}`}>
                  <div className="flex items-center gap-3">
                    {m.type === 'In' ? (
                      <ArrowUpCircle className="h-5 w-5 text-sage-dark" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {m.type === 'In' ? 'Entrada' : 'Salida'} · {m.quantity}
                      </p>
                      {m.reason && <p className="text-xs text-ink-soft">{m.reason}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-ink-soft">{formatDate(m.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </TenantShell>
  )
}
