import { describe, expect, it } from 'vitest'
import { fuzzySearch, levenshtein, normalizeText } from './search'

const items = [
  { name: 'Robusto Clásico', presentation: 'Caja de 25' },
  { name: 'Petit Corona', presentation: 'Estuche de 5' },
  { name: 'Churchill Reserva', presentation: 'Caja de 10' },
]
const text = (item: (typeof items)[number]) => `${item.name} ${item.presentation}`

describe('búsqueda tolerante', () => {
  it('normaliza acentos y mayúsculas', () => {
    expect(normalizeText('  Clásico ')).toBe('clasico')
  })

  it('calcula la distancia de edición', () => {
    expect(levenshtein('robusto', 'robsto')).toBe(1)
    expect(levenshtein('igual', 'igual')).toBe(0)
  })

  it('encuentra por coincidencia exacta sin acentos', () => {
    expect(fuzzySearch(items, 'clasico', text).map((i) => i.name)).toEqual(['Robusto Clásico'])
  })

  it('tolera errores comunes de escritura', () => {
    expect(fuzzySearch(items, 'churchil', text)[0]?.name).toBe('Churchill Reserva')
    expect(fuzzySearch(items, 'robsto', text)[0]?.name).toBe('Robusto Clásico')
  })

  it('exige que todos los términos coincidan', () => {
    expect(fuzzySearch(items, 'corona caja', text)).toEqual([])
  })

  it('devuelve todo con consulta vacía y nada con términos ajenos', () => {
    expect(fuzzySearch(items, '   ', text)).toHaveLength(3)
    expect(fuzzySearch(items, 'xilofono', text)).toEqual([])
  })
})
