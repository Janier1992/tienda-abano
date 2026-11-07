import { describe, expect, it } from 'vitest'
import { canTransition, getAllowedTransitions } from './status'

describe('transiciones manuales de pedido', () => {
  it('nunca permite marcar un pago como confirmado a mano', () => {
    const all = ['iniciado', 'pendiente_pago', 'pago_confirmado', 'en_preparacion', 'enviado', 'incidencia'] as const
    for (const status of all) {
      expect(getAllowedTransitions(status, 'confirmado')).not.toContain('pago_confirmado')
    }
  })

  it('un pedido pendiente de pago solo puede cancelarse o marcarse con incidencia', () => {
    expect(getAllowedTransitions('pendiente_pago', 'pendiente')).toEqual(['cancelado', 'incidencia'])
  })

  it('exige pago confirmado para preparar, enviar o entregar', () => {
    expect(canTransition('incidencia', 'pendiente', 'enviado')).toBe(false)
    expect(canTransition('incidencia', 'confirmado', 'enviado')).toBe(true)
    expect(canTransition('pago_confirmado', 'confirmado', 'en_preparacion')).toBe(true)
  })

  it('no permite salir de estados finales', () => {
    expect(getAllowedTransitions('entregado', 'confirmado')).toEqual([])
    expect(getAllowedTransitions('cancelado', 'rechazado')).toEqual([])
  })

  it('no permite saltarse pasos', () => {
    expect(canTransition('pago_confirmado', 'confirmado', 'entregado')).toBe(false)
  })
})
