import 'server-only'
import type { DataResult } from '@/shared/types/domain'
import { isDemoMode, isSupabaseConfigured } from '@/shared/lib/env'
import { log } from '@/shared/lib/logger'

// Etiquetas de caché: las acciones de administración las invalidan con updateTag
export const CACHE_TAGS = {
  marca: 'marca',
  catalogo: 'catalogo',
  contenido: 'contenido',
} as const

// Envuelve una lectura: distingue servicio sin configurar, error y datos. Los errores no se cachean
// porque la función cacheada lanza y este envoltorio (no cacheado) los captura.
// `demo` aporta el contenido ilustrativo cuando el modo prototipo está activo.
export async function safeRead<T>(scope: string, read: () => Promise<T>, demo?: () => T): Promise<DataResult<T>> {
  if (!isSupabaseConfigured()) {
    return isDemoMode() && demo ? { status: 'ok', data: demo() } : { status: 'no_configurado' }
  }
  try {
    return { status: 'ok', data: await read() }
  } catch (error) {
    log('error', scope, 'Fallo de lectura', { error: String(error) })
    return { status: 'error', message: 'No pudimos cargar esta información. Inténtalo de nuevo en unos minutos.' }
  }
}

// Lanza si Supabase devolvió error, para que no quede en caché
export function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  if (result.data === null) throw new Error('Respuesta vacía')
  return result.data
}
