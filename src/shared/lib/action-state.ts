// Resultado estándar de una acción de servidor para formularios con useActionState
export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message: string; reference?: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }

export const IDLE: ActionState = { status: 'idle' }

// Convierte errores de Zod en un mapa campo → primer mensaje
export function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] ??= issue.message
  }
  return errors
}
