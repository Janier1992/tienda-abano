import { describe, expect, it } from 'vitest'
import { cartCount, cartReducer, cartSubtotal, MAX_QUANTITY, type CartLine } from './cart'

const base = { productId: 'p1', slug: 'robusto', name: 'Robusto', unitPriceCents: 1250 }

describe('carrito', () => {
  it('agrega y acumula cantidades del mismo producto', () => {
    let lines = cartReducer([], { type: 'add', line: base })
    lines = cartReducer(lines, { type: 'add', line: base, quantity: 2 })
    expect(lines).toHaveLength(1)
    expect(lines[0].quantity).toBe(3)
  })

  it('limita la cantidad entre 1 y el máximo', () => {
    const lines = cartReducer([], { type: 'add', line: base })
    expect(cartReducer(lines, { type: 'setQuantity', productId: 'p1', quantity: 0 })[0].quantity).toBe(1)
    expect(cartReducer(lines, { type: 'setQuantity', productId: 'p1', quantity: 500 })[0].quantity).toBe(MAX_QUANTITY)
    expect(cartReducer(lines, { type: 'setQuantity', productId: 'p1', quantity: Number.NaN })[0].quantity).toBe(1)
  })

  it('retira artículos y vacía el carrito', () => {
    const lines = cartReducer([], { type: 'add', line: base })
    expect(cartReducer(lines, { type: 'remove', productId: 'p1' })).toEqual([])
    expect(cartReducer(lines, { type: 'clear' })).toEqual([])
  })

  it('calcula subtotal y número de unidades en céntimos', () => {
    const lines: CartLine[] = [
      { ...base, quantity: 2 },
      { ...base, productId: 'p2', unitPriceCents: 999, quantity: 1 },
    ]
    expect(cartSubtotal(lines)).toBe(3499)
    expect(cartCount(lines)).toBe(3)
  })

  it('descarta líneas inválidas al rehidratar desde el navegador', () => {
    const raw = [{ ...base, quantity: 2 }, { productId: 'x', unitPriceCents: -5 }, null] as unknown as CartLine[]
    expect(cartReducer([], { type: 'hydrate', lines: raw })).toHaveLength(1)
  })
})
