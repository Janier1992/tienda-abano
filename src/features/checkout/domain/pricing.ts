import type { Product } from '@/shared/types/domain'
import { MAX_QUANTITY } from '@/features/carrito/domain/cart'

export interface RequestedLine {
  productId: string
  quantity: number
}

export interface PricedLine {
  productId: string
  productName: string
  unitPriceCents: number
  quantity: number
}

export interface LineProblem {
  productId: string
  reason: 'no_encontrado' | 'no_disponible' | 'sin_precio' | 'bloqueado_region' | 'cantidad_invalida'
}

type PricingProduct = Pick<Product, 'id' | 'name' | 'price_cents' | 'stock_status' | 'active' | 'blocked_regions'>

// Recalcula el pedido con los datos oficiales de la base de datos; ignora precios enviados por el cliente.
export function priceLines(requested: RequestedLine[], products: PricingProduct[], region: string) {
  const byId = new Map(products.map((product) => [product.id, product]))
  const lines: PricedLine[] = []
  const problems: LineProblem[] = []

  for (const { productId, quantity } of requested) {
    const product = byId.get(productId)
    const problem = findProblem(product, quantity, region)
    if (problem) {
      problems.push({ productId, reason: problem })
      continue
    }
    const valid = product as PricingProduct & { price_cents: number }
    lines.push({ productId, productName: valid.name, unitPriceCents: valid.price_cents, quantity })
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0)
  return { lines, problems, subtotalCents }
}

function findProblem(product: PricingProduct | undefined, quantity: number, region: string): LineProblem['reason'] | null {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return 'cantidad_invalida'
  if (!product || !product.active) return 'no_encontrado'
  if (product.stock_status !== 'disponible') return 'no_disponible'
  if (product.price_cents === null) return 'sin_precio'
  if (product.blocked_regions.includes(region)) return 'bloqueado_region'
  return null
}
