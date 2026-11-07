import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'

type Tone = 'info' | 'warning' | 'error' | 'success'

const TONES: Record<Tone, { icon: typeof Info; className: string; iconClass: string }> = {
  info: { icon: Info, className: 'border-border bg-card', iconClass: 'text-primary' },
  warning: { icon: AlertTriangle, className: 'border-accent/60 bg-accent-soft/30', iconClass: 'text-warning' },
  error: { icon: XCircle, className: 'border-danger/30 bg-danger/[0.07]', iconClass: 'text-danger' },
  success: { icon: CheckCircle2, className: 'border-success/30 bg-success/[0.07]', iconClass: 'text-success' },
}

// Estado explícito: qué ocurrió y cuál es el siguiente paso posible
export function Notice({ tone = 'info', title, children }: { tone?: Tone; title: string; children?: ReactNode }) {
  const { icon: Icon, className, iconClass } = TONES[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-4 rounded border p-5 ${className}`}>
      <span className={`grid size-9 shrink-0 place-items-center rounded-full bg-surface ${iconClass}`}>
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-foreground">{title}</p>
        {children && <div className="leading-relaxed text-muted-foreground">{children}</div>}
      </div>
    </div>
  )
}
