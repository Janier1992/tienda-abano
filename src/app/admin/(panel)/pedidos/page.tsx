import Link from 'next/link'
import { requireRole } from '@/features/auth/session'
import { listOrders } from '@/features/admin/queries'
import { formatDate } from '@/features/admin/components/checkbox'
import { ORDER_STATUS_LABELS } from '@/features/pedidos/domain/status'
import { OrderStatusBadges } from '@/features/pedidos/components/order-status'
import { DataState } from '@/shared/components/data-state'
import { formatMoney } from '@/shared/lib/money'
import type { OrderStatus } from '@/shared/types/domain'

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await requireRole(['pedidos'])
  const { estado } = await searchParams
  const status = estado && estado in ORDER_STATUS_LABELS ? (estado as OrderStatus) : undefined
  const orders = await listOrders(status)

  return (
    <>
      <h1 className="text-3xl font-semibold">Pedidos</h1>
      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/pedidos" className={!status ? 'font-semibold underline' : 'underline'}>Todos</Link>
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <Link key={value} href={`/admin/pedidos?estado=${value}`} className={status === value ? 'font-semibold underline' : 'underline'}>{label}</Link>
        ))}
      </nav>
      <DataState result={orders}>
        {(rows) => rows.length === 0 ? <p className="text-muted-foreground">No hay pedidos con este filtro.</p> : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {rows.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <Link href={`/admin/pedidos/${order.id}`} className="font-medium underline">Ref. {order.reference}</Link>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)} · {order.region}</p>
                </div>
                <OrderStatusBadges status={order.status} payment={order.payment_status} />
                <span className="text-sm">{formatMoney(order.total_cents ?? order.subtotal_cents, order.currency)}{order.total_cents === null && ' (subtotal)'}</span>
              </li>
            ))}
          </ul>
        )}
      </DataState>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
