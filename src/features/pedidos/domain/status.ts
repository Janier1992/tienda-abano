import type { OrderStatus, PaymentStatus } from '@/shared/types/domain'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  iniciado: 'Iniciado',
  pendiente_pago: 'Pendiente de pago',
  pago_confirmado: 'Pago confirmado',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  incidencia: 'Con incidencia',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  no_iniciado: 'Pago no iniciado',
  pendiente: 'Pago pendiente de confirmación',
  confirmado: 'Pago confirmado por la pasarela',
  rechazado: 'Pago rechazado',
}

// Estados que exigen pago confirmado (espejo de la restricción paid_states_require_payment)
export const PAID_STATES: OrderStatus[] = ['pago_confirmado', 'en_preparacion', 'enviado', 'entregado']

// Cambios manuales permitidos al personal. 'pago_confirmado' nunca es manual: lo fija la pasarela.
const MANUAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  iniciado: ['cancelado', 'incidencia'],
  pendiente_pago: ['cancelado', 'incidencia'],
  pago_confirmado: ['en_preparacion', 'cancelado', 'incidencia'],
  en_preparacion: ['enviado', 'cancelado', 'incidencia'],
  enviado: ['entregado', 'incidencia'],
  entregado: [],
  cancelado: [],
  incidencia: ['en_preparacion', 'enviado', 'entregado', 'cancelado'],
}

export function getAllowedTransitions(status: OrderStatus, payment: PaymentStatus): OrderStatus[] {
  return MANUAL_TRANSITIONS[status].filter(
    (next) => next !== 'pago_confirmado' && (!PAID_STATES.includes(next) || payment === 'confirmado'),
  )
}

export function canTransition(status: OrderStatus, payment: PaymentStatus, next: OrderStatus): boolean {
  return getAllowedTransitions(status, payment).includes(next)
}
