import type { OrderStatus, PaymentStatus } from '@/shared/types/domain'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../domain/status'

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  no_iniciado: 'border-border-strong text-muted-foreground [&>i]:bg-muted-foreground',
  pendiente: 'border-warning/30 bg-warning/[0.08] text-warning [&>i]:bg-warning',
  confirmado: 'border-success/30 bg-success/[0.08] text-success [&>i]:bg-success',
  rechazado: 'border-danger/30 bg-danger/[0.08] text-danger [&>i]:bg-danger',
}

const CHIP = 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium'

// Estado del pedido y estado del pago se muestran siempre por separado para no confundirlos
export function OrderStatusBadges({ status, payment }: { status: OrderStatus; payment: PaymentStatus }) {
  return (
    <span className="inline-flex flex-wrap gap-2 text-xs">
      <span className={`${CHIP} border-border-strong bg-surface/60 text-foreground`}>
        <i aria-hidden className="size-1.5 rounded-full bg-primary" />Pedido: {ORDER_STATUS_LABELS[status]}
      </span>
      <span className={`${CHIP} ${PAYMENT_TONE[payment]}`}>
        <i aria-hidden className="size-1.5 rounded-full" />{PAYMENT_STATUS_LABELS[payment]}
      </span>
    </span>
  )
}
