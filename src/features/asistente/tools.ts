import 'server-only'
import { tool } from 'ai'
import { z } from 'zod'
import type { BrandSettings, OrderStatus, PaymentStatus, Product } from '@/shared/types/domain'
import { getActiveProducts, getProductBySlug } from '@/features/catalogo/data'
import { getFaqs, getPage, getPublishedPages, getServices } from '@/features/contenido/data'
import { fuzzySearch } from '@/features/catalogo/domain/search'
import { STOCK_LABELS } from '@/features/catalogo/domain/completeness'
import { BLOCK_MESSAGES, evaluateSalesGate } from '@/features/checkout/domain/sales-gate'
import { getCurrentUser } from '@/features/auth/session'
import { createSessionClient } from '@/shared/lib/supabase/server'
import { formatMoney } from '@/shared/lib/money'
import { log } from '@/shared/lib/logger'
import { HANDOFF_REASONS, type HandoffOutput, type ProductHit } from './types'

type Unavailable = { estado: 'no_configurado' | 'error' | 'sin_datos'; mensaje: string }

const UNAVAILABLE: Record<'no_configurado' | 'error', Unavailable> = {
  no_configurado: { estado: 'no_configurado', mensaje: 'La fuente oficial de esta información aún no está configurada.' },
  error: { estado: 'error', mensaje: 'La fuente oficial no respondió. Se puede intentar más tarde o hablar con un asesor.' },
}

const sinDatos = (mensaje: string): Unavailable => ({ estado: 'sin_datos', mensaje })

// Las herramientas nunca lanzan: un fallo se comunica como estado explícito
async function guarded<T>(name: string, run: () => Promise<T | Unavailable>): Promise<T | Unavailable> {
  try {
    return await run()
  } catch (error) {
    log('error', 'asistente', `Fallo en herramienta ${name}`, { error: error instanceof Error ? error.name : 'desconocido' })
    return UNAVAILABLE.error
  }
}

function priceLabel(cents: number | null, currency: string | undefined): string {
  if (cents === null || !currency) return 'Precio no publicado'
  return formatMoney(cents, currency)
}

function toHit(product: Product, currency: string | undefined): ProductHit {
  return {
    nombre: product.name,
    url: `/producto/${product.slug}`,
    precio: priceLabel(product.price_cents, currency),
    disponibilidad: STOCK_LABELS[product.stock_status],
  }
}

const ORDER_LABELS: Record<OrderStatus, string> = {
  iniciado: 'Pedido iniciado (no confirmado)',
  pendiente_pago: 'Pendiente de pago (no confirmado)',
  pago_confirmado: 'Pago confirmado por la pasarela',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  incidencia: 'Con incidencia en revisión',
}

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  no_iniciado: 'Pago no iniciado',
  pendiente: 'Pago pendiente: aún no confirmado',
  confirmado: 'Pago confirmado',
  rechazado: 'Pago rechazado',
}

function catalogTools(settings: BrandSettings | null) {
  const currency = settings?.currency
  return {
    buscarProductos: tool({
      description: 'Busca productos activos del catálogo oficial por nombre, presentación o descripción. Tolera errores de escritura.',
      inputSchema: z.object({ consulta: z.string().min(1).max(100) }),
      execute: ({ consulta }) => guarded('buscarProductos', async () => {
        const result = await getActiveProducts()
        if (result.status !== 'ok') return UNAVAILABLE[result.status]
        const found = fuzzySearch(result.data, consulta, (p) => `${p.name} ${p.presentation ?? ''} ${p.description ?? ''}`)
        if (found.length === 0) return sinDatos('No hay productos del catálogo que coincidan con la búsqueda.')
        return { estado: 'ok' as const, productos: found.slice(0, 6).map((p) => toHit(p, currency)) }
      }),
    }),
    verProducto: tool({
      description: 'Obtiene la ficha oficial de un producto por su slug (identificador de la URL).',
      inputSchema: z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(120) }),
      execute: ({ slug }) => guarded('verProducto', async () => {
        const result = await getProductBySlug(slug)
        if (result.status !== 'ok') return UNAVAILABLE[result.status]
        if (!result.data) return sinDatos('Ese producto no está disponible en el catálogo.')
        const p = result.data
        return {
          estado: 'ok' as const,
          ...toHit(p, currency),
          descripcion: p.description ?? 'Descripción no publicada',
          presentacion: p.presentation ?? 'Presentación no publicada',
          aviso: p.compliance_notice,
        }
      }),
    }),
  }
}

