import { describe, expect, it } from 'vitest'
import { getMissingFields, isPublishable } from './completeness'

describe('completitud de ficha', () => {
  it('lista los datos pendientes de verificar', () => {
    const draft = { description: null, price_cents: null, stock_status: 'pendiente' as const, product_images: [] }
    expect(getMissingFields(draft)).toEqual(['descripción', 'precio', 'disponibilidad', 'fotografía oficial'])
    expect(isPublishable(draft)).toBe(false)
  })

  it('acepta una ficha completa', () => {
    const ready = {
      description: 'Texto verificado',
      price_cents: 0,
      stock_status: 'consultar' as const,
      product_images: [{ id: '1', url: 'https://x/y.jpg', alt: 'Caja', position: 0 }],
    }
    expect(isPublishable(ready)).toBe(true)
  })
})
