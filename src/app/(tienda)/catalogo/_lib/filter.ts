import type { Category, Product, StockStatus } from '@/shared/types/domain'
import { fuzzySearch } from '@/features/catalogo/domain/search'

export interface CatalogParams {
  q: string
  categoria: string
  disponibilidad: StockStatus | ''
  marca?: string
  fortaleza?: string
  cepo?: string
}

const STOCK_VALUES: StockStatus[] = ['disponible', 'agotado', 'consultar']

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? ''
}

// Los parámetros de la URL son entrada no confiable: se recortan y se validan contra valores conocidos
export function parseCatalogParams(raw: Record<string, string | string[] | undefined>): CatalogParams {
  const stock = first(raw.disponibilidad) as StockStatus
  const params: CatalogParams = {
    q: first(raw.q),
    categoria: first(raw.categoria),
    disponibilidad: STOCK_VALUES.includes(stock) ? stock : '',
  }
  const marca = first(raw.marca)
  if (marca) params.marca = marca
  const fortaleza = first(raw.fortaleza)
  if (fortaleza) params.fortaleza = fortaleza
  const cepo = first(raw.cepo)
  if (cepo) params.cepo = cepo
  return params
}

export function filterCatalog(products: Product[], categories: Category[], params: CatalogParams): Product[] {
  const category = categories.find((c) => c.slug === params.categoria)
  const filtered = products.filter((product) => {
    if (params.categoria && product.category_id !== category?.id) return false
    if (params.disponibilidad && product.stock_status !== params.disponibilidad) return false
    if (params.marca && product.brand?.toLowerCase() !== params.marca.toLowerCase()) return false
    if (params.fortaleza && product.strength !== Number(params.fortaleza)) return false
    if (params.cepo) {
      if (!product.ring_gauge) return false
      if (params.cepo === 'fino' && (product.ring_gauge < 36 || product.ring_gauge > 42)) return false
      if (params.cepo === 'medio' && (product.ring_gauge < 43 || product.ring_gauge > 48)) return false
      if (params.cepo === 'robusto' && (product.ring_gauge < 49 || product.ring_gauge > 52)) return false
      if (params.cepo === 'grueso' && product.ring_gauge < 53) return false
    }
    return true
  })
  return fuzzySearch(filtered, params.q, (p) => [p.brand, p.name, p.vitola_galera, p.presentation, p.description, ...p.tasting_notes].filter(Boolean).join(' '))
}
