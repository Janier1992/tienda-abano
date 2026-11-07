import Link from 'next/link'
import { requireUser } from '@/features/auth/session'
import { listMyOrders } from '@/features/pedidos/account-queries'
import { OrderStatusBadges } from '@/features/pedidos/components/order-status'
import { formatDate } from '@/features/admin/components/checkbox'
import { DataState } from '@/shared/components/data-state'

export default async function MyOrdersPage() {
  const user = await requireUser()
  const orders = await listMyOrders(user)

  return (
    <>
      <h1>Mis pedidos</h1>
      <DataState result={orders}>
        {(rows) => rows.length === 0 ? <p className="text-muted-foreground">Todavía no tienes pedidos asociados a esta cuenta.</p> : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {rows.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <Link href={`/cuenta/pedidos/${order.reference}`} className="font-display text-2xl transition hover:text-primary">Pedido {order.reference}</Link>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <OrderStatusBadges status={order.status} payment={order.payment_status} />
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