function contentTools() {
  return {
    preguntasFrecuentes: tool({
      description: 'Devuelve preguntas frecuentes oficiales publicadas, opcionalmente filtradas por tema.',
      inputSchema: z.object({ tema: z.string().max(100).optional() }),
      execute: ({ tema }) => guarded('preguntasFrecuentes', async () => {
        const result = await getFaqs()
        if (result.status !== 'ok') return UNAVAILABLE[result.status]
        const faqs = tema ? fuzzySearch(result.data, tema, (f) => `${f.question} ${f.answer}`) : result.data
        if (faqs.length === 0) return sinDatos('No hay una pregunta frecuente oficial sobre ese tema.')
        return { estado: 'ok' as const, preguntas: faqs.slice(0, 8).map((f) => ({ pregunta: f.question, respuesta: f.answer })) }
      }),
    }),
    verServicios: tool({
      description: 'Lista los servicios que la marca ha publicado oficialmente.',
      inputSchema: z.object({}),
      execute: () => guarded('verServicios', async () => {
        const result = await getServices()
        if (result.status !== 'ok') return UNAVAILABLE[result.status]
        if (result.data.length === 0) return sinDatos('La marca no ha publicado servicios.')
        return {
          estado: 'ok' as const,
          servicios: result.data.map((s) => ({ nombre: s.name, descripcion: s.description, condiciones: s.conditions, disponibilidad: s.availability })),
        }
      }),
    }),
    listarPoliticas: tool({
      description: 'Lista las políticas y páginas legales publicadas (envíos, devoluciones, privacidad, etc.) con su slug.',
      inputSchema: z.object({}),
      execute: () => guarded('listarPoliticas', async () => {
        const result = await getPublishedPages()
        if (result.status !== 'ok') return UNAVAILABLE[result.status]
        if (result.data.length === 0) return sinDatos('Aún no hay políticas publicadas.')
        return { estado: 'ok' as const, politicas: result.data.map((p) => ({ slug: p.slug, titulo: p.title, url: `/politicas/${p.slug}` })) }
      }),
    }),
    verPolitica: tool({
      description: 'Obtiene el texto oficial de una política publicada por su slug (usa listarPoliticas para conocer los slugs).',
      inputSchema: z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(80) }),
      execute: ({ slug }) => guarded('verPolitica', async () => {
        const result = await getPage(slug)
        if (result.status !== 'ok') return UNAVAILABLE[result.status]
        if (!result.data) return sinDatos('Esa política no está publicada.')
        return { estado: 'ok' as const, titulo: result.data.title, texto: result.data.body.slice(0, 4000), url: `/politicas/${slug}` }
      }),
    }),
  }
}

function salesTools(settings: BrandSettings | null) {
  return {
    estadoCompra: tool({
      description: 'Explica si la compra online está habilitada y qué condiciones faltan. No depende de la región del usuario.',
      inputSchema: z.object({}),
      execute: async () => {
        if (!settings) return UNAVAILABLE.no_configurado
        // Se excluye la región: el asistente no la conoce y no debe suponerla
        const reasons = evaluateSalesGate(settings, null).filter((r) => r !== 'region_no_habilitada')
        if (reasons.length > 0) return { estado: 'ok' as const, ventaOnline: false, motivos: reasons.map((r) => BLOCK_MESSAGES[r]) }
        return {
          estado: 'ok' as const,
          ventaOnline: true,
          nota: 'La región de entrega y la verificación de edad se validan en el proceso de compra.',
        }
      },
    }),
  }
}

function orderTools() {
  return {
    estadoPedido: tool({
      description: 'Consulta el estado de un pedido del usuario con sesión iniciada, por su referencia.',
      inputSchema: z.object({ referencia: z.string().trim().max(20) }),
      execute: ({ referencia }) => guarded('estadoPedido', async () => {
        const reference = referencia.toUpperCase()
        if (!/^[A-Z0-9]{6,20}$/.test(reference)) return sinDatos('La referencia no tiene un formato válido.')
        const user = await getCurrentUser()
        if (!user) return { estado: 'requiere_sesion' as const, mensaje: 'Para consultar un pedido hay que iniciar sesión en /ingresar con la cuenta que lo realizó.' }
        // Filtro explícito por cliente: incluso el personal solo consulta sus propios pedidos aquí
        const { data, error } = await (await createSessionClient())
          .from('orders')
          .select('reference, status, payment_status, created_at')
          .eq('reference', reference)
          .eq('customer_id', user.id)
          .maybeSingle()
        if (error) throw new Error(error.message)
        if (!data) return sinDatos('No hay un pedido con esa referencia en la cuenta con sesión iniciada.')
        return {
          estado: 'ok' as const,
          referencia: data.reference,
          estadoPedido: ORDER_LABELS[data.status as OrderStatus],
          estadoPago: PAYMENT_LABELS[data.payment_status as PaymentStatus],
          fecha: new Date(data.created_at).toLocaleDateString('es-ES'),
        }
      }),
    }),
  }
}

function handoffTools(settings: BrandSettings | null) {
  return {
    prepararDerivacion: tool({
      description: 'Prepara la transferencia a una persona del equipo. No envía nada: muestra un formulario donde el usuario da su consentimiento.',
      inputSchema: z.object({
        motivo: z.enum(HANDOFF_REASONS),
        resumen: z.string().min(5).max(1500).describe('Motivo de contacto y datos que el usuario ya proporcionó'),
      }),
      execute: async ({ motivo, resumen }): Promise<HandoffOutput & { mensaje: string }> => ({
        estado: 'derivacion_preparada',
        motivo,
        resumen,
        horario: settings?.support_hours ?? null,
        mensaje: 'Se mostró un formulario para que el usuario confirme sus datos y consentimiento. El equipo responderá por correo; no hay un plazo publicado.',
      }),
    }),
  }
}

export function createAssistantTools(settings: BrandSettings | null) {
  return {
    ...catalogTools(settings),
    ...contentTools(),
    ...salesTools(settings),
    ...orderTools(),
    ...handoffTools(settings),
  }
}
