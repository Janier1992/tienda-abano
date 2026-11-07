import type { Category, Product, StockStatus } from '@/shared/types/domain'
import { fuzzySearch } from '@/features/catalogo/domain/search'

export interface CatalogParams {
  q: string
  categoria: string
  disponibilidad: StockStatus | ''
}

const STOCK_VALUES: StockStatus[] = ['disponible', 'agotado', 'consultar']

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? ''
}

// Los parámetros de la URL son entrada no confiable: se recortan y se validan contra valores conocidos
export function parseCatalogParams(raw: Record<string, string | string[] | undefined>): CatalogParams {
  const stock = first(raw.disponibilidad) as StockStatus
  return {
    q: first(raw.q),
    categoria: first(raw.categoria),
    disponibilidad: STOCK_VALUES.includes(stock) ? stock : '',
  }
}

export function filterCatalog(products: Product[], categories: Category[], params: CatalogParams): Product[] {
  const category = categories.find((c) => c.slug === params.categoria)
  const filtered = products.filter(
    (product) =>
      (!params.categoria || product.category_id === category?.id) &&
      (!params.disponibilidad || product.stock_status === params.disponibilidad),
  )
  return fuzzySearch(filtered, params.q, (p) => [p.brand, p.name, p.vitola_galera, p.presentation, p.description, ...p.tasting_notes].filter(Boolean).join(' '))
}
