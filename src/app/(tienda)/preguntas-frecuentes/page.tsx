import type { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'
import { getFaqs } from '@/features/contenido/data'
import { ButtonLink } from '@/shared/components/ui/button'
import { Notice } from '@/shared/components/ui/notice'
import { DataState } from '@/shared/components/data-state'
import { Container, PageHeader } from '@/shared/components/layout'
import { Reveal } from '@/shared/components/motion/reveal'
import { Accordion } from '../_components/accordion'

export const metadata: Metadata = { title: 'Preguntas frecuentes' }

export default async function FaqPage() {
  const result = await getFaqs()
  return (
    <>
      <PageHeader eyebrow="Ayuda" title={<>Preguntas <em className="text-gold">frecuentes</em></>} description="Respuestas oficiales a las dudas más habituales. Si no encuentras la tuya, un asesor te ayuda." />
      <Container className="grid gap-12 py-16 lg:grid-cols-[2fr_1fr]">
        <Reveal>
          <DataState result={result}>
            {(faqs) =>
              faqs.length === 0 ? (
                <Notice title="Las respuestas oficiales están pendientes de publicación">Mientras tanto, un asesor puede resolver tu duda.</Notice>
              ) : (
                <Accordion
                  numbered defaultOpen={faqs[0]?.id ?? null}
                  items={faqs.map((faq) => ({ id: faq.id, title: faq.question, content: <p className="whitespace-pre-line">{faq.answer}</p> }))}
                />
              )
            }
          </DataState>
        </Reveal>
        <Reveal delay={0.15} className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass ring-gold space-y-5 rounded-[2rem] p-8">
            <span className="grid size-12 place-items-center rounded-full bg-primary/15 text-primary"><MessageCircle aria-hidden className="size-5" /></span>
            <h2 className="text-3xl">¿No encuentras tu respuesta?</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Pregunta al asistente desde el botón inferior o escríbenos: te responde una persona del equipo.</p>
            <ButtonLink href="/contacto" className="w-full">Contactar con un asesor</ButtonLink>
          </div>
        </Reveal>
      </Container>
    </>
  )
}
