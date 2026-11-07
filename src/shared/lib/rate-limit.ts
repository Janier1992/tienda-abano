import 'server-only'
import { headers } from 'next/headers'

// Limitador de ventana fija en memoria. Protege cada instancia; en despliegues con varias
// instancias debe sustituirse por un almacén compartido (ver docs/DECISIONES.md).
const buckets = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count++
  return true
}

export async function clientKey(scope: string): Promise<string> {
  const list = await headers()
  const ip = list.get('x-forwarded-for')?.split(',')[0]?.trim() || list.get('x-real-ip') || 'desconocida'
  return `${scope}:${ip}`
}
