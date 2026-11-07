import { describe, expect, it } from 'vitest'
import { getSalesEnableMissing, parseRegions } from './settings'

describe('requisitos para activar la venta', () => {
  it('lista todo lo pendiente en la configuración inicial', () => {
    const initial = { legal_responsible: null, legal_validated_at: null, age_verification_provider: null, payment_provider: null, allowed_regions: [] }
    expect(getSalesEnableMissing(initial)).toHaveLength(5)
  })

  it('no reporta faltantes cuando todo está validado', () => {
    const ready = {
      legal_responsible: 'Asesoría legal',
      legal_validated_at: '2026-11-01',
      age_verification_provider: 'proveedor',
      payment_provider: 'pasarela',
      allowed_regions: ['ES-MD'],
    }
    expect(getSalesEnableMissing(ready)).toEqual([])
  })
})

describe('regiones', () => {
  it('normaliza, deduplica y descarta vacíos', () => {
    expect(parseRegions('es-md, ES-MD , es-ct,,')).toEqual(['ES-MD', 'ES-CT'])
    expect(parseRegions('   ')).toEqual([])
  })
})
