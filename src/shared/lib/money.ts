// Los importes se manejan siempre en céntimos enteros para evitar errores de coma flotante.
export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(cents / 100)
}

// Convierte "12,50" o "12.50" a céntimos; devuelve null si no es un importe válido.
export function parseMoneyToCents(input: string): number | null {
  const normalized = input.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}
