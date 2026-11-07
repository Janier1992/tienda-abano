import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { getServices } from '@/features/contenido/data'
import { ButtonLink } from '@/shared/components/ui/button'
import { Notice } from '@/shared/components/ui/notice'
import { DataState } from '@/shared/components/data-state'
import { Container, PageHeader } from '@/shared/components/layout'
import { Stagger, StaggerItem } from '@/shared/components/motion/reveal'

export const metadata: Metadata = { title: 'Servicios' }

// Solo se muestran servicios que la marca confirmó y publicó
export default async function ServicesPage() {
  const result = await getServices()
  return (
    <>
      <PageHeader eyebrow="Servicios" title={<>Más allá del <em className="text-gold">producto</em></>} description="Acompañamiento experto para elegir, conservar y compartir. Cada servicio indica sus condiciones y disponibilidad." />
      <Container className="py-16">
        <DataState result={result}>
          {(services) =>
            services.length === 0 ? (
              <Notice title="Aún no hay servicios publicados">Si buscas asesoría o atención especializada, escríbenos y te indicaremos qué ofrece la marca.</Notice>
            ) : (
              <Stagger as="ul" className="grid gap-px overflow-hidden rounded-[2rem] border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
                {services.map((service, i) => (
                  <StaggerItem key={service.id} as="li" className="group flex flex-col gap-6 bg-background p-8 transition-colors duration-500 hover:bg-card md:p-10">
                    <span className="font-display text-6xl text-gold">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1 space-y-3">
                      <h2 className="text-4xl">{service.name}</h2>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                    </div>
                    <dl className="space-y-2 border-t border-border pt-5 text-sm">
                      {service.conditions && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Condiciones</dt><dd className="text-right">{service.conditions}</dd></div>}
                      {service.availability && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Disponibilidad</dt><dd className="text-right">{service.availability}</dd></div>}
                    </dl>
                    <ButtonLink href="/contacto" variant="outline" className="self-start">Solicitar información <ArrowUpRight className="size-4" /></ButtonLink>
                  </StaggerItem>
                ))}
              </Stagger>
            )
          }
        </DataState>
      </Container>
    </>
  )
}
