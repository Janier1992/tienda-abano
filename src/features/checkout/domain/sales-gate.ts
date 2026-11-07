import type { BrandSettings } from '@/shared/types/domain'

// Motivos por los que no se puede completar una compra. Cada uno tiene mensaje y siguiente paso.
export type BlockReason =
  | 'ventas_deshabilitadas'
  | 'region_no_habilitada'
  | 'verificacion_edad_no_disponible'
  | 'pago_no_disponible'

export const BLOCK_MESSAGES: Record<BlockReason, string> = {
  ventas_deshabilitadas:
    'La venta online aún no está habilitada: la marca está completando la validación legal. Puedes dejar tu solicitud y un asesor te contactará.',
  region_no_habilitada:
    'No podemos ofrecer la compra online en la región indicada. Puedes consultar alternativas con un asesor.',
  verificacion_edad_no_disponible:
    'La verificación de mayoría de edad exigida para comprar no está disponible todavía.',
  pago_no_disponible: 'No hay un medio de pago autorizado disponible en este momento.',
}

type GateSettings = Pick<
  BrandSettings,
  'sales_enabled' | 'allowed_regions' | 'legal_validated_at' | 'age_verification_provider' | 'payment_provider'
>

// Evalúa si una compra puede iniciarse. Se ejecuta siempre en servidor antes de crear un pedido.
export function evaluateSalesGate(settings: GateSettings, region: string | null): BlockReason[] {
  const reasons: BlockReason[] = []
  if (!settings.sales_enabled || !settings.legal_validated_at) {
    reasons.push('ventas_deshabilitadas')
    return reasons
  }
  if (!region || !settings.allowed_regions.includes(region)) reasons.push('region_no_habilitada')
  if (!settings.age_verification_provider) reasons.push('verificacion_edad_no_disponible')
  if (!settings.payment_provider) reasons.push('pago_no_disponible')
  return reasons
}
