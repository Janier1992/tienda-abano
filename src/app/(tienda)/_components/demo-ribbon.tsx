import { Sparkles } from 'lucide-react'

// Aviso permanente del modo prototipo: el contenido mostrado es ilustrativo
export function DemoRibbon() {
  return (
    <div role="note" className="border-b border-accent/40 bg-accent-soft/40 px-4 py-1.5 text-center text-[0.65rem] font-semibold tracking-wide text-ink">
      <Sparkles aria-hidden className="mr-1.5 inline size-3 align-[-2px] text-primary" />
      Prototipo de demostración · Contenido, precios e imágenes ilustrativos · Ningún pedido es real
    </div>
  )
}
