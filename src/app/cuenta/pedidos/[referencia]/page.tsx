import { notFound } from 'next/navigation'
import { requireUser } from '@/features/auth/session'
import { getMyOrder } from '@/features/pedidos/account-queries'
import { OrderStatusBadges } from '@/features/pedidos/components/order-status'
import { formatDate } from '@/features/admin/components/checkbox'
import { SupportForm } from '@/features/atencion/support-form'
import { DataState } from '@/shared/components/data-state'
import { Notice } from '@/shared/components/ui/notice'
import { formatMoney } from '@/shared/lib/money'

export default async function MyOrderPage({ params }: { params: Promise<{ referencia: string }> }) {
  const user = await requireUser()
  const { referencia } = await params
  const order = await getMyOrder(user, referencia)

  return (
    <DataState result={order}>
      {(data) => {
        if (!data) notFound()
        const money = (cents: number | null) => (cents === null ? 'Pendiente de cálculo' : formatMoney(cents, data.currency))
        return (
          <>
            <h1>Pedido {data.reference}</h1>
            <OrderStatusBadges status={data.status} payment={data.payment_status} />
            <p className="text-xs text-muted-foreground">Realizado el {formatDate(data.created_at)}</p>
            {data.payment_status !== 'confirmado' && (
              <Notice tone="info" title="Este pedido aún no está pagado">Un pedido solo se confirma cuando la pasarela de pago valida el cobro.</Notice>
            )}
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border text-sm">
              {data.order_items.map((item) => (
                <li key={item.id} className="flex justify-between p-3"><span>{item.quantity} × {item.product_name}</span><span>{money(item.unit_price_cents * item.quantity)}</span></li>
              ))}
            </ul>
            <dl className="grid max-w-sm grid-cols-2 gap-1 text-sm">
              <dt>Subtotal</dt><dd>{money(data.subtotal_cents)}</dd>
              <dt>Envío</dt><dd>{money(data.shipping_cents)}</dd>
              <dt>Impuestos</dt><dd>{money(data.tax_cents)}</dd>
              <dt className="font-semibold">Total</dt><dd className="font-semibold">{money(data.total_cents)}</dd>
            </dl>
            <section className="glass space-y-3 rounded-[1.5rem] p-6">
              <h2 className="text-xl font-semibold">¿Necesitas ayuda con este pedido?</h2>
              <SupportForm context={{ origin: 'pedido', orderReference: data.reference }} defaultType="soporte_pedido" allowTypeChoice={false} />
            </section>
          </>
        )
      }}
    </DataState>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
