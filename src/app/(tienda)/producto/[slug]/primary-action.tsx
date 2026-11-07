import { MessageCircle } from 'lucide-react'
import { AddToCart } from '@/features/carrito/add-to-cart'
import { SupportForm } from '@/features/atencion/support-form'
import type { BrandSettings, Product } from '@/shared/types/domain'

// La acción principal depende de la disponibilidad real y de que la venta esté habilitada
export function PrimaryAction({ product, settings }: { product: Product; settings: BrandSettings | null }) {
  const sellable = product.stock_status === 'disponible' && product.price_cents !== null
  if (sellable && settings?.sales_enabled) {
    return (
      <AddToCart
        productId={product.id} slug={product.slug} name={product.name}
        unitPriceCents={product.price_cents as number} imageUrl={product.product_images[0]?.url}
      />
    )
  }

  const salesClosed = sellable && !settings?.sales_enabled
  return (
    <div className="space-y-3">
      {salesClosed && (
        <p className="rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
          <span className="block font-semibold text-foreground">Compra online aún no habilitada</span>
          Deja tu solicitud y un asesor te informará sobre cómo adquirirlo.
        </p>
      )}
      <details className="group rounded-2xl border border-border-strong bg-background/40 open:bg-background/60">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-4 font-semibold transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
          <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary"><MessageCircle aria-hidden className="size-4" /></span>
          {salesClosed ? 'Solicitar información de compra' : 'Consultar disponibilidad'}
          <span aria-hidden className="ml-auto text-xl text-muted-foreground transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="border-t border-border p-5">
          <SupportForm
            context={{ origin: 'producto', productSlug: product.slug }}
            defaultType={salesClosed ? 'intencion_compra' : 'consulta'}
            allowTypeChoice={false}
            defaultMessage={`Me interesa: ${product.name}.`}
          />
        </div>
      </details>
    </div>
  )
}
