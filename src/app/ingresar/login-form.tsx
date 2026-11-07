'use client'
import { useActionState } from 'react'
import { IDLE } from '@/shared/lib/action-state'
import { Button } from '@/shared/components/ui/button'
import { Field } from '@/shared/components/ui/field'
import { Notice } from '@/shared/components/ui/notice'
import { requestMagicLink } from './actions'

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(requestMagicLink, IDLE)

  if (state.status === 'success') return <Notice tone="success" title="Revisa tu correo">{state.message}</Notice>

  return (
    <form action={action} className="space-y-4">
      {state.status === 'error' && <Notice tone="error" title={state.message} />}
      <input type="hidden" name="next" value={next} />
      <Field label="Correo electrónico" name="email" type="email" autoComplete="email" required
        error={state.status === 'error' ? state.fieldErrors?.email : undefined} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">{pending ? 'Enviando…' : 'Enviarme un enlace de acceso'}</Button>
      <p className="text-xs leading-relaxed text-muted-foreground">No usamos contraseñas: te enviamos un enlace de un solo uso. Crear una cuenta no es obligatorio para consultar el catálogo.</p>
    </form>
  )
}
