'use client'
import { useActionState, type ReactNode } from 'react'
import { type ActionState, IDLE } from '@/shared/lib/action-state'
import { Button } from '@/shared/components/ui/button'
import { Notice } from '@/shared/components/ui/notice'

interface Props {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  children: ReactNode
  submitLabel?: string
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

// Formulario del panel: muestra el resultado real de la acción (nunca un éxito optimista)
export function AdminForm({ action, children, submitLabel = 'Guardar', variant = 'primary', className = 'space-y-4' }: Props) {
  const [state, formAction, pending] = useActionState(action, IDLE)
  const fieldErrors = state.status === 'error' ? Object.entries(state.fieldErrors ?? {}) : []

  return (
    <form action={formAction} className={className}>
      {state.status === 'error' && (
        <Notice tone="error" title={state.message}>
          {fieldErrors.length > 0 && (
            <ul className="list-disc pl-4">
              {fieldErrors.map(([field, message]) => <li key={field}>{message}</li>)}
            </ul>
          )}
        </Notice>
      )}
      {state.status === 'success' && <Notice tone="success" title={state.message} />}
      {children}
      <Button type="submit" variant={variant} disabled={pending}>{pending ? 'Guardando…' : submitLabel}</Button>
    </form>
  )
}
