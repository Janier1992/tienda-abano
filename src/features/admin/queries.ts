import 'server-only'
import type { BrandSettings, Category, Order, Product, RequestStatus, StaffRole, SupportRequest } from '@/shared/types/domain'
import { safeRead, unwrap } from '@/shared/lib/data-result'
import { createServiceClient, createSessionClient } from '@/shared/lib/supabase/server'
import { getMissingFields } from '@/features/catalogo/domain/completeness'
import { hasRole, type CurrentUser } from '@/features/auth/session'
import { CONTENT_TYPES, type ContentType } from './content-config'

// Lecturas del panel: siempre con la sesión del usuario, así RLS limita lo que cada rol ve
const PRODUCT_FIELDS = '*, product_images(id, url, alt, position)'

export interface Dashboard {
  newRequests: number | null
  pendingOrders: number | null
  incompleteProducts: number | null
}

async function countRows(table: string, column: string, values: string[]): Promise<number> {
  const supabase = await createSessionClient()
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true }).in(column, values)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export const getDashboard = (user: CurrentUser) =>
  safeRead<Dashboard>('admin', async () => ({
    newRequests: hasRole(user, ['atencion']) ? await countRows('support_requests', 'status', ['nuevo']) : null,
    pendingOrders: hasRole(user, ['pedidos']) ? await countRows('orders', 'status', ['pendiente_pago', 'pago_confirmado', 'en_preparacion', 'incidencia']) : null,
    incompleteProducts: hasRole(user, ['catalogo'])
      ? (await fetchProducts()).filter((product) => getMissingFields(product).length > 0).length
      : null,
  }))

async function fetchProducts(): Promise<Product[]> {
  const supabase = await createSessionClient()
  return unwrap(await supabase.from('products').select(PRODUCT_FIELDS).order('updated_at', { ascending: false })) as Product[]
}

export const listProducts = () => safeRead('admin', fetchProducts)

export const getProduct = (id: string) =>
  safeRead('admin', async () => {
    const supabase = await createSessionClient()
    const { data, error } = await supabase.from('products').select(PRODUCT_FIELDS).eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    const product = data as Product
    return { ...product, product_images: [...product.product_images].sort((a, b) => a.position - b.position) }
  })

export const listCategories = () =>
  safeRead('admin', async () => {
    const supabase = await createSessionClient()
    return unwrap(await supabase.from('categories').select('*').order('position')) as Category[]
  })

export interface OrderItem {
  id: string
  product_name: string
  unit_price_cents: number
  quantity: number
}

export type OrderDetail = Order & { order_items: OrderItem[]; shipping_address: Record<string, unknown>; payment_reference: string | null }

export const listOrders = (status?: string) =>
  safeRead('admin', async () => {
    const supabase = await createSessionClient()
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200)
    if (status) query = query.eq('status', status)
    return unwrap(await query) as Order[]
  })

export const getOrder = (id: string) =>
  safeRead('admin', async () => {
    const supabase = await createSessionClient()
    const { data, error } = await supabase.from('orders').select('*, order_items(id, product_name, unit_price_cents, quantity)').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data as OrderDetail | null
  })

export interface SupportNote {
  id: string
  body: string
  author_id: string
  created_at: string
}

export const listRequests = (status?: RequestStatus) =>
  safeRead('admin', async () => {
    const supabase = await createSessionClient()
    let query = supabase.from('support_requests').select('*').order('created_at', { ascending: false }).limit(200)
    if (status) query = query.eq('status', status)
    return unwrap(await query) as SupportRequest[]
  })

export const getRequest = (id: string) =>
  safeRead('admin', async () => {
    const supabase = await createSessionClient()
    const { data, error } = await supabase.from('support_requests').select('*, support_notes(id, body, author_id, created_at)').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data as (SupportRequest & { support_notes: SupportNote[] }) | null
  })

export const listContent = (type: ContentType) =>
  safeRead('admin', async () => {
    const { table } = CONTENT_TYPES[type]
    const supabase = await createSessionClient()
    return unwrap(await supabase.from(table).select('*').order('updated_at', { ascending: false })) as Record<string, unknown>[]
  })

export const getContent = (type: ContentType, id: string) =>
  safeRead('admin', async () => {
    const { table, key } = CONTENT_TYPES[type]
    const supabase = await createSessionClient()
    const { data, error } = await supabase.from(table).select('*').eq(key, id).maybeSingle()
    if (error) throw new Error(error.message)
    return data as Record<string, unknown> | null
  })

export const getSettings = () =>
  safeRead('admin', async () => {
    const supabase = await createSessionClient()
    return unwrap(await supabase.from('brand_settings').select('*').eq('id', 1).single()) as BrandSettings
  })

export interface AuditEntry {
  id: number
  actor_id: string | null
  action: string
  entity: string
  entity_id: string | null
  changes: { antes: Record<string, unknown> | null; despues: Record<string, unknown> | null } | null
  created_at: string
}

export const listAudit = () =>
  safeRead('admin', async () => {
    const supabase = await createSessionClient()
    return unwrap(await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100)) as AuditEntry[]
  })

export interface StaffMember {
  id: string
  email: string
  role: StaffRole
}

// Los correos viven en auth.users: requiere la clave de servicio. Llamar solo tras requireRole(['admin']).
export const listUsers = () =>
  safeRead('admin', async () => {
    const service = createServiceClient()
    const { data, error } = await service.auth.admin.listUsers({ perPage: 200 })
    if (error) throw new Error(error.message)
    const profiles = unwrap(await service.from('profiles').select('id, role')) as { id: string; role: StaffRole }[]
    const roles = new Map(profiles.map((profile) => [profile.id, profile.role]))
    return data.users.map((user) => ({ id: user.id, email: user.email ?? '—', role: roles.get(user.id) ?? 'cliente' })) as StaffMember[]
  })
