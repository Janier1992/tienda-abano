import type { Product } from '@/shared/types/domain'

// Campos que deben estar verificados antes de publicar (espejo de la restricción active_requires_data)
export function getMissingFields(product: Pick<Product, 'description' | 'price_cents' | 'stock_status' | 'product_images'>): string[] {
  const missing: string[] = []
  if (!product.description) missing.push('descripción')
  if (product.price_cents === null) missing.push('precio')
  if (product.stock_status === 'pendiente') missing.push('disponibilidad')
  if (product.product_images.length === 0) missing.push('fotografía oficial')
  return missing
}

export function isPublishable(product: Parameters<typeof getMissingFields>[0]): boolean {
  return getMissingFields(product).length === 0
}

export const STOCK_LABELS: Record<Product['stock_status'], string> = {
  pendiente: 'Disponibilidad pendiente de confirmar',
  disponible: 'Disponible',
  agotado: 'Sin disponibilidad',
  consultar: 'Consultar disponibilidad',
}
