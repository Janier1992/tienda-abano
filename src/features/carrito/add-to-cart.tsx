'use client'
import { useState } from 'react'
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useTrack } from '@/features/analitica/use-track'
import { Button } from '@/shared/components/ui/button'
import { useCart } from './cart-provider'
import { MAX_QUANTITY } from './domain/cart'

interface Props {
  productId: string
  slug: string
  name: string
  unitPriceCents: number
  imageUrl?: string
}

export function QuantityStepper({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  const set = (next: number) => onChange(Math.min(MAX_QUANTITY, Math.max(1, next)))
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-border-strong bg-surface/70">
      <button type="button" onClick={() => set(value - 1)} disabled={value <= 1} aria-label="Restar una unidad" className="grid size-10 place-items-center rounded-full transition hover:bg-muted disabled:opacity-30">
        <Minus aria-hidden className="size-3.5" />
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" onClick={() => set(value + 1)} disabled={value >= MAX_QUANTITY} aria-label="Sumar una unidad" className="grid size-10 place-items-center rounded-full transition hover:bg-muted disabled:opacity-30">
        <Plus aria-hidden className="size-3.5" />
      </button>
    </div>
  )
}

// Añadir al carrito no es una compra: abre el carrito lateral para revisar
export function AddToCart({ productId, slug, name, unitPriceCents, imageUrl }: Props) {
  const { dispatch, setDrawerOpen } = useCart()
  const track = useTrack()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const add = () => {
    dispatch({ type: 'add', line: { productId, slug, name, unitPriceCents, imageUrl }, quantity })
    track('agregar_carrito', { slug, cantidad: quantity })
    setAdded(true)
    setDrawerOpen(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <QuantityStepper value={quantity} onChange={setQuantity} label="Cantidad" />
      <Button size="lg" onClick={add} className="min-w-52 flex-1">
        {added ? <Check aria-hidden className="size-4" /> : <ShoppingBag aria-hidden className="size-4" />}
        {added ? 'Añadido al carrito' : 'Agregar al carrito'}
      </Button>
      <p className="w-full text-xs text-muted-foreground">Agregar al carrito no confirma ninguna compra.</p>
    </div>
  )
}
