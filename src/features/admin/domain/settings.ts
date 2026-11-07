import type { BrandSettings, RequestStatus } from '@/shared/types/domain'

type SalesRequirements = Pick<
  BrandSettings,
  'legal_responsible' | 'legal_validated_at' | 'age_verification_provider' | 'payment_provider' | 'allowed_regions'
>

// Requisitos para activar la venta (espejo de la restricción sales_requires_validation)
export function getSalesEnableMissing(settings: SalesRequirements): string[] {
  const missing: string[] = []
  if (!settings.legal_responsible) missing.push('responsable de la validación legal')
  if (!settings.legal_validated_at) missing.push('fecha de validación legal')
  if (!settings.age_verification_provider) missing.push('proveedor de verificación de edad')
  if (!settings.payment_provider) missing.push('proveedor de pago autorizado')
  if (settings.allowed_regions.length === 0) missing.push('al menos una región habilitada')
  return missing
}

// "ES-MD, es-ct ,," → ["ES-MD", "ES-CT"]
export function parseRegions(input: string): string[] {
  const codes = input.split(',').map((code) => code.trim().toUpperCase()).filter(Boolean)
  return [...new Set(codes)]
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  nuevo: 'Nuevo',
  asignado: 'Asignado',
  en_curso: 'En curso',
  resuelto: 'Resuelto',
}
