import { z } from 'zod'

// Contexto autorizado que acompaña a una solicitud para que el cliente no repita información
export const requestContextSchema = z.object({
  productSlug: z.string().max(120).optional(),
  orderReference: z.string().max(20).optional(),
  cart: z.array(z.object({ productId: z.string().max(64), name: z.string().max(200), quantity: z.number().int().min(1).max(99) })).max(50).optional(),
  region: z.string().max(20).optional(),
  origin: z.enum(['contacto', 'producto', 'carrito', 'checkout', 'pedido', 'asistente']),
})

export const supportRequestSchema = z.object({
  type: z.enum(['consulta', 'intencion_compra', 'soporte_pedido', 'reclamacion', 'derivacion_asistente']),
  contactName: z.string().trim().min(2, 'Indica tu nombre').max(120),
  contactEmail: z.email('Indica un correo válido').max(200),
  message: z.string().trim().min(5, 'Cuéntanos brevemente tu consulta').max(4000),
  consent: z.literal(true, { error: 'Necesitamos tu consentimiento para responderte' }),
  context: requestContextSchema,
  assistantSummary: z.string().max(2000).optional(),
})

export type SupportRequestInput = z.infer<typeof supportRequestSchema>

export const REQUEST_TYPE_LABELS = {
  consulta: 'Consulta',
  intencion_compra: 'Intención de compra',
  soporte_pedido: 'Soporte de pedido',
  reclamacion: 'Reclamación',
  derivacion_asistente: 'Derivación desde el asistente',
} as const
