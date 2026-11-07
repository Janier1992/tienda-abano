'use client'
import { AnimatePresence, motion } from 'motion/react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from './cart-provider'
import { cartCount } from './domain/cart'

// Botón del carrito con contador animado; abre el carrito lateral
export function CartBadge() {
  const { lines, setDrawerOpen } = useCart()
  const count = cartCount(lines)
  return (
    <button
      type="button" onClick={() => setDrawerOpen(true)} aria-label={`Abrir carrito, ${count} artículos`}
      className="relative grid size-10 place-items-center rounded-full transition hover:bg-muted"
    >
      <ShoppingBag aria-hidden className="size-[1.15rem]" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}
            className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
