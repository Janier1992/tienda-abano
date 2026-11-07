import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SearchX } from 'lucide-react'
import { getActiveProducts, getCategories } from '@/features/catalogo/data'
import { getBrandSettings } from '@/features/contenido/data'
import { ButtonLink } from '@/shared/components/ui/button'
import { Notice } from '@/shared/components/ui/notice'
import { DataState, Skeleton } from '@/shared/components/data-state'
import { Container, PageHeader } from '@/shared/components/layout'
import { Stagger, StaggerItem } from '@/shared/components/motion/reveal'
import { ProductCard } from '../_components/product-card'
import { TrackEvent } from '../_components/track-event'
import { filterCatalog, parseCatalogParams } from './_lib/filter'
import { FilterBar } from './filter-bar'

export const metadata: Metadata = { title: 'Colección' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader
        eyebrow="Colección"
        title={<>La <em className="text-gold">colección</em></>}
        description="Cajas, estuches, selecciones y accesorios. Cada ficha muestra precio, disponibilidad y condiciones antes de cualquier decisión."
      />
      <Container className="pb-8">
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogResults searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  )
}

async function CatalogResults({ searchParams }: { searchParams: SearchParams }) {
  const params = parseCatalogParams(await searchParams)
  const [productsResult, categoriesResult, settingsResult] = await Promise.all([getActiveProducts(), getCategories(), getBrandSettings()])
  const categories = categoriesResult.status === 'ok' ? categoriesResult.data : []
  const currency = settingsResult.status === 'ok' ? settingsResult.data.currency : 'EUR'

  return (
    <>
      <FilterBar params={params} categories={categories} />
      <div className="pt-10">
        <DataState result={productsResult}>
          {(products) => {
            const results = filterCatalog(products, categories, params)
            if (products.length === 0) {
              return <Notice title="La colección aún no tiene productos publicados">La marca está preparando las fichas oficiales. Puedes dejarnos tu consulta en contacto.</Notice>
            }
            if (results.length === 0) return <NoResults query={params.q} />
            return (
              <>
                {params.q && <TrackEvent name="busqueda" props={{ resultados: results.length }} />}
                <p className="mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
                  {results.length} {results.length === 1 ? 'pieza' : 'piezas'}
                </p>
                {/* La clave reinicia la animación escalonada al cambiar los filtros */}
                <Stagger key={JSON.stringify(params)} as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((product, i) => (
                    <StaggerItem key={product.id} as="li"><ProductCard product={product} currency={currency} priority={i < 3} /></StaggerItem>
                  ))}
                </Stagger>
              </>
            )
          }}
        </DataState>
      </div>
    </>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl border border-dashed border-border-strong px-6 py-20 text-center">
      <TrackEvent name="busqueda_sin_resultados" props={{ longitud: query.length }} />
      <span className="grid size-16 place-items-center rounded-full border border-border bg-surface"><SearchX className="size-6 text-primary" /></span>
      <div className="space-y-2">
        <h2 className="text-4xl">Sin coincidencias</h2>
        <p className="max-w-md text-sm text-muted-foreground">Prueba con otra palabra o quita algún filtro. Si buscas algo concreto, un asesor puede ayudarte.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/catalogo" variant="outline">Ver toda la colección</ButtonLink>
        <ButtonLink href="/contacto">Consultar a un asesor</ButtonLink>
      </div>
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="space-y-10 pt-4" aria-busy="true" aria-label="Cargando catálogo">
      <Skeleton className="h-14 rounded-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />)}
      </div>
    </div>
  )
}
