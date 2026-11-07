'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Check, Send } from 'lucide-react'
import type { RequestType } from '@/shared/types/domain'
import { IDLE } from '@/shared/lib/action-state'
import { Button } from '@/shared/components/ui/button'
import { Field, Select, TextArea } from '@/shared/components/ui/field'
import { Notice } from '@/shared/components/ui/notice'
import { submitSupportRequest } from './actions'
import type { z } from 'zod'
import type { requestContextSchema } from './schema'

interface Props {
  context: z.infer<typeof requestContextSchema>
  defaultType?: RequestType
  allowTypeChoice?: boolean
  defaultMessage?: string
}

// Formulario reutilizable: conserva el contexto (producto, carrito, pedido) desde donde se abre
export function SupportForm({ context, defaultType = 'consulta', allowTypeChoice = true, defaultMessage = '' }: Props) {
  const [state, action, pending] = useActionState(submitSupportRequest, IDLE)

  if (state.status === 'success') return <SuccessState reference={state.reference} message={state.message} />

  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === 'error' && <Notice tone="error" title={state.message} />}
      <input type="hidden" name="context" value={JSON.stringify(context)} />
      {allowTypeChoice ? (
        <Select label="Motivo" name="type" defaultValue={defaultType}>
          <option value="consulta">Consulta general</option>
          <option value="intencion_compra">Quiero comprar / pedir información de compra</option>
          <option value="soporte_pedido">Ayuda con un pedido</option>
          <option value="reclamacion">Reclamación</option>
        </Select>
      ) : <input type="hidden" name="type" value={defaultType} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" name="contactName" autoComplete="name" required error={errors.contactName} />
        <Field label="Correo electrónico" name="contactEmail" type="email" autoComplete="email" required error={errors.contactEmail} />
      </div>
      <TextArea label="Mensaje" name="message" required defaultValue={defaultMessage} error={errors.message} />
      <div className="space-y-1">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" name="consent" required className="peer sr-only" />
          <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-border-strong transition-all peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 after:size-2 after:scale-0 after:rounded-sm after:bg-primary-foreground after:transition-transform peer-checked:after:scale-100" />
          <span className="leading-relaxed">
            Acepto que la marca use estos datos solo para responder a esta solicitud.{' '}
            <Link href="/politicas/privacidad" className="text-foreground underline underline-offset-4">Política de privacidad</Link>
          </span>
        </label>
        {errors.consent && <p className="pl-8 text-xs text-danger">{errors.consent}</p>}
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        <Send aria-hidden className="size-4" />{pending ? 'Enviando…' : 'Enviar solicitud'}
      </Button>
    </form>
  )
}

function SuccessState({ reference, message }: { reference?: string; message: string }) {
  return (
    <motion.div
      role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 rounded-3xl border border-success/25 bg-success/[0.06] p-8 text-center"
    >
      <motion.span
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
        className="grid size-14 place-items-center rounded-full bg-success text-background"
      >
        <Check aria-hidden className="size-7" />
      </motion.span>
      <div className="space-y-2">
        <p className="font-display text-3xl">Solicitud recibida</p>
        {reference && <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ref. {reference}</p>}
        <p className="max-w-sm text-sm text-muted-foreground">{message} No es una confirmación de compra.</p>
      </div>
    </motion.div>
  )
}
