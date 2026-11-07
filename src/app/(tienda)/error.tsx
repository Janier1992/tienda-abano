'use client'
import { RotateCcw } from 'lucide-react'
import { Button, ButtonLink } from '@/shared/components/ui/button'
import { Container } from '@/shared/components/layout'

// Error inesperado: mensaje comprensible sin detalles técnicos y siguiente paso claro
export default function StoreError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="py-24">
      <div role="alert" className="mx-auto max-w-xl space-y-8 text-center">
        <p className="eyebrow">Algo no ha funcionado</p>
        <h1 className="text-5xl md:text-6xl">Una <em className="text-gold">pausa</em> inesperada</h1>
        <p className="text-muted-foreground">
          No pudimos mostrar esta página. Si estabas enviando un pedido o una solicitud, no se ha registrado como completado.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => retry()}><RotateCcw aria-hidden className="size-4" />Intentar de nuevo</Button>
          <ButtonLink href="/contacto" size="lg" variant="outline">Contactar con atención</ButtonLink>
        </div>
      </div>
    </Container>
  )
}
