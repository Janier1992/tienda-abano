'use server'
import { z } from 'zod'
import type { ActionState } from '@/shared/lib/action-state'
import { isSupabaseConfigured, publicEnv } from '@/shared/lib/env'
import { createSessionClient } from '@/shared/lib/supabase/server'
import { checkRateLimit, clientKey } from '@/shared/lib/rate-limit'
import { log } from '@/shared/lib/logger'
import { safeNextPath } from './next-path'

const loginSchema = z.object({ email: z.email('Indica un correo válido').max(200) })

// Enlace mágico sin contraseña. La respuesta no revela si el correo existe.
export async function requestMagicLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: 'error', message: 'El acceso aún no está disponible: el servicio de cuentas está pendiente de configuración.' }
  }
  const parsed = loginSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { status: 'error', message: 'Revisa el correo.', fieldErrors: { email: parsed.error.issues[0].message } }
  if (!checkRateLimit(await clientKey('login'), 5, 15 * 60_000)) {
    return { status: 'error', message: 'Demasiados intentos. Espera unos minutos antes de pedir otro enlace.' }
  }

  const next = safeNextPath(String(formData.get('next') ?? ''))
  const redirectTo = `${publicEnv.siteUrl}/auth/confirmar?next=${encodeURIComponent(next)}`
  const supabase = await createSessionClient()
  const { error } = await supabase.auth.signInWithOtp({ email: parsed.data.email, options: { emailRedirectTo: redirectTo } })
  if (error) log('warn', 'auth', 'Fallo al enviar enlace', { status: error.status })

  return { status: 'success', message: 'Si el correo es válido, recibirás un enlace para entrar. Revisa también la carpeta de spam.' }
}
