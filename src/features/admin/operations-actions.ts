'use server'
import { updateTag } from 'next/cache'
import type { ActionState } from '@/shared/lib/action-state'
import { CACHE_TAGS } from '@/shared/lib/data-result'
import type { OrderStatus, PaymentStatus } from '@/shared/types/domain'
import { canTransition, ORDER_STATUS_LABELS } from '@/features/pedidos/domain/status'
import { getSalesEnableMissing } from './domain/settings'
import { noteSchema, orderStatusSchema, requestUpdateSchema, roleSchema, settingsSchema } from './schemas'
import { failed, formToObject, runStaffAction, saved, writeProblem } from './run-action'

// Cambio manual de estado: el estado de pago nunca se toca desde aquí
export async function updateOrderStatus(orderId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return runStaffAction(['pedidos'], orderStatusSchema, formToObject(formData), async ({ status }, { supabase }) => {
    const { data: order } = await supabase.from('orders').select('status, payment_status').eq('id', orderId).single()
    if (!order) return { status: 'error', message: 'El pedido no existe o no tienes acceso.' }
    if (!canTransition(order.status as OrderStatus, order.payment_status as PaymentStatus, status)) {
      return { status: 'error', message: `No se puede pasar de "${ORDER_STATUS_LABELS[order.status as OrderStatus]}" a "${ORDER_STATUS_LABELS[status]}".` }
    }
    const problem = writeProblem(await supabase.from('orders').update({ status }).eq('id', orderId).select('id'))
    if (problem) return problem
    return saved(`Estado actualizado a "${ORDER_STATUS_LABELS[status]}".`)
  })
}

export async function updateSupportRequest(requestId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return runStaffAction(['atencion'], requestUpdateSchema, formToObject(formData), async (data, { supabase }) => {
    const problem = writeProblem(await supabase
      .from('support_requests').update({ ...data, updated_at: new Date().toISOString() }).eq('id', requestId).select('id'))
    if (problem) return problem
    return saved('Solicitud actualizada.')
  })
}

export async function addSupportNote(requestId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return runStaffAction(['atencion'], noteSchema, formToObject(formData), async ({ body }, { supabase, user }) => {
    const { error } = await supabase.from('support_notes').insert({ request_id: requestId, author_id: user.id, body })
    if (error) return failed(error)
    return saved('Nota interna añadida.')
  })
}

// Solo administración. Activar la venta exige validación legal completa (también lo exige la BD).
export async function updateBrandSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runStaffAction(['admin'], settingsSchema, formToObject(formData), async (data, { supabase, user }) => {
    const missing = getSalesEnableMissing(data)
    if (data.sales_enabled && missing.length) {
      return { status: 'error', message: `No se puede activar la venta. Falta: ${missing.join(', ')}.` }
    }
    const problem = writeProblem(await supabase
      .from('brand_settings').update({ ...data, updated_by: user.id, updated_at: new Date().toISOString() }).eq('id', 1).select('id'))
    if (problem) return problem
    updateTag(CACHE_TAGS.marca)
    return saved(data.sales_enabled ? 'Configuración guardada. La venta online está ACTIVA.' : 'Configuración guardada. La venta online sigue desactivada.')
  })
}

export async function updateUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runStaffAction(['admin'], roleSchema, formToObject(formData), async ({ user_id, role }, { supabase, user }) => {
    // Evita que el último acceso de administración se pierda por error
    if (user_id === user.id && role !== 'admin') {
      return { status: 'error', message: 'No puedes quitarte tu propio rol de administración.' }
    }
    const problem = writeProblem(await supabase.from('profiles').update({ role }).eq('id', user_id).select('id'))
    if (problem) return problem
    return saved('Rol actualizado.')
  })
}
