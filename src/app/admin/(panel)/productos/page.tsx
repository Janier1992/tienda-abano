import Link from 'next/link'
import { requireRole } from '@/features/auth/session'
import { getSettings, listProducts } from '@/features/admin/queries'
import { getMissingFields, STOCK_LABELS } from '@/features/catalogo/domain/completeness'
import { DataState, PendingBadge } from '@/shared/components/data-state'
import { ButtonLink } from '@/shared/components/ui/button'
import { formatMoney } from '@/shared/lib/money'

export default async function ProductsPage() {
  await requireRole(['catalogo'])
  const [products, settings] = await Promise.all([listProducts(), getSettings()])
  const currency = settings.status === 'ok' ? settings.data.currency : 'EUR'

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Productos</h1>
        <ButtonLink href="/admin/productos/nuevo">Nuevo producto</ButtonLink>
      </div>
      <DataState result={products}>
        {(rows) => rows.length === 0 ? <p className="text-muted-foreground">Aún no hay productos. Crea el primero con la información oficial de la marca.</p> : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr><th className="p-3">Producto</th><th className="p-3">Precio</th><th className="p-3">Disponibilidad</th><th className="p-3">Estado</th></tr>
              </thead>
              <tbody>
                {rows.map((product) => {
                  const missing = getMissingFields(product)
                  return (
                    <tr key={product.id} className="border-t border-border">
                      <td className="p-3"><Link href={`/admin/productos/${product.id}`} className="font-medium underline">{product.name}</Link></td>
                      <td className="p-3">{product.price_cents === null ? <PendingBadge label="Pendiente" /> : formatMoney(product.price_cents, currency)}</td>
                      <td className="p-3">{STOCK_LABELS[product.stock_status]}</td>
                      <td className="p-3">
                        {product.active ? <span className="text-success">Publicado</span> : <span className="text-muted-foreground">Borrador</span>}
                        {missing.length > 0 && <p className="text-xs text-warning">Falta: {missing.join(', ')}</p>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </DataState>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
