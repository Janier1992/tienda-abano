import Link from 'next/link'
import type { Product } from '@/shared/types/domain'
import { formatMoney } from '@/shared/lib/money'
import { SpecRows, TastingNotes } from '@/features/catalogo/components/vitola-specs'
import { ProductImage } from './product-image'
import { StockPill } from './stock-pill'

// Tarjeta de vitola (Stitch): blanca con filete de piedra que pasa a oro al pasar el cursor
export function ProductCard({ product, currency, priority = false }: { product: Product; currency: string; priority?: boolean }) {
  return (
    <Link href={`/producto/${product.slug}`} className="card-hover group flex h-full flex-col rounded border border-border bg-card p-4">
      <div className="relative">
        <ProductImage image={product.product_images[0]} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw" priority={priority} />
        <StockPill status={product.stock_status} className="absolute left-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col gap-3 pt-4">
        <div className="space-y-1">
          {product.brand && <p className="label-gold">{product.brand}</p>}
          <h3 className="text-xl leading-tight group-hover:text-primary">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.vitola_galera ? `Vitola de galera: ${product.vitola_galera}` : product.presentation}</p>
        </div>
        <TastingNotes notes={product.tasting_notes.slice(0, 3)} />
        <SpecRows product={product} />
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground">{product.presentation ?? 'Precio'}</p>
            <p className="font-display text-xl tabular-nums">
              {product.price_cents !== null ? formatMoney(product.price_cents, currency) : <span className="text-base text-muted-foreground">A consultar</span>}
            </p>
          </div>
          <span className="rounded border border-accent bg-ink px-3 py-2 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ink-foreground transition-colors group-hover:bg-cedar">
            Ficha técnica
          </span>
        </div>
      </div>
    </Link>
  )
}
