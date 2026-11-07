import type { StockStatus } from '@/shared/types/domain'
import { STOCK_LABELS } from '@/features/catalogo/domain/completeness'

const DOT: Record<StockStatus, string> = {
  disponible: 'bg-success',
  consultar: 'bg-accent',
  agotado: 'bg-muted-foreground/50',
  pendiente: 'bg-warning',
}

// Estado de disponibilidad honesto, sin mensajes de escasez artificial
export function StockPill({ status, className = '' }: { status: StockStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border border-border bg-card/95 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink ${className}`}>
      <span aria-hidden className={`size-1.5 rounded-full ${DOT[status]}`} />
      {STOCK_LABELS[status]}
    </span>
  )
}
