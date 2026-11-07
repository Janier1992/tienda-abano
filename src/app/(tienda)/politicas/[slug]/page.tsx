import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getPage } from '@/features/contenido/data'
import { DataState, Skeleton } from '@/shared/components/data-state'
import { Container } from '@/shared/components/layout'
import { Reveal } from '@/shared/components/motion/reveal'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const result = await getPage(slug)
  return { title: result.status === 'ok' && result.data ? result.data.title : 'Información' }
}

export default function PolicyPage({ params }: { params: Params }) {
  return (
    <Container className="py-16 md:py-24">
      <Suspense fallback={<div className="mx-auto max-w-prose space-y-4"><Skeleton className="h-16" /><Skeleton className="h-96" /></div>}>
        <PolicyContent params={params} />
      </Suspense>
    </Container>
  )
}

async function PolicyContent({ params }: { params: Params }) {
  const { slug } = await params
  const result = await getPage(slug)
  if (result.status === 'ok' && !result.data) notFound()

  return (
    <DataState result={result}>
      {(page) =>
        page && (
          <Reveal>
            <article className="mx-auto max-w-prose space-y-10">
              <header className="space-y-6 border-b border-border pb-10">
                <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
                  <ArrowLeft aria-hidden className="size-3.5" />Volver al inicio
                </Link>
                <p className="eyebrow">Información legal</p>
                <h1 className="text-5xl md:text-6xl">{page.title}</h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2"><CalendarDays aria-hidden className="size-3.5 text-primary" />Actualizado el {new Date(page.updated_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</span>
                  <span className="flex items-center gap-2"><UserRound aria-hidden className="size-3.5 text-primary" />Responsable: {page.responsible}</span>
                </div>
              </header>
              {/* Texto plano: el contenido administrable nunca se interpreta como HTML */}
              <div className="whitespace-pre-line text-base leading-[1.9] text-foreground/85 md:text-lg">{page.body}</div>
            </article>
          </Reveal>
        )
      }
    </DataState>
  )
}
