'use client'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'

export const CHECKOUT_STEPS = ['Revisión', 'Datos', 'Entrega', 'Confirmación'] as const

// Indicador de progreso del checkout; los pasos completados se marcan con check
export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Pasos del pedido">
      {CHECKOUT_STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none" aria-current={active ? 'step' : undefined}>
            <span className="flex items-center gap-2.5">
              <span className={`relative grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-all duration-500 ${
                done ? 'border-primary bg-primary text-primary-foreground' : active ? 'border-primary text-primary' : 'border-border-strong text-muted-foreground'
              }`}>
                {done ? <Check aria-hidden className="size-4" /> : i + 1}
                {active && <motion.span layoutId="paso-activo" className="absolute -inset-1.5 rounded-full border border-primary/40" />}
              </span>
              <span className={`hidden text-xs font-medium sm:inline ${active || done ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
            </span>
            {i < CHECKOUT_STEPS.length - 1 && (
              <span aria-hidden className="relative h-px flex-1 overflow-hidden bg-border-strong">
                <motion.span className="absolute inset-y-0 left-0 bg-primary" initial={false} animate={{ width: done ? '100%' : '0%' }} transition={{ duration: 0.6 }} />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
