// Solo rutas internas: evita redirecciones abiertas a dominios externos
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/cuenta'
  return value
}
