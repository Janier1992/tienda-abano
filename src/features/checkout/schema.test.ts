import { describe, expect, it } from 'vitest'
import { checkoutSchema, readCheckoutForm } from './schema'

const PRODUCT_ID = '3f2b8c1e-5d4a-4b7e-9c2f-1a2b3c4d5e6f'

function form(entries: Record<string, string>): FormData {
  const data = new FormData()
  Object.entries(entries).forEach(([key, value]) => data.set(key, value))
  return data
}

const valid = {
  contactName: 'Ana Pérez', contactEmail: 'ana@example.com', line1: 'Calle Mayor 1', city: 'Madrid',
  postalCode: '28001', country: 'España', region: 'ES-MD', ageDeclaration: 'on', termsAccepted: 'on',
  lines: JSON.stringify([{ productId: PRODUCT_ID, quantity: 2 }]),
}

describe('formulario de checkout', () => {
  it('acepta un pedido completo', () => {
    expect(checkoutSchema.safeParse(readCheckoutForm(form(valid)).input).success).toBe(true)
  })

  it('ignora precios enviados por el cliente', () => {
    const tampered = form({ ...valid, lines: JSON.stringify([{ productId: PRODUCT_ID, quantity: 1, unitPriceCents: 1 }]) })
    const parsed = checkoutSchema.parse(readCheckoutForm(tampered).input)
    expect(parsed.lines[0]).toEqual({ productId: PRODUCT_ID, quantity: 1 })
  })

  it('exige declaración de edad y condiciones', () => {
    const rest = Object.fromEntries(Object.entries(valid).filter(([key]) => key !== 'ageDeclaration' && key !== 'termsAccepted'))
    const result = checkoutSchema.safeParse(readCheckoutForm(form(rest)).input)
    const fields = result.success ? [] : result.error.issues.map((i) => i.path[0])
    expect(fields).toEqual(expect.arrayContaining(['ageDeclaration', 'termsAccepted']))
  })

  it('rechaza líneas corruptas o identificadores no válidos', () => {
    expect(checkoutSchema.safeParse(readCheckoutForm(form({ ...valid, lines: '{roto' })).input).success).toBe(false)
    expect(checkoutSchema.safeParse(readCheckoutForm(form({ ...valid, lines: '[{"productId":"x","quantity":1}]' })).input).success).toBe(false)
  })

  it('conserva los valores escritos para poder corregirlos', () => {
    expect(readCheckoutForm(form(valid)).values.city).toBe('Madrid')
  })
})
