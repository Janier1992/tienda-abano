import 'server-only'
import { getCurrentUser } from '@/features/auth/session'
import { createServiceClient } from '@/shared/lib/supabase/server'
import { checkRateLimit, clientKey } from '@/shared/lib/rate-limit'
import { isSupabaseConfigured } from '@/shared/lib/env'
import { log } from '@/shared/lib/logger'
import { supportRequestSchema } from './schema'

export type CreateRequestResult =
  | { ok: true; reference: string }
  | { ok: false; reason: 'validacion'; fieldErrors: { path: PropertyKey[]; message: string }[] }
  | { ok: false; reason: 'limite' | 'no_configurado' | 'error' }

// Registra una solicitud de atención. Usado por formularios, checkout y el asistente.
export async function createSupportRequest(input: unknown): Promise<CreateRequestResult> {
  const parsed = supportRequestSchema.safeParse(input)
  if (!parsed.success) return { ok: false, reason: 'validacion', fieldErrors: parsed.error.issues }
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return { ok: false, reason: 'no_configurado' }
  if (!checkRateLimit(await clientKey('solicitud'), 5, 10 * 60_000)) return { ok: false, reason: 'limite' }

  const user = await getCurrentUser()
  const data = parsed.data
  const { data: row, error } = await createServiceClient()
    .from('support_requests')
    .insert({
      type: data.type,
      customer_id: user?.id ?? null,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      message: data.message,
      context: data.context,
      assistant_summary: data.assistantSummary ?? null,
      consent_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !row) {
    log('error', 'atencion', 'No se pudo registrar la solicitud', { code: error?.code })
    return { ok: false, reason: 'error' }
  }
  return { ok: true, reference: row.id.slice(0, 8).toUpperCase() }
}

export const REQUEST_ERROR_MESSAGES = {
  limite: 'Has enviado varias solicitudes seguidas. Espera unos minutos e inténtalo de nuevo.',
  no_configurado: 'El registro de solicitudes aún no está disponible. Escríbenos por los canales indicados en el pie de página.',
  error: 'No pudimos registrar tu solicitud. Inténtalo de nuevo en unos minutos.',
} as const
