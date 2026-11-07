// Logger mínimo con etiquetas. Nunca registrar datos personales ni de pago.
type Level = 'info' | 'warn' | 'error'

export function log(level: Level, scope: string, message: string, extra?: Record<string, unknown>) {
  const line = `[${level.toUpperCase()}][${scope}] ${message}`
  if (level === 'error') console.error(line, extra ?? '')
  else if (level === 'warn') console.warn(line, extra ?? '')
  else console.info(line, extra ?? '')
}
