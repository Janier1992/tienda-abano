import type { ReactNode } from 'react'
import type { DataResult } from '@/shared/types/domain'
import { Notice } from '@/shared/components/ui/notice'

// Renderiza los estados no exitosos de una lectura de forma uniforme
export function DataState<T>({ result, children }: { result: DataResult<T>; children: (data: T) => ReactNode }) {
  if (result.status === 'no_configurado') {
    return (
      <Notice tone="warning" title="Servicio pendiente de configuración">
        La fuente oficial de datos todavía no está conectada. El equipo de la marca debe completar la configuración.
      </Notice>
    )
  }
  if (result.status === 'error') {
    return <Notice tone="error" title="Servicio no disponible temporalmente">{result.message}</Notice>
  }
  return <>{children(result.data)}</>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-2xl ${className}`} />
}

export function PendingBadge({ label = 'Pendiente de configuración' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/25 bg-warning/[0.08] px-3 py-1 text-xs text-warning">
      <span aria-hidden className="size-1.5 rounded-full bg-warning" />{label}
    </span>
  )
}
