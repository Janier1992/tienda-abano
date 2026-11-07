import 'server-only'
import type { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { StaffRole } from '@/shared/types/domain'
import { type ActionState, toFieldErrors } from '@/shared/lib/action-state'
import { requireRole, type CurrentUser } from '@/features/auth/session'
import { createSessionClient } from '@/shared/lib/supabase/server'
import { log } from '@/shared/lib/logger'

export interface StaffContext {
  user: CurrentUser
  supabase: SupabaseClient
}

// FormData → objeto plano; las casillas no marcadas simplemente no aparecen
export function formToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries())
}

// Traduce errores de Postgres/Supabase a mensajes comprensibles para el equipo
export function dbErrorMessage(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Ya existe un registro con ese identificador (slug). Usa otro.'
  if (error.code === '23514') return 'Los datos no cumplen una regla obligatoria (por ejemplo, datos mínimos para publicar o activar la venta).'
  if (error.code === '42501') return 'No tienes permisos para realizar esta acción.'
  if (error.code === 'P0001') return error.message
  return 'No se pudo guardar el cambio. Inténtalo de nuevo.'
}

// Envoltorio común: verifica rol (redirige si no corresponde), valida y ejecuta con el cliente de sesión (RLS activo)
export async function runStaffAction<S extends z.ZodType>(
  roles: StaffRole[],
  schema: S,
  raw: unknown,
  handler: (data: z.infer<S>, ctx: StaffContext) => Promise<ActionState>,
): Promise<ActionState> {
  const user = await requireRole(roles)
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: 'Revisa los campos marcados.', fieldErrors: toFieldErrors(parsed.error.issues) }
  }
  try {
    return await handler(parsed.data, { user, supabase: await createSessionClient() })
  } catch (error) {
    log('error', 'admin', 'Acción fallida', { error: String(error) })
    return { status: 'error', message: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }
  }
}

// Con RLS, una escritura sin permiso no da error: afecta 0 filas. Se trata como fallo explícito.
export function writeProblem(result: { data: unknown[] | null; error: { code?: string; message: string } | null }): ActionState | null {
  if (result.error) return failed(result.error)
  if (!result.data || result.data.length === 0) {
    return { status: 'error', message: 'No se aplicó el cambio: el registro no existe o no tienes permiso.' }
  }
  return null
}

export const saved = (message = 'Cambios guardados.'): ActionState => ({ status: 'success', message })
export const failed = (error: { code?: string; message: string }): ActionState => ({ status: 'error', message: dbErrorMessage(error) })
