import 'server-only'
import type { Order, SupportRequest } from '@/shared/types/domain'
import { safeRead, unwrap } from '@/shared/lib/data-result'
import { createSessionClient } from '@/shared/lib/supabase/server'
import type { CurrentUser } from '@/features/auth/session'
import type { OrderItem } from '@/features/admin/queries'

// Además de RLS, se filtra por el propio usuario: el personal con rol no debe ver aquí pedidos ajenos
export const listMyOrders = (user: CurrentUser) =>
  safeRead('cuenta', async () => {
    const supabase = await createSessionClient()
    return unwrap(await supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false })) as Order[]
  })

export const getMyOrder = (user: CurrentUser, reference: string) =>
  safeRead('cuenta', async () => {
    const supabase = await createSessionClient()
    const { data, error } = await supabase
      .from('orders').select('*, order_items(id, product_name, unit_price_cents, quantity)')
      .eq('customer_id', user.id).eq('reference', reference).maybeSingle()
    if (error) throw new Error(error.message)
    return data as (Order & { order_items: OrderItem[] }) | null
  })

export const listMyRequests = (user: CurrentUser) =>
  safeRead('cuenta', async () => {
    const supabase = await createSessionClient()
    return unwrap(await supabase.from('support_requests')
      .select('id, type, status, message, created_at, updated_at, resolution')
      .eq('customer_id', user.id).order('created_at', { ascending: false })) as Pick<SupportRequest, 'id' | 'type' | 'status' | 'message' | 'created_at' | 'updated_at' | 'resolution'>[]
  })

export const getMyProfile = (user: CurrentUser) =>
  safeRead('cuenta', async () => {
    const supabase = await createSessionClient()
    return unwrap(await supabase.from('profiles').select('full_name, marketing_consent').eq('id', user.id).single()) as { full_name: string | null; marketing_consent: boolean }
  })
