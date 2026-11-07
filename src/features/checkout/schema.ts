import { z } from 'zod'
import { MAX_QUANTITY } from '@/features/carrito/domain/cart'

// El cliente solo envía qué productos y cuántos; el precio nunca viaja desde el navegador
export const checkoutLineSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
})

export const checkoutSchema = z.object({
  contactName: z.string().trim().min(2, 'Indica tu nombre completo').max(120),
  contactEmail: z.email('Indica un correo válido').max(200),
  line1: z.string().trim().min(3, 'Indica la dirección de entrega').max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, 'Indica la ciudad').max(120),
  postalCode: z.string().trim().min(3, 'Indica el código postal').max(12),
  country: z.string().trim().min(2, 'Indica el país').max(80),
  region: z.string().trim().min(1, 'Selecciona la región de entrega').max(20),
  ageDeclaration: z.literal(true, { error: 'Debes declarar que cumples la edad mínima' }),
  termsAccepted: z.literal(true, { error: 'Debes aceptar las condiciones de compra' }),
  lines: z.array(checkoutLineSchema).min(1, 'El carrito está vacío').max(50),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

// Campos de texto que se devuelven al formulario para corregir sin volver a escribir
export const CHECKOUT_TEXT_FIELDS = ['contactName', 'contactEmail', 'line1', 'line2', 'city', 'postalCode', 'country', 'region'] as const
export type CheckoutValues = Partial<Record<(typeof CHECKOUT_TEXT_FIELDS)[number], string>>

export function readCheckoutForm(formData: FormData): { input: Record<string, unknown>; values: CheckoutValues } {
  const values: CheckoutValues = {}
  for (const field of CHECKOUT_TEXT_FIELDS) {
    const value = formData.get(field)
    if (typeof value === 'string' && value.trim() !== '') values[field] = value
  }
  let lines: unknown = []
  try {
    lines = JSON.parse(String(formData.get('lines') ?? '[]'))
  } catch {
    lines = null
  }
  // Los campos vacíos se validan como cadena vacía para mostrar los mensajes en español, no el genérico de tipo
  const text = Object.fromEntries(CHECKOUT_TEXT_FIELDS.map((field) => [field, values[field] ?? '']))
  if (!values.line2) delete text.line2
  return {
    values,
    input: { ...text, lines, ageDeclaration: formData.get('ageDeclaration') === 'on', termsAccepted: formData.get('termsAccepted') === 'on' },
  }
}

export const LINE_PROBLEM_MESSAGES = {
  no_encontrado: 'ya no está disponible en el catálogo',
  no_disponible: 'no tiene disponibilidad en este momento',
  sin_precio: 'no tiene un precio confirmado',
  bloqueado_region: 'no puede enviarse a la región indicada',
  cantidad_invalida: 'tiene una cantidad no válida',
} as const
