import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MapPinOff, ShieldAlert } from 'lucide-react'
import { getActiveProducts, getCategories, getProductBySlug } from '@/features/catalogo/data'
import { getBrandSettings } from '@/features/contenido/data'
import { getMissingFields } from '@/features/catalogo/domain/completeness'
import { formatMoney } from '@/shared/lib/money'
import { DataState, PendingBadge, Skeleton } from '@/shared/components/data-state'
import { Container } from '@/shared/components/layout'
import { Reveal } from '@/shared/components/motion/reveal'
import type { BrandSettings, Category, Product } from '@/shared/types/domain'
import { StockPill } from '../../_components/stock-pill'
import { TrackEvent } from '../../_components/track-event'
import { Gallery } from './gallery'
import { PrimaryAction } from './primary-action'
import { ProductDetails, RelatedProducts } from './sections'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductBySlug(slug)
  return { title: result.status === 'ok' && result.data ? result.data.name : 'Producto' }
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Container className="py-8 md:py-12">
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
      <nav aria-label="Ruta" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/catalogo" className="transition-colors hover:text-foreground">Colección</Link>
        {category && <><ChevronRight aria-hidden className="size-3" /><Link href={`/catalogo?categoria=${category.slug}`} className="transition-colors hover:text-foreground">{category.name}</Link></>}
        <ChevronRight aria-hidden className="size-3" /><span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Gallery product={product} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal className="glass ring-gold space-y-7 rounded-[2rem] p-7 md:p-9">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow">{category?.name ?? 'Colección'}</p>
                <StockPill status={product.stock_status} />
              </div>
              <h1 className="text-5xl md:text-6xl">{product.name}</h1>
              {product.presentation && <p className="text-sm text-muted-foreground">{product.presentation}</p>}
            </div>

            <div className="hairline" />

            <div className="flex items-end justify-between gap-4">
              {product.price_cents !== null
                ? <p className="font-display text-5xl tabular-nums">{formatMoney(product.price_cents, currency)}</p>
                : <PendingBadge label="Precio pendiente de confirmar" />}
              <p className="text-right text-xs text-muted-foreground">Envío e impuestos<br />se calculan al finalizar</p>
            </div>

            {missing.length > 0 && (
              <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <PendingBadge label="Información pendiente" /> {missing.join(', ')}
              </p>
            )}

            <PrimaryAction product={product} settings={settings} />

            {product.compliance_notice && (
              <div className="flex gap-3 rounded-2xl border border-border-strong bg-background/40 p-4 text-xs leading-relaxed text-muted-foreground">
                <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>{product.compliance_notice}</p>
              </div>
            )}
            {product.blocked_regions.length > 0 && (
              <div className="flex gap-3 rounded-2xl border border-border bg-background/40 p-4 text-xs text-muted-foreground">
                <MapPinOff aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
                <p><span className="font-semibold text-foreground">Restricción territorial.</span> No puede ofrecerse en: {product.blocked_regions.join(', ')}.</p>
              </div>
            )}
            <p className="text-center text-xs font-semibold tracking-wide text-foreground/90">Fumar perjudica gravemente su salud.</p>
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
      <Skeleton className="aspect-[4/5] rounded-[2rem]" />
      <div className="space-y-5"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-16 w-3/4" /><Skeleton className="h-12 w-1/3" /><Skeleton className="h-48 rounded-[2rem]" /></div>
    </div>
  )
}
