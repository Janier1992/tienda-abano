'use client'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, MessageCircle, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/features/carrito/cart-provider'
import { QuantityStepper } from '@/features/carrito/add-to-cart'
import { cartCount, cartSubtotal, type CartLine } from '@/features/carrito/domain/cart'
import { useTrack } from '@/features/analitica/use-track'
import { SupportForm } from '@/features/atencion/support-form'
import { formatMoney } from '@/shared/lib/money'
import { ButtonLink } from '@/shared/components/ui/button'
import { CostBreakdown } from '../_components/cost-breakdown'

export function CartView({ currency, salesEnabled }: { currency: string; salesEnabled: boolean }) {
  const { lines, dispatch } = useCart()
  const track = useTrack()

  if (lines.length === 0) return <EmptyCart />

  const remove = (line: CartLine) => {
    dispatch({ type: 'remove', productId: line.productId })
    track('retirar_carrito', { slug: line.slug })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{cartCount(lines)} artículos</p>
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <motion.li
                key={line.productId} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }}
                className="flex gap-5 rounded-3xl border border-border bg-card/50 p-4 transition-colors hover:border-border-strong"
              >
                <Link href={`/producto/${line.slug}`} className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-surface md:size-32">
                  {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="128px" unoptimized className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/producto/${line.slug}`} className="block truncate font-display text-2xl transition-colors hover:text-primary md:text-3xl">{line.name}</Link>
                      <p className="text-xs text-muted-foreground">{formatMoney(line.unitPriceCents, currency)} / unidad</p>
                    </div>
                    <button onClick={() => remove(line)} aria-label={`Retirar ${line.name}`} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-danger/10 hover:text-danger">
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <QuantityStepper value={line.quantity} label={`Cantidad de ${line.name}`} onChange={(quantity) => dispatch({ type: 'setQuantity', productId: line.productId, quantity })} />
                    <span className="font-semibold tabular-nums">{formatMoney(line.unitPriceCents * line.quantity, currency)}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <details className="group rounded-3xl border border-border bg-card/40 open:bg-card/70">
          <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
            <span className="grid size-11 place-items-center rounded-full bg-primary/15 text-primary"><MessageCircle aria-hidden className="size-5" /></span>
            <span>
              <span className="block font-semibold">¿Dudas antes de comprar?</span>
              <span className="text-sm text-muted-foreground">Envía tu selección a un asesor y te responderá con el contexto.</span>
            </span>
            <span aria-hidden className="ml-auto text-2xl text-muted-foreground transition-transform duration-300 group-open:rotate-45">+</span>
          </summary>
          <div className="max-w-xl border-t border-border p-6">
            <SupportForm
              context={{ origin: 'carrito', cart: lines.map(({ productId, name, quantity }) => ({ productId, name, quantity })) }}
              allowTypeChoice={false}
            />
          </div>
        </details>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="glass ring-gold space-y-6 rounded-[2rem] p-7">
          <h2 className="text-3xl">Resumen</h2>
          <CostBreakdown subtotalCents={cartSubtotal(lines)} currency={currency} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Los precios se confirman con la información oficial al finalizar. El carrito se guarda solo en esta pestaña del navegador mientras dura tu sesión.
          </p>
          {!salesEnabled && (
            <p className="rounded-2xl border border-border bg-background/40 p-4 text-xs text-muted-foreground">
              <span className="block font-semibold text-foreground">Compra online aún no habilitada</span>
              Puedes enviar tu selección a un asesor desde el siguiente paso.
            </p>
          )}
          <div className="space-y-3">
            <ButtonLink href="/checkout" size="lg" className="w-full">Continuar <ArrowRight className="size-4" /></ButtonLink>
            <ButtonLink href="/catalogo" variant="outline" className="w-full">Seguir explorando</ButtonLink>
          </div>
        </div>
      </aside>
    </div>
  )
}

function EmptyCart() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-border-strong px-6 py-24 text-center">
      <span className="ring-gold grid size-20 place-items-center rounded-full bg-surface"><ShoppingBag aria-hidden className="size-8 text-primary" /></span>
      <div className="space-y-2">
        <h2 className="text-4xl md:text-5xl">Tu carrito está vacío</h2>
        <p className="max-w-md text-sm text-muted-foreground">Explora la colección y agrega los productos que te interesen. Agregar al carrito no confirma ninguna compra.</p>
      </div>
      <ButtonLink href="/catalogo" size="lg">Explorar la colección <ArrowRight className="size-4" /></ButtonLink>
    </motion.div>
  )
}
