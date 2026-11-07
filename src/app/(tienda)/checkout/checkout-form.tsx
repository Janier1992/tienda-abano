'use client'
import { useActionState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useCart } from '@/features/carrito/cart-provider'
import type { CartLine } from '@/features/carrito/domain/cart'
import { startCheckout } from '@/features/checkout/actions'
import { BLOCK_MESSAGES } from '@/features/checkout/domain/sales-gate'
import { LINE_PROBLEM_MESSAGES } from '@/features/checkout/schema'
import { CHECKOUT_IDLE, type CheckoutState } from '@/features/checkout/state'
import { useTrack } from '@/features/analitica/use-track'
import { Button } from '@/shared/components/ui/button'
import { Field, Select } from '@/shared/components/ui/field'
import { Notice } from '@/shared/components/ui/notice'
import { OrderStarted, SimulatedResult } from './checkout-results'
import { PurchaseIntent } from './purchase-intent'

interface Props {
  lines: CartLine[]
  minAge: number
  regions: string[]
  onStepChange: (step: number) => void
}

const OTHER_REGION = '__otra__'

// Bloque del formulario; al enfocarlo se actualiza el paso del indicador
function Section({ step, title, onStepChange, children }: { step: number; title: string; onStepChange: (step: number) => void; children: ReactNode }) {
  return (
    <fieldset onFocusCapture={() => onStepChange(step)} className="glass space-y-5 rounded-[1.75rem] p-6 md:p-8">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="flex items-center gap-3 font-display text-3xl">
        <span className="text-base text-primary">0{step}</span>{title}
      </p>
      {children}
    </fieldset>
  )
}

export function CheckoutForm({ lines, minAge, regions, onStepChange }: Props) {
  const [state, action, pending] = useActionState(startCheckout, CHECKOUT_IDLE)
  const { dispatch } = useCart()
  const track = useTrack()

  useEffect(() => {
    if (state.status === 'started') {
      dispatch({ type: 'clear' })
      track('pedido_iniciado')
    }
    if (state.status === 'started' || state.status === 'simulated') onStepChange(3)
    if (state.status === 'blocked') track('checkout_bloqueado', { motivo: state.reasons.join(',') })
  }, [state, dispatch, track, onStepChange])

  if (state.status === 'started') return <OrderStarted state={state} />
  if (state.status === 'simulated') return <SimulatedResult state={state} />
  if (state.status === 'blocked' && state.reasons.includes('ventas_deshabilitadas')) return <PurchaseIntent lines={lines} />

  const values = state.status === 'idle' || !('values' in state) ? {} : state.values
  const errors = state.status === 'invalid' ? state.fieldErrors : {}

  return (
    <form action={action} className="space-y-6" noValidate>
      <StatusMessage state={state} />
      <input type="hidden" name="lines" value={JSON.stringify(lines.map(({ productId, quantity }) => ({ productId, quantity })))} />

      <Section step={1} title="Datos de contacto" onStepChange={onStepChange}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre completo" name="contactName" autoComplete="name" defaultValue={values.contactName} error={errors.contactName} required />
          <Field label="Correo electrónico" name="contactEmail" type="email" autoComplete="email" defaultValue={values.contactEmail} error={errors.contactEmail} required />
        </div>
      </Section>

      <Section step={2} title="Entrega" onStepChange={onStepChange}>
        <Field label="Dirección" name="line1" autoComplete="address-line1" defaultValue={values.line1} error={errors.line1} required />
        <Field label="Piso, puerta (opcional)" name="line2" autoComplete="address-line2" defaultValue={values.line2} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ciudad" name="city" autoComplete="address-level2" defaultValue={values.city} error={errors.city} required />
          <Field label="Código postal" name="postalCode" autoComplete="postal-code" defaultValue={values.postalCode} error={errors.postalCode} required />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="País" name="country" autoComplete="country-name" defaultValue={values.country} error={errors.country} required />
          <Select label="Región de entrega" name="region" defaultValue={values.region ?? ''} error={errors.region} required>
            <option value="" disabled>Selecciona una región</option>
            {regions.map((region) => <option key={region} value={region}>{region}</option>)}
            <option value={OTHER_REGION}>Otra región</option>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">Solo realizamos entregas en las regiones listadas. El coste de envío se calculará según la zona.</p>
      </Section>

      <fieldset className="space-y-4 rounded-[1.75rem] border border-border p-6 text-sm md:p-8">
        <legend className="sr-only">Declaraciones</legend>
        <CheckLine name="ageDeclaration" error={errors.ageDeclaration}>
          Declaro tener {minAge} años o más. Se requerirá una verificación de edad antes del pago.
        </CheckLine>
        <CheckLine name="termsAccepted" error={errors.termsAccepted}>
          He leído las <Link href="/politicas/condiciones" className="text-foreground underline underline-offset-4">condiciones de compra</Link> y la{' '}
          <Link href="/politicas/privacidad" className="text-foreground underline underline-offset-4">política de privacidad</Link>.
        </CheckLine>
      </fieldset>

      <div className="space-y-3">
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          <Lock aria-hidden className="size-4" />{pending ? 'Enviando…' : 'Enviar pedido'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Enviar el pedido no realiza ningún cargo. El pago se gestiona en un paso posterior con un medio autorizado.</p>
      </div>
    </form>
  )
}

function CheckLine({ name, error, children }: { name: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="group flex cursor-pointer items-start gap-3 text-muted-foreground">
        <input type="checkbox" name={name} required className="peer sr-only" />
        <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-border-strong transition-all peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 after:size-2 after:scale-0 after:rounded-sm after:bg-primary-foreground after:transition-transform peer-checked:after:scale-100" />
        <span className="leading-relaxed">{children}</span>
      </label>
      {error && <p className="pl-8 text-xs text-danger">{error}</p>}
    </div>
  )
}

function StatusMessage({ state }: { state: CheckoutState }) {
  if (state.status === 'invalid' || state.status === 'error') return <Notice tone="error" title={state.message} />
  if (state.status === 'blocked') {
    return (
      <Notice tone="warning" title="No podemos completar este pedido">
        <ul className="list-disc pl-4">{state.reasons.map((r) => <li key={r}>{BLOCK_MESSAGES[r]}</li>)}</ul>
      </Notice>
    )
  }
  if (state.status === 'problems') {
    return (
      <Notice tone="warning" title="Algunos productos no pueden incluirse">
        <ul className="list-disc pl-4">{state.problems.map((p) => <li key={p.productId}>{p.name} {LINE_PROBLEM_MESSAGES[p.reason]}.</li>)}</ul>
        <p className="mt-2">Modifica el carrito y vuelve a intentarlo.</p>
      </Notice>
    )
  }
  return null
}
