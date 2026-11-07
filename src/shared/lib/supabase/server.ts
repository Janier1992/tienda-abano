import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSupabaseConfigured, publicEnv } from '@/shared/lib/env'

export class ServiceUnavailableError extends Error {
  constructor() {
    super('Supabase no está configurado')
  }
}

// Cliente con la sesión del usuario: respeta RLS. Requiere estar dentro de un <Suspense> o una acción.
export async function createSessionClient() {
  if (!isSupabaseConfigured()) throw new ServiceUnavailableError()
  const cookieStore = await cookies()
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // En Server Components no se pueden escribir cookies; el proxy refresca la sesión.
        }
      },
    },
  })
}

// Cliente anónimo sin cookies: usable dentro de 'use cache' para datos públicos.
export function createPublicClient() {
  if (!isSupabaseConfigured()) throw new ServiceUnavailableError()
  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false },
  })
}

// Cliente de servicio: salta RLS. Solo en acciones de servidor que validan permisos y datos antes.
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!isSupabaseConfigured() || !key) throw new ServiceUnavailableError()
  return createClient(publicEnv.supabaseUrl, key, { auth: { persistSession: false } })
}
