'use client'
import { ShieldCheck } from 'lucide-react'
import type { CartLine } from '@/features/carrito/domain/cart'
import { BLOCK_MESSAGES } from '@/features/checkout/domain/sales-gate'
import { SupportForm } from '@/features/atencion/support-form'
import { Notice } from '@/shared/components/ui/notice'

// Con la venta deshabilitada se ofrece registrar una intención de compra, distinta de un pedido
export function PurchaseIntent({ lines, region }: { lines: CartLine[]; region?: string }) {
  return (
    <div className="space-y-6">
      <Notice tone="warning" title="No es posible completar la compra online">{BLOCK_MESSAGES.ventas_deshabilitadas}</Notice>
      <div className="glass space-y-6 rounded-[1.75rem] p-6 md:p-8">
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><ShieldCheck aria-hidden className="size-4" />Sin cargo · No es un pedido</p>
          <h2 className="text-4xl">Enviar mi selección a un asesor</h2>
          <p className="text-sm text-muted-foreground">Registraremos tu interés con los productos del carrito. No es un pedido ni genera ningún cargo.</p>
        </div>
        <SupportForm
          context={{ origin: 'checkout', region, cart: lines.map(({ productId, name, quantity }) => ({ productId, name, quantity })) }}
          defaultType="intencion_compra"
          allowTypeChoice={false}
        />
      </div>
    </div>
  )
}
