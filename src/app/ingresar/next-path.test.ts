import { describe, expect, it } from 'vitest'
import { safeNextPath } from './next-path'

describe('redirección tras iniciar sesión', () => {
  it('acepta rutas internas', () => {
    expect(safeNextPath('/admin')).toBe('/admin')
    expect(safeNextPath('/cuenta/pedidos')).toBe('/cuenta/pedidos')
  })

  it('rechaza destinos externos o ambiguos', () => {
    for (const value of ['https://malicioso.example', '//malicioso.example', '/\\malicioso.example', '', null]) {
      expect(safeNextPath(value)).toBe('/cuenta')
    }
  })
})
