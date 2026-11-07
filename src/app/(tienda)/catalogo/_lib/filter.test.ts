import { describe, expect, it } from 'vitest'
import type { Category, Product } from '@/shared/types/domain'
import { filterCatalog, parseCatalogParams } from './filter'

const categories: Category[] = [{ id: 'c1', slug: 'robustos', name: 'Robustos', position: 0, active: true }]

function product(overrides: Partial<Product>): Product {
  return {
    id: 'p', slug: 'p', name: 'Producto', category_id: null, description: null, presentation: null,
    price_cents: 1000, stock_status: 'disponible', compliance_notice: null, blocked_regions: [],
    active: true, updated_at: '2026-11-07', product_images: [],
    brand: null, vitola_galera: null, ring_gauge: null, length_mm: null, strength: null, tasting_notes: [], ...overrides,
  }
}

const products = [
  product({ id: '1', name: 'Robusto Clásico', category_id: 'c1' }),
  product({ id: '2', name: 'Petit Corona', stock_status: 'agotado' }),
]

describe('filtros del catálogo', () => {
  it('ignora valores desconocidos en la URL', () => {
    expect(parseCatalogParams({ disponibilidad: 'inventado', q: ['  robusto ', 'x'] })).toEqual({ q: 'robusto', categoria: '', disponibilidad: '' })
  })

  it('filtra por categoría, disponibilidad y texto', () => {
    expect(filterCatalog(products, categories, { q: '', categoria: 'robustos', disponibilidad: '' }).map((p) => p.id)).toEqual(['1'])
    expect(filterCatalog(products, categories, { q: '', categoria: '', disponibilidad: 'agotado' }).map((p) => p.id)).toEqual(['2'])
    expect(filterCatalog(products, categories, { q: 'petit', categoria: '', disponibilidad: '' }).map((p) => p.id)).toEqual(['2'])
  })

  it('una categoría inexistente no devuelve productos', () => {
    expect(filterCatalog(products, categories, { q: '', categoria: 'otra', disponibilidad: '' })).toEqual([])
  })
})
