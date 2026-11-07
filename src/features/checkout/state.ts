import type { BlockReason } from './domain/sales-gate'
import type { LineProblem } from './domain/pricing'
import type { CheckoutValues } from './schema'

// Estados distinguibles del checkout: un pedido iniciado nunca se presenta como compra confirmada
export type CheckoutState =
  | { status: 'idle' }
  | { status: 'invalid'; message: string; fieldErrors: Record<string, string>; values: CheckoutValues }
  | { status: 'blocked'; reasons: BlockReason[]; values: CheckoutValues }
  | { status: 'problems'; problems: (LineProblem & { name: string })[]; values: CheckoutValues }
  | { status: 'error'; message: string; values: CheckoutValues }
  | { status: 'started'; reference: string; subtotalCents: number; currency: string }
  // Solo en modo prototipo: recorrido completo sin crear pedido ni cobrar nada
  | { status: 'simulated'; subtotalCents: number; currency: string }

export const CHECKOUT_IDLE: CheckoutState = { status: 'idle' }
