import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/shared/components/ui/button'

// Página no encontrada editorial; se renderiza fuera del layout de la tienda
export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-24">
      <div aria-hidden className="animate-aurora pointer-events-none absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[140px]" />
      <div className="relative max-w-xl space-y-8 text-center">
        <p aria-hidden className="font-display text-[9rem] leading-none text-gold md:text-[13rem]">404</p>
        <div className="space-y-4">
          <h1 className="text-5xl">Página no encontrada</h1>
          <p className="text-muted-foreground">El contenido que buscas no existe o ya no está disponible.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/catalogo" size="lg">Ver la colección <ArrowRight aria-hidden className="size-4" /></ButtonLink>
          <ButtonLink href="/contacto" size="lg" variant="outline">Contactar</ButtonLink>
        </div>
      </div>
    </main>
  )
}
