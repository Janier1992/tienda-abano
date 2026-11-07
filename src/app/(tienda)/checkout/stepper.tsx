'use client'
import { Check } from 'lucide-react'

export const CHECKOUT_STEPS = [
  { step: 1, title: 'Revisión & Edad', subtitle: 'Verificación Legal (+18)' },
  { step: 2, title: 'Jurisdicción', subtitle: 'Entrega & Código Postal' },
  { step: 3, title: 'Logística HR', subtitle: 'Despacho Climatizado 69%' },
  { step: 4, title: 'Confirmación', subtitle: 'Pago Certificado & Factura' },
] as const

export function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Progreso de Checkout" className="rounded border border-border bg-card p-3 shadow-2xs">
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CHECKOUT_STEPS.map((item, i) => {
          const done = i < current
          const active = i === current

          return (
            <li
              key={item.title}
              aria-current={active ? 'step' : undefined}
              className={`flex items-center gap-3 rounded border p-2.5 transition-colors ${
                active
                  ? 'border-accent bg-accent-soft/20 shadow-2xs'
                  : done
                  ? 'border-border bg-surface/70'
                  : 'border-border/60 bg-surface/30 opacity-70'
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-all ${
                  done
                    ? 'bg-accent text-ink'
                    : active
                    ? 'bg-ink text-ink-foreground'
                    : 'bg-border text-muted-foreground'
                }`}
              >
                {done ? <Check className="size-3.5 stroke-[3]" /> : item.step}
              </span>

              <div className="flex flex-col min-w-0">
                <span className={`label-gold !text-[0.55rem] uppercase truncate ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {active ? 'Fase Activa' : done ? 'Completado' : `Paso 0${item.step}`}
                </span>
                <span className={`label-spec text-xs truncate ${active || done ? 'text-ink font-semibold' : 'text-muted-foreground'}`}>
                  {item.title}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
