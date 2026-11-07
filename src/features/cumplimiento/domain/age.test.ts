import { describe, expect, it } from 'vitest'
import { checkAge } from './age'

const today = new Date(2026, 10, 7) // 7 de noviembre de 2026

describe('declaración de mayoría de edad', () => {
  it('acepta a quien cumple la edad mínima exactamente hoy', () => {
    expect(checkAge(7, 11, 2008, 18, today)).toBe('adulto')
  })

  it('rechaza a quien la cumple mañana', () => {
    expect(checkAge(8, 11, 2008, 18, today)).toBe('menor')
  })

  it('respeta edades mínimas mayores según jurisdicción', () => {
    expect(checkAge(1, 1, 2006, 21, today)).toBe('menor')
    expect(checkAge(1, 1, 2005, 21, today)).toBe('adulto')
  })

  it('detecta fechas imposibles, futuras o absurdas', () => {
    expect(checkAge(31, 2, 1990, 18, today)).toBe('fecha_invalida')
    expect(checkAge(29, 2, 2001, 18, today)).toBe('fecha_invalida')
    expect(checkAge(1, 1, 2030, 18, today)).toBe('fecha_invalida')
    expect(checkAge(1, 1, 1890, 18, today)).toBe('fecha_invalida')
  })

  it('acepta el 29 de febrero en año bisiesto', () => {
    expect(checkAge(29, 2, 2000, 18, today)).toBe('adulto')
  })
})
