'use server'
import type { BrandSettings } from '@/shared/types/domain'
import { getCurrentUser } from '@/features/auth/session'
import { createServiceClient } from '@/shared/lib/supabase/server'
import { checkRateLimit, clientKey } from '@/shared/lib/rate-limit'
import { isDemoMode, isSupabaseConfigured } from '@/shared/lib/env'
import { DEMO_PRODUCTS, DEMO_SETTINGS } from '@/shared/lib/demo/fixtures'
import { toFieldErrors } from '@/shared/lib/action-state'
import { log } from '@/shared/lib/logger'
import { evaluateSalesGate } from './domain/sales-gate'
import { priceLines } from './domain/pricing'
import { type CheckoutInput, checkoutSchema, readCheckoutForm } from './schema'
import type { CheckoutState } from './state'

const UNAVAILABLE = 'El servicio de pedidos aún no está configurado. Puedes dejar tu solicitud a un asesor.'

// Inicia un pedido. Nunca lo confirma: el pago solo lo confirma la pasarela mediante webhook.
export async function startCheckout(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const { input, values } = readCheckoutForm(formData)
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { status: 'invalid', message: 'Revisa los campos marcados.', fieldErrors: toFieldErrors(parsed.error.issues), values }
  }
  if (isDemoMode()) return simulateCheckout(parsed.data)
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return { status: 'error', message: UNAVAILABLE, values }
  if (!checkRateLimit(await clientKey('checkout'), 10, 10 * 60_000)) {
    return { status: 'error', message: 'Demasiados intentos seguidos. Espera unos minutos.', values }
  }

  try {
    const db = createServiceClient()
    // Lectura directa (sin caché) para que una desactivación de ventas se aplique de inmediato
    const { data: settings, error } = await db.from('brand_settings').select('*').eq('id', 1).single()
    if (error || !settings) throw new Error(error?.message ?? 'sin configuración')

    const reasons = evaluateSalesGate(settings as BrandSettings, parsed.data.region)
    if (reasons.length > 0) return { status: 'blocked', reasons, values }

    const { data: products, error: productsError } = await db
      .from('products')
      .select('id, name, price_cents, stock_status, active, blocked_regions')
      .in('id', parsed.data.lines.map((line) => line.productId))
    if (productsError) throw new Error(productsError.message)

    const priced = priceLines(parsed.data.lines, products ?? [], parsed.data.region)
    if (priced.problems.length > 0) {
      const names = new Map((products ?? []).map((p) => [p.id, p.name as string]))
      return { status: 'problems', problems: priced.problems.map((p) => ({ ...p, name: names.get(p.productId) ?? 'Un producto' })), values }
    }

    const reference = await insertOrder(parsed.data, priced, (settings as BrandSettings).currency)
    return { status: 'started', reference, subtotalCents: priced.subtotalCents, currency: (settings as BrandSettings).currency }
  } catch (error) {
    log('error', 'checkout', 'No se pudo iniciar el pedido', { error: String(error) })
    return { status: 'error', message: 'No pudimos registrar tu pedido. No se ha realizado ningún cargo. Inténtalo de nuevo.', values }
  }
}

// Prototipo: recalcula con los productos ilustrativos y no persiste nada
function simulateCheckout(data: CheckoutInput): CheckoutState {
  const priced = priceLines(data.lines, DEMO_PRODUCTS, data.region)
  return { status: 'simulated', subtotalCents: priced.subtotalCents, currency: DEMO_SETTINGS.currency }
}

// Pedido y líneas en una sola transacción (función create_order de la base de datos)
async function insertOrder(data: CheckoutInput, priced: ReturnType<typeof priceLines>, currency: string): Promise<string> {
  const user = await getCurrentUser()
  const order = {
    customer_id: user?.id ?? null,
    contact_name: data.contactName,
    contact_email: data.contactEmail,
    shipping_address: { line1: data.line1, line2: data.line2 ?? null, city: data.city, postalCode: data.postalCode, country: data.country },
    region: data.region,
    subtotal_cents: priced.subtotalCents,
    currency,
  }
  const items = priced.lines.map((line) => ({
    product_id: line.productId, product_name: line.productName,
    unit_price_cents: line.unitPriceCents, quantity: line.quantity,
  }))
  const { data: rows, error } = await createServiceClient().rpc('create_order', { p_order: order, p_items: items })
  const created = (rows as { id: string; reference: string }[] | null)?.[0]
  if (error || !created) throw new Error(error?.message ?? 'pedido no creado')
  return created.reference
}
