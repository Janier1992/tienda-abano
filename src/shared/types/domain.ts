// Tipos de dominio alineados con supabase/migrations. Mantener sincronizados con el esquema.

export type StaffRole = 'cliente' | 'admin' | 'catalogo' | 'pedidos' | 'atencion'
export type StockStatus = 'pendiente' | 'disponible' | 'agotado' | 'consultar'
export type OrderStatus =
  | 'iniciado' | 'pendiente_pago' | 'pago_confirmado' | 'en_preparacion'
  | 'enviado' | 'entregado' | 'cancelado' | 'incidencia'
export type PaymentStatus = 'no_iniciado' | 'pendiente' | 'confirmado' | 'rechazado'
export type RequestType = 'consulta' | 'intencion_compra' | 'soporte_pedido' | 'reclamacion' | 'derivacion_asistente'
export type RequestStatus = 'nuevo' | 'asignado' | 'en_curso' | 'resuelto'

export interface BrandSettings {
  brand_name: string
  tagline: string | null
  description: string | null
  currency: string
  min_age: number
  allowed_regions: string[]
  support_hours: string | null
  support_email: string | null
  support_phone: string | null
  sales_enabled: boolean
  legal_responsible: string | null
  legal_validated_at: string | null
  age_verification_provider: string | null
  payment_provider: string | null
  updated_at: string
}

export interface Category {
  id: string
  slug: string
  name: string
  position: number
  active: boolean
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  position: number
}

export interface Product {
  id: string
  slug: string
  name: string
  category_id: string | null
  description: string | null
  presentation: string | null
  price_cents: number | null
  stock_status: StockStatus
  compliance_notice: string | null
  blocked_regions: string[]
  active: boolean
  updated_at: string
  product_images: ProductImage[]
  // Ficha técnica opcional de la vitola
  brand: string | null
  vitola_galera: string | null
  ring_gauge: number | null
  length_mm: number | null
  strength: number | null
  tasting_notes: string[]
}

export interface Faq {
  id: string
  question: string
  answer: string
  position: number
  published: boolean
  responsible: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string
  conditions: string | null
  availability: string | null
  published: boolean
  responsible: string
  updated_at: string
}

export interface ContentPage {
  slug: string
  title: string
  body: string
  published: boolean
  responsible: string
  updated_at: string
}

export interface Order {
  id: string
  reference: string
  customer_id: string | null
  contact_email: string
  contact_name: string
  region: string
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal_cents: number
  shipping_cents: number | null
  tax_cents: number | null
  total_cents: number | null
  currency: string
  created_at: string
  updated_at: string
}

export interface SupportRequest {
  id: string
  type: RequestType
  status: RequestStatus
  contact_name: string
  contact_email: string
  message: string
  context: Record<string, unknown>
  assistant_summary: string | null
  assigned_to: string | null
  resolution: string | null
  escalation_reason: string | null
  created_at: string
  updated_at: string
}

// Resultado uniforme de lectura: distingue "sin configurar" y "error" de "sin datos".
export type DataResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'no_configurado' }
  | { status: 'error'; message: string }
