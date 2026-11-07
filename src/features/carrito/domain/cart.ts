// Estado del carrito en el cliente. Es orientativo: el servidor recalcula precios al pedir.

export const MAX_QUANTITY = 99

export interface CartLine {
  productId: string
  slug: string
  name: string
  unitPriceCents: number
  quantity: number
  imageUrl?: string
}

export type CartAction =
  | { type: 'add'; line: Omit<CartLine, 'quantity'>; quantity?: number }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: CartLine[] }

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)))
}

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const existing = lines.find((line) => line.productId === action.line.productId)
      const added = action.quantity ?? 1
      if (existing) {
        return lines.map((line) =>
          line === existing ? { ...line, quantity: clampQuantity(line.quantity + added) } : line,
        )
      }
      return [...lines, { ...action.line, quantity: clampQuantity(added) }]
    }
    case 'setQuantity':
      return lines.map((line) =>
        line.productId === action.productId ? { ...line, quantity: clampQuantity(action.quantity) } : line,
      )
    case 'remove':
      return lines.filter((line) => line.productId !== action.productId)
    case 'clear':
      return []
    case 'hydrate':
      return action.lines.filter(isValidLine).map((line) => ({ ...line, quantity: clampQuantity(line.quantity) }))
  }
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0)
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

// Valida datos rehidratados desde sessionStorage (contenido no confiable)
function isValidLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false
  const line = value as Record<string, unknown>
  return (
    typeof line.productId === 'string' && typeof line.slug === 'string' && typeof line.name === 'string' &&
    Number.isInteger(line.unitPriceCents) && (line.unitPriceCents as number) >= 0 &&
    typeof line.quantity === 'number' && isSafeImageUrl(line.imageUrl)
  )
}

// Solo rutas propias o https: evita inyectar esquemas como javascript: desde el almacenamiento
function isSafeImageUrl(url: unknown): boolean {
  return url === undefined || (typeof url === 'string' && (url.startsWith('/') || url.startsWith('https://')))
}
