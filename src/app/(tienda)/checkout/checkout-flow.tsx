'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/features/carrito/cart-provider'
import { cartSubtotal, type CartLine } from '@/features/carrito/domain/cart'
import { useTrack } from '@/features/analitica/use-track'
import { formatMoney } from '@/shared/lib/money'
import { ButtonLink } from '@/shared/components/ui/button'
import { CostBreakdown } from '../_components/cost-breakdown'
import { CheckoutForm } from './checkout-form'
import { PurchaseIntent } from './purchase-intent'
import { Stepper } from './stepper'

interface Props {
  currency: string
  minAge: number
  salesEnabled: boolean
  regions: string[]
}

export function CheckoutFlow({ currency, minAge, salesEnabled, regions }: Props) {
  const { lines } = useCart()
  const track = useTrack()
  const blocked = !salesEnabled
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (lines.length > 0) track(blocked ? 'checkout_bloqueado' : 'inicio_checkout', blocked ? { motivo: 'ventas_deshabilitadas' } : undefined)
    // Solo al entrar al checkout, no en cada cambio del carrito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (lines.length === 0 && step < 3) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-border-strong px-6 py-20 text-center">
        <span className="ring-gold grid size-20 place-items-center rounded-full bg-surface"><ShoppingBag aria-hidden className="size-8 text-primary" /></span>
        <div className="space-y-2">
          <h2 className="text-4xl">No hay productos en tu carrito</h2>
          <p className="text-sm text-muted-foreground">Agrega productos desde la colección para iniciar un pedido.</p>
        </div>
        <ButtonLink href="/catalogo" size="lg">Explorar la colección</ButtonLink>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div><Stepper current={step} /></div>
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {blocked ? <PurchaseIntent lines={lines} /> : <CheckoutForm lines={lines} minAge={minAge} regions={regions} onStepChange={setStep} />}
        </div>
        {lines.length > 0 && <OrderSummary lines={lines} currency={currency} />}
      </div>
    </div>
  )
}

function OrderSummary({ lines, currency }: { lines: CartLine[]; currency: string }) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Resumen del pedido">
      <div className="space-y-6 rounded border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-2xl text-ink">Resumen del Pedido</h2>
          <span className="label-gold text-accent !text-[0.6rem]">Custodia D.O.P.</span>
        </div>
        <ul className="space-y-4">
          {lines.map((line) => (
            <li key={line.productId} className="flex items-center gap-4">
              <span className="relative size-14 shrink-0 overflow-hidden rounded border border-border bg-surface">
                {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="56px" unoptimized className="object-cover" />}
                <span className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.6rem] font-bold text-ink-foreground">{line.quantity}</span>
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{line.name}</span>
              <span className="text-xs font-semibold tabular-nums text-ink">{formatMoney(line.unitPriceCents * line.quantity, currency)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-4">
          <CostBreakdown subtotalCents={cartSubtotal(lines)} currency={currency} />
        </div>
        <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
          Importes oficiales orientativos: el importe definitivo de precinto fiscal y logística climatizada se confirma antes del despacho.
        </p>
        <ButtonLink href="/carrito" variant="outline" className="w-full text-xs uppercase tracking-wider">Modificar carrito</ButtonLink>
      </div>
    </aside>
  )
}
