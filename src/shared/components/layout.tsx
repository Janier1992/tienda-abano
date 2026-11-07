import type { ReactNode } from 'react'
import { Reveal } from '@/shared/components/motion/reveal'

// Contenedor estándar de página: mismo ancho y márgenes en toda la tienda
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 md:px-8 ${className}`}>{children}</div>
}

// Cabecera editorial de página interior
export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden className="pointer-events-none absolute -top-32 right-0 h-72 w-[40rem] rounded-full bg-primary/10 blur-[110px]" />
      <Container className="relative py-16 md:py-24">
        <Reveal className="max-w-3xl space-y-5">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="text-5xl md:text-7xl">{title}</h1>
          {description && <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>}
          {children}
        </Reveal>
      </Container>
    </section>
  )
}
