import { z } from 'zod'
import { parseMoneyToCents } from '@/shared/lib/money'
import { parseRegions } from './domain/settings'

const SLUG = /^[a-z0-9-]+$/
const blankToNull = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? null : value)

const optionalText = (max: number) => z.preprocess(blankToNull, z.string().trim().max(max).nullable())
const requiredText = (label: string, max: number) => z.string().trim().min(1, `${label} es obligatorio`).max(max)
const checkbox = z.preprocess((value) => value === 'on' || value === 'true', z.boolean())
const slug = z.string().trim().regex(SLUG, 'Solo minúsculas, números y guiones').max(120)
const regions = z.preprocess((value) => parseRegions(String(value ?? '')), z.array(z.string().max(20)).max(100))

// Precio opcional: vacío = pendiente; si se indica, debe ser un importe válido
const price = z.preprocess(blankToNull, z.string().nullable()).transform((value, ctx) => {
  if (value === null) return null
  const cents = parseMoneyToCents(value)
  if (cents === null) {
    ctx.addIssue({ code: 'custom', message: 'Importe no válido (ej.: 12,50)' })
    return z.NEVER
  }
  return cents
})

export const productSchema = z.object({
  name: requiredText('El nombre', 200),
  slug,
  category_id: z.preprocess(blankToNull, z.uuid().nullable()),
  description: optionalText(5000),
  presentation: optionalText(300),
  price_cents: price,
  stock_status: z.enum(['pendiente', 'disponible', 'agotado', 'consultar']),
  compliance_notice: optionalText(1000),
  blocked_regions: regions,
  active: checkbox,
})

export const categorySchema = z.object({
  name: requiredText('El nombre', 120),
  slug,
  position: z.coerce.number().int().min(0).max(999),
  active: checkbox,
})

export const faqSchema = z.object({
  question: requiredText('La pregunta', 300),
  answer: requiredText('La respuesta', 5000),
  position: z.coerce.number().int().min(0).max(999),
  published: checkbox,
  responsible: requiredText('El responsable', 120),
})

export const serviceSchema = z.object({
  name: requiredText('El nombre', 200),
  description: requiredText('La descripción', 5000),
  conditions: optionalText(3000),
  availability: optionalText(500),
  published: checkbox,
  responsible: requiredText('El responsable', 120),
})

export const pageSchema = z.object({
  slug,
  title: requiredText('El título', 200),
  body: requiredText('El contenido', 30000),
  published: checkbox,
  responsible: requiredText('El responsable', 120),
})

export const settingsSchema = z.object({
  brand_name: requiredText('El nombre de la marca', 120),
  tagline: optionalText(200),
  description: optionalText(2000),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, 'Código ISO de 3 letras (ej.: EUR)'),
  min_age: z.coerce.number().int().min(18, 'La edad mínima no puede ser inferior a 18').max(25),
  allowed_regions: regions,
  support_hours: optionalText(200),
  support_email: z.preprocess(blankToNull, z.email('Correo no válido').nullable()),
  support_phone: optionalText(40),
  legal_responsible: optionalText(200),
  legal_validated_at: z.preprocess(blankToNull, z.iso.date('Fecha no válida').nullable()),
  age_verification_provider: optionalText(120),
  payment_provider: optionalText(120),
  sales_enabled: checkbox,
})

export const orderStatusSchema = z.object({
  status: z.enum(['iniciado', 'pendiente_pago', 'pago_confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado', 'incidencia']),
})

export const requestUpdateSchema = z
  .object({
    status: z.enum(['nuevo', 'asignado', 'en_curso', 'resuelto']),
    assigned_to: z.preprocess(blankToNull, z.uuid().nullable()),
    resolution: optionalText(4000),
    escalation_reason: optionalText(1000),
  })
  .refine((data) => data.status !== 'resuelto' || data.resolution, {
    message: 'Indica la resolución antes de marcar como resuelto',
    path: ['resolution'],
  })

export const noteSchema = z.object({ body: requiredText('La nota', 4000) })

export const roleSchema = z.object({
  user_id: z.uuid(),
  role: z.enum(['cliente', 'admin', 'catalogo', 'pedidos', 'atencion']),
})

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
