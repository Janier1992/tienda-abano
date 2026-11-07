import { notFound } from 'next/navigation'
import { requireRole } from '@/features/auth/session'
import { getOrder, type OrderDetail } from '@/features/admin/queries'
import { updateOrderStatus } from '@/features/admin/operations-actions'
import { AdminForm } from '@/features/admin/components/admin-form'
import { formatDate } from '@/features/admin/components/checkbox'
import { getAllowedTransitions, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/features/pedidos/domain/status'
import { OrderStatusBadges } from '@/features/pedidos/components/order-status'
import { DataState } from '@/shared/components/data-state'
import { Select } from '@/shared/components/ui/field'
import { Notice } from '@/shared/components/ui/notice'
import { formatMoney } from '@/shared/lib/money'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(['pedidos'])
  const { id } = await params
  const order = await getOrder(id)

  return (
    <DataState result={order}>
      {(data) => {
        if (!data) notFound()
        const money = (cents: number | null) => (cents === null ? 'Pendiente de cálculo' : formatMoney(cents, data.currency))
        return (
          <>
            <h1 className="text-3xl font-semibold">Pedido {data.reference}</h1>
            <OrderStatusBadges status={data.status} payment={data.payment_status} />
            <p className="text-xs text-muted-foreground">Creado {formatDate(data.created_at)} · Actualizado {formatDate(data.updated_at)}</p>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border p-4 text-sm">
                <h2 className="mb-2 text-xl font-semibold">Cliente y entrega</h2>
                <p>{data.contact_name} · {data.contact_email}</p>
                <p>Región: {data.region}</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{Object.values(data.shipping_address).filter(Boolean).join('\n')}</pre>
              </div>
              <div className="rounded-lg border border-border p-4 text-sm">
                <h2 className="mb-2 text-xl font-semibold">Pago</h2>
                <p>{PAYMENT_STATUS_LABELS[data.payment_status]}</p>
                <p className="text-muted-foreground">Referencia de pasarela: {data.payment_reference ?? '—'}</p>
                <p className="mt-2 text-xs text-muted-foreground">El estado de pago es de solo lectura: solo lo confirma la pasarela de pago.</p>
              </div>
            </section>

            <table className="w-full rounded-lg border border-border text-sm">
              <thead className="bg-muted text-left"><tr><th className="p-2">Producto</th><th className="p-2">Precio unitario</th><th className="p-2">Cantidad</th></tr></thead>
              <tbody>
                {data.order_items.map((item) => (
                  <tr key={item.id} className="border-t border-border"><td className="p-2">{item.product_name}</td><td className="p-2">{money(item.unit_price_cents)}</td><td className="p-2">{item.quantity}</td></tr>
                ))}
              </tbody>
            </table>
            <dl className="grid max-w-sm grid-cols-2 gap-1 text-sm">
              <dt>Subtotal</dt><dd>{money(data.subtotal_cents)}</dd>
              <dt>Envío</dt><dd>{money(data.shipping_cents)}</dd>
              <dt>Impuestos</dt><dd>{money(data.tax_cents)}</dd>
              <dt className="font-semibold">Total</dt><dd className="font-semibold">{money(data.total_cents)}</dd>
            </dl>

            <StatusSection order={data} />
          </>
        )
      }}
    </DataState>
  )
}

// Solo ofrece las transiciones manuales permitidas; el pago no se gestiona aquí
function StatusSection({ order: data }: { order: OrderDetail }) {
  const transitions = getAllowedTransitions(data.status, data.payment_status)
  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-xl font-semibold">Actualizar estado</h2>
      {transitions.length === 0 ? (
        <Notice title="Sin cambios manuales disponibles">
          {data.payment_status === 'confirmado' ? 'El pedido está en un estado final.' : 'Los siguientes pasos dependen de que la pasarela confirme el pago.'}
        </Notice>
      ) : (
        <AdminForm action={updateOrderStatus.bind(null, data.id)} submitLabel="Aplicar estado">
          <Select label="Nuevo estado" name="status" defaultValue={transitions[0]}>
            {transitions.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}
          </Select>
          {data.payment_status === 'confirmado' && <p className="text-xs text-muted-foreground">Cancelar un pedido pagado no devuelve el dinero: el reembolso se gestiona en la pasarela.</p>}
        </AdminForm>
      )}
    </section>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
