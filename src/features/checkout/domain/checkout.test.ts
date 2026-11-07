import { describe, expect, it } from 'vitest'
import { evaluateSalesGate } from './sales-gate'
import { priceLines } from './pricing'

const closed = {
  sales_enabled: false,
  allowed_regions: [],
  legal_validated_at: null,
  age_verification_provider: null,
  payment_provider: null,
}
const open = {
  sales_enabled: true,
  allowed_regions: ['ES-MD'],
  legal_validated_at: '2026-11-01T00:00:00Z',
  age_verification_provider: 'proveedor-edad',
  payment_provider: 'pasarela',
}

describe('control de venta', () => {
  it('bloquea por defecto mientras no haya validación legal', () => {
    expect(evaluateSalesGate(closed, 'ES-MD')).toEqual(['ventas_deshabilitadas'])
  })

  it('bloquea regiones no habilitadas aunque la venta esté activa', () => {
    expect(evaluateSalesGate(open, 'FR')).toEqual(['region_no_habilitada'])
    expect(evaluateSalesGate(open, null)).toEqual(['region_no_habilitada'])
  })

  it('exige verificación de edad y pago configurados', () => {
    const reasons = evaluateSalesGate({ ...open, age_verification_provider: null, payment_provider: null }, 'ES-MD')
    expect(reasons).toEqual(['verificacion_edad_no_disponible', 'pago_no_disponible'])
  })

  it('permite la compra solo con todas las condiciones cumplidas', () => {
    expect(evaluateSalesGate(open, 'ES-MD')).toEqual([])
  })
})

describe('recálculo de precios en servidor', () => {
  const products = [
    { id: 'a', name: 'A', price_cents: 1000, stock_status: 'disponible' as const, active: true, blocked_regions: [] },
    { id: 'b', name: 'B', price_cents: null, stock_status: 'disponible' as const, active: true, blocked_regions: [] },
    { id: 'c', name: 'C', price_cents: 500, stock_status: 'agotado' as const, active: true, blocked_regions: [] },
    { id: 'd', name: 'D', price_cents: 500, stock_status: 'disponible' as const, active: true, blocked_regions: ['ES-MD'] },
    { id: 'e', name: 'E', price_cents: 500, stock_status: 'disponible' as const, active: false, blocked_regions: [] },
  ]

  it('usa el precio oficial y suma el subtotal', () => {
    const result = priceLines([{ productId: 'a', quantity: 3 }], products, 'ES-MD')
    expect(result.subtotalCents).toBe(3000)
    expect(result.problems).toEqual([])
  })

  it('reporta cada producto que no puede venderse', () => {
    const requested = ['b', 'c', 'd', 'e', 'z'].map((productId) => ({ productId, quantity: 1 }))
    const reasons = priceLines(requested, products, 'ES-MD').problems.map((p) => p.reason)
    expect(reasons).toEqual(['sin_precio', 'no_disponible', 'bloqueado_region', 'no_encontrado', 'no_encontrado'])
  })

  it('rechaza cantidades manipuladas', () => {
    const result = priceLines([{ productId: 'a', quantity: 1000 }, { productId: 'a', quantity: 1.5 }], products, 'ES-MD')
    expect(result.lines).toEqual([])
    expect(result.problems).toHaveLength(2)
  })
})
