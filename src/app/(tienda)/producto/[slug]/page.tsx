import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MapPinOff, ShieldAlert, ShieldCheck, Thermometer } from 'lucide-react'
import { getActiveProducts, getCategories, getProductBySlug } from '@/features/catalogo/data'
import { getBrandSettings } from '@/features/contenido/data'
import { getMissingFields } from '@/features/catalogo/domain/completeness'
import { formatMoney } from '@/shared/lib/money'
import { DataState, PendingBadge, Skeleton } from '@/shared/components/data-state'
import { Container } from '@/shared/components/layout'
import { Reveal } from '@/shared/components/motion/reveal'
import type { BrandSettings, Category, Product } from '@/shared/types/domain'
import { SpecTiles } from '@/features/catalogo/components/vitola-specs'
import { StockPill } from '../../_components/stock-pill'
import { TrackEvent } from '../../_components/track-event'
import { Gallery } from './gallery'
import { PrimaryAction } from './primary-action'
import { ProductDetails, RelatedProducts } from './sections'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductBySlug(slug)
  return { title: result.status === 'ok' && result.data ? `${result.data.name} · D.O.P.` : 'Ficha Técnica' }
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Container className="py-6 md:py-10">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </Container>
  )
}

async function ProductDetail({ params }: { params: Params }) {
  const { slug } = await params
  const [result, settingsResult, categoriesResult, productsResult] = await Promise.all([
    getProductBySlug(slug), getBrandSettings(), getCategories(), getActiveProducts(),
  ])
  if (result.status === 'ok' && !result.data) notFound()
  const settings = settingsResult.status === 'ok' ? settingsResult.data : null
  const categories = categoriesResult.status === 'ok' ? categoriesResult.data : []
  const products = productsResult.status === 'ok' ? productsResult.data : []

  return (
    <DataState result={result}>
      {(product) => product && (
        <>
          <ProductView product={product} settings={settings} category={categories.find((c) => c.id === product.category_id)} />
          <RelatedProducts product={product} products={products} currency={settings?.currency ?? 'EUR'} />
        </>
      )}
    </DataState>
  )
}

function ProductView({ product, settings, category }: { product: Product; settings: BrandSettings | null; category?: Category }) {
  const currency = settings?.currency ?? 'EUR'
  const missing = getMissingFields(product)
  return (
    <article>
      <TrackEvent name="ver_producto" props={{ slug: product.slug }} />

      {/* Barra de Trazabilidad y Autenticidad D.O.P. (Stitch) */}
      <div className="mb-6 flex flex-col gap-2 rounded border border-border bg-surface px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Ruta" className="flex items-center gap-2 text-muted-foreground">
          <Link href="/catalogo" className="label-gold text-accent transition-colors hover:text-ink">Archivo D.O.P.</Link>
          <ChevronRight aria-hidden className="size-3 text-border-strong" />
          {category && (
            <>
              <Link href={`/catalogo?categoria=${category.slug}`} className="transition-colors hover:text-ink">{category.name}</Link>
              <ChevronRight aria-hidden className="size-3 text-border-strong" />
            </>
          )}
          <span className="truncate font-semibold text-ink">{product.name}</span>
        </nav>

        <div className="hidden items-center gap-4 text-xs sm:flex">
          <span className="flex items-center gap-1.5 label-gold text-accent !text-[0.6rem]">
            <ShieldCheck className="size-3.5 text-accent" />
            Certificado D.O.P. No. CU-948210
          </span>
          <span className="flex items-center gap-1 text-muted-foreground label-spec text-[0.65rem]">
            <Thermometer className="size-3.5 text-accent" />
            Cava 18.2°C · 69.1% HR
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <Gallery product={product} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal className="space-y-6 rounded border border-border bg-card p-6 md:p-8 shadow-xs">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="label-gold">{product.brand ?? category?.name ?? 'Selección Privada'}</span>
                <StockPill status={product.stock_status} />
              </div>
              <h1 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">{product.name}</h1>
              {product.vitola_galera && (
                <p className="label-spec text-xs text-muted-foreground">
                  Vitola de Galera: <span className="text-ink font-semibold">{product.vitola_galera}</span>
                </p>
              )}
              {product.presentation && <p className="text-xs text-muted-foreground">{product.presentation}</p>}
            </div>

            <div className="border-t border-border pt-4">
              <SpecTiles product={product} />
            </div>

            <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
              <div>
                <span className="label-gold !text-[0.6rem] text-muted-foreground">Precio Oficial</span>
                {product.price_cents !== null ? (
                  <p className="font-display text-4xl tabular-nums text-ink">{formatMoney(product.price_cents, currency)}</p>
                ) : (
                  <PendingBadge label="Precio pendiente de confirmar" />
                )}
              </div>
              <p className="text-right text-xs text-muted-foreground">
                Envío isotérmico e impuestos<br />desglosados al confirmar
              </p>
            </div>

            {missing.length > 0 && (
              <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <PendingBadge label="Información pendiente" /> {missing.join(', ')}
              </p>
            )}

            <PrimaryAction product={product} settings={settings} />

            {product.compliance_notice && (
              <div className="flex gap-3 rounded border border-border bg-surface p-3.5 text-xs leading-relaxed text-muted-foreground">
                <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>{product.compliance_notice}</p>
              </div>
            )}
            {product.blocked_regions.length > 0 && (
              <div className="flex gap-3 rounded border border-warning/40 bg-warning/10 p-3.5 text-xs text-warning">
                <MapPinOff aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
                <p><span className="font-semibold">Restricción territorial.</span> No puede ofrecerse en: {product.blocked_regions.join(', ')}.</p>
              </div>
            )}
            <p className="regulatory text-center py-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Aviso: Fumar perjudica gravemente su salud y la de los que están a su alrededor.
            </p>
          </Reveal>
        </div>
      </div>

      <ProductDetails product={product} />
    </article>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]" aria-busy="true" aria-label="Cargando producto">
      <Skeleton className="aspect-[4/3] rounded" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4 rounded" />
        <Skeleton className="h-12 w-3/4 rounded" />
        <Skeleton className="h-10 w-1/3 rounded" />
        <Skeleton className="h-40 rounded" />
      </div>
    </div>
  )
}
