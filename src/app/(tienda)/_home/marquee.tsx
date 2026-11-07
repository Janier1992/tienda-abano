import { Sparkle } from 'lucide-react'

const VALUES = ['Selección curada', 'Conservación controlada', 'Asesoría personal', 'Compra informada', 'Atención humana', 'Origen documentado']

// Franja de valores en movimiento continuo (se detiene con "reducir movimiento")
export function Marquee() {
  const items = [...VALUES, ...VALUES]
  return (
    <div id="descubrir" className="relative overflow-hidden border-y border-border bg-surface/50 py-6 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="animate-marquee flex w-max gap-12">
        {items.map((value, i) => (
          <span key={i} aria-hidden={i >= VALUES.length} className="flex items-center gap-12 whitespace-nowrap font-display text-3xl italic text-foreground/80 md:text-4xl">
            {value}
            <Sparkle aria-hidden className="size-4 text-primary" />
          </span>
        ))}
      </div>
    </div>
  )
}
