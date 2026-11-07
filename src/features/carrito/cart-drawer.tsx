'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ShoppingBag, Trash2, X } from 'lucide-react'
import { formatMoney } from '@/shared/lib/money'
import { ButtonLink } from '@/shared/components/ui/button'
import { useCart } from './cart-provider'
import { QuantityStepper } from './add-to-cart'
import { cartCount, cartSubtotal } from './domain/cart'

// Carrito lateral: revisión rápida sin salir de la página
export function CartDrawer({ currency }: { currency: string }) {
  const { lines, dispatch, drawerOpen, setDrawerOpen } = useCart()
  const closeRef = useRef<HTMLButtonElement>(null)
  const close = () => setDrawerOpen(false)

  useEffect(() => {
    if (!drawerOpen) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setDrawerOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen, setDrawerOpen])

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="carrito-titulo">
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="glass absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
          >
            <header className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 id="carrito-titulo" className="text-3xl">Tu carrito <span className="text-base text-muted-foreground">({cartCount(lines)})</span></h2>
              <button ref={closeRef} onClick={close} aria-label="Cerrar carrito" className="grid size-10 place-items-center rounded-full hover:bg-muted"><X className="size-5" /></button>
            </header>
            {lines.length === 0 ? <EmptyCart onClose={close} /> : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li key={line.productId} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} className="flex gap-4 rounded-2xl border border-border bg-surface/60 p-3">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                          {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="80px" unoptimized className="object-cover" />}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <Link href={`/producto/${line.slug}`} onClick={close} className="truncate font-semibold hover:text-primary">{line.name}</Link>
                            <button onClick={() => dispatch({ type: 'remove', productId: line.productId })} aria-label={`Retirar ${line.name}`} className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
                          </div>
                          <div className="flex items-center justify-between">
                            <QuantityStepper value={line.quantity} label={`Cantidad de ${line.name}`} onChange={(quantity) => dispatch({ type: 'setQuantity', productId: line.productId, quantity })} />
                            <span className="text-sm font-semibold tabular-nums">{formatMoney(line.unitPriceCents * line.quantity, currency)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <footer className="space-y-4 border-t border-border px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal orientativo</span>
                    <span className="font-display text-3xl tabular-nums">{formatMoney(cartSubtotal(lines), currency)}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">Envío e impuestos se calculan al finalizar. Los precios se confirman con los datos oficiales al iniciar el pedido. El carrito se guarda solo en esta pestaña.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <ButtonLink href="/carrito" variant="outline" onClick={close}>Ver carrito</ButtonLink>
                    <ButtonLink href="/checkout" onClick={close}>Finalizar</ButtonLink>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <span className="grid size-20 place-items-center rounded-full border border-border bg-surface"><ShoppingBag className="size-7 text-primary" /></span>
      <div className="space-y-2">
        <p className="font-display text-3xl">Tu carrito está vacío</p>
        <p className="text-sm text-muted-foreground">Explora la selección y añade lo que te interese.</p>
      </div>
      <ButtonLink href="/catalogo" onClick={onClose}>Explorar el catálogo</ButtonLink>
    </div>
  )
}
