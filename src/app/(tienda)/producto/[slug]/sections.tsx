import type { Product } from '@/shared/types/domain'
import { PendingBadge } from '@/shared/components/data-state'
import { Reveal, Stagger, StaggerItem } from '@/shared/components/motion/reveal'
import { Accordion } from '../../_components/accordion'
import { ProductCard } from '../../_components/product-card'

// Detalle ampliado en acordeón; lo no verificado se muestra como pendiente
export function ProductDetails({ product }: { product: Product }) {
  const items = [
    {
      id: 'descripcion',
      title: 'Descripción',
      content: product.description ? <p className="whitespace-pre-line">{product.description}</p> : <PendingBadge label="Descripción pendiente" />,
    },
    {
      id: 'presentacion',
      title: 'Presentación',
      content: product.presentation ? <p>{product.presentation}</p> : <PendingBadge label="Presentación pendiente" />,
    },
    {
      id: 'condiciones',
      title: 'Condiciones de compra y entrega',
      content: (
        <p>
          El precio y la disponibilidad se confirman con la información oficial al iniciar el pedido. El envío y los impuestos se calculan según la
          zona de entrega. La compra requiere ser mayor de edad y superar la verificación de edad correspondiente.
        </p>
      ),
    },
  ]
  return (
    <Reveal className="mt-24 grid gap-10 lg:grid-cols-[1fr_2fr]">
      <div className="space-y-4">
        <p className="eyebrow">Ficha</p>
        <h2 className="text-5xl">Todo lo que <em className="text-gold">debes saber</em></h2>
      </div>
      <Accordion items={items} defaultOpen="descripcion" />
    </Reveal>
  )
}

// Hasta tres productos de la misma categoría (o del catálogo si no hay suficientes)
export function RelatedProducts({ product, products, currency }: { product: Product; products: Product[]; currency: string }) {
  const others = products.filter((p) => p.id !== product.id)
  const related = [...others.filter((p) => p.category_id === product.category_id), ...others.filter((p) => p.category_id !== product.category_id)].slice(0, 3)
  if (related.length === 0) return null
  return (
    <section aria-labelledby="relacionados" className="mt-28">
      <Reveal className="mb-10 space-y-4">
        <p className="eyebrow">Continúa explorando</p>
        <h2 id="relacionados" className="text-5xl">También te puede <em className="text-gold">interesar</em></h2>
      </Reveal>
      <Stagger as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => <StaggerItem key={item.id} as="li"><ProductCard product={item} currency={currency} /></StaggerItem>)}
      </Stagger>
    </section>
  )
}
