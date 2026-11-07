import { formatMoney } from '@/shared/lib/money'

interface Props {
  subtotalCents: number
  currency: string
  shippingCents?: number | null
  taxCents?: number | null
}

// Desglose transparente: lo que no se puede calcular se indica como pendiente, nunca se estima
export function CostBreakdown({ subtotalCents, currency, shippingCents = null, taxCents = null }: Props) {
  const total = shippingCents !== null && taxCents !== null ? subtotalCents + shippingCents + taxCents : null
  const row = (label: string, value: number | null) => (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value !== null ? formatMoney(value, currency) : <span className="text-xs text-muted-foreground/80">Pendiente de cálculo</span>}</dd>
    </div>
  )
  return (
    <dl className="space-y-3 text-sm">
      {row('Subtotal', subtotalCents)}
      {row('Envío', shippingCents)}
      {row('Impuestos', taxCents)}
      <div className="hairline" />
      <div className="flex items-baseline justify-between gap-4">
        <dt className="font-semibold">Total</dt>
        <dd className="text-right">
          {total !== null
            ? <span className="font-display text-3xl tabular-nums">{formatMoney(total, currency)}</span>
            : <span className="text-xs text-muted-foreground">Se mostrará al calcular envío e impuestos</span>}
        </dd>
      </div>
    </dl>
  )
}
