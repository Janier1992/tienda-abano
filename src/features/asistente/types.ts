// Formas de salida de herramientas que la interfaz sabe pintar. Compartido cliente/servidor.

export interface ProductHit {
  nombre: string
  url: string
  precio: string
  disponibilidad: string
}

export interface ProductListOutput {
  estado: 'ok'
  productos: ProductHit[]
}

export const HANDOFF_REASONS = [
  'solicitud_usuario', 'reclamacion', 'error_pago_pedido_entrega', 'excepcion', 'consulta_compleja', 'sin_resolver',
] as const

export interface HandoffOutput {
  estado: 'derivacion_preparada'
  motivo: (typeof HANDOFF_REASONS)[number]
  resumen: string
  horario: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// La salida llega por la red: se valida su forma antes de renderizar
export function isProductListOutput(value: unknown): value is ProductListOutput {
  return isRecord(value) && value.estado === 'ok' && Array.isArray(value.productos) &&
    value.productos.every((p) => isRecord(p) && typeof p.nombre === 'string' && typeof p.url === 'string' && p.url.startsWith('/producto/'))
}

export function isHandoffOutput(value: unknown): value is HandoffOutput {
  return isRecord(value) && value.estado === 'derivacion_preparada' && typeof value.resumen === 'string'
}
