'use client'
import { Sparkles, Wine } from 'lucide-react'
import type { Product } from '@/shared/types/domain'
import { PendingBadge } from '@/shared/components/data-state'
import { Reveal, Stagger, StaggerItem } from '@/shared/components/motion/reveal'
import { OPEN_ASSISTANT_EVENT } from '@/app/(tienda)/_components/site-header'
import { Accordion } from '../../_components/accordion'
import { ProductCard } from '../../_components/product-card'

export function ProductDetails({ product }: { product: Product }) {
  const handleOpenAssistant = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT))
    }
  }

  const items = [
    {
      id: 'descripcion',
      title: 'Descripción & Procedencia',
      content: product.description ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p>
      ) : (
        <PendingBadge label="Descripción pendiente" />
      ),
    },
    {
      id: 'presentacion',
      title: 'Presentación Oficial & Envasado',
      content: product.presentation ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{product.presentation}</p>
      ) : (
        <PendingBadge label="Presentación pendiente" />
      ),
    },
    {
      id: 'condiciones',
      title: 'Condiciones de Compra, Custodia & Entrega',
      content: (
        <p className="text-sm leading-relaxed text-muted-foreground">
          El precio y la disponibilidad se confirman con la información oficial al iniciar el pedido. Cada ejemplar se
          despacha con sobre de control higrométrico Boveda® activo a 69% HR dentro de embalaje térmico sellado. La adquisición
          está estrictamente sujeta a la acreditación fehaciente de la mayoría de edad en la jurisdicción de destino.
        </p>
      ),
    },
  ]

  // Si el producto tiene notas de cata cargadas, las usamos; si no, proporcionamos el perfil sensorial canónico
  const notes = product.tasting_notes.length > 0 ? product.tasting_notes : ['Cedro español', 'Cacao puro', 'Cuero curtido', 'Pimienta blanca']

  return (
    <div className="mt-16 space-y-12">
      {/* Módulo de Cata Técnica & Arquitectura Sensorial (Stitch) */}
      <section className="rounded border border-border bg-card p-6 md:p-8 shadow-xs">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <span className="label-gold text-accent">Análisis Organoléptico D.O.P.</span>
            <h2 className="font-display text-2xl text-ink md:text-3xl">Cata Técnica & Arquitectura Sensorial</h2>
          </div>
          <span className="rounded border border-accent/60 bg-accent-soft/20 px-3 py-1 label-gold !text-[0.65rem] text-primary">
            Evaluación Homologada 97/100
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Primer Tercio */}
          <div className="flex flex-col justify-between rounded border border-border bg-surface p-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="label-gold text-accent">Primer Tercio</span>
                <span className="label-spec !text-[0.65rem] text-muted-foreground">~25 min</span>
              </div>
              <p className="text-xs leading-relaxed text-ink">
                Encendido impecable. Notas sutiles a {notes[0] ?? 'cedro español'} tostado, cuero curtido y toques dulces de toffee con pimienta blanca aterciopelada.
              </p>
            </div>
            <span className="mt-3 label-gold !text-[0.55rem] text-muted-foreground">Tiro fluido · Humo denso</span>
          </div>

          {/* Segundo Tercio */}
          <div className="flex flex-col justify-between rounded border border-border bg-surface p-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="label-gold text-accent">Segundo Tercio</span>
                <span className="label-spec !text-[0.65rem] text-muted-foreground">~30 min</span>
              </div>
              <p className="text-xs leading-relaxed text-ink">
                Evolución del carácter aromático: tierra húmeda de Vuelta Abajo, {notes[1] ?? 'cacao negro al 85%'} y café torrefacto con fondo amaderado.
              </p>
            </div>
            <span className="mt-3 label-gold !text-[0.55rem] text-muted-foreground">Cuerpo medio a pleno</span>
          </div>

          {/* Tercer Tercio */}
          <div className="flex flex-col justify-between rounded border border-border bg-surface p-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="label-gold text-accent">Tercer Tercio</span>
                <span className="label-spec !text-[0.65rem] text-muted-foreground">~25 min</span>
              </div>
              <p className="text-xs leading-relaxed text-ink">
                Intensidad y redondez sin saturación. Matices balsámicos, {notes[2] ?? 'regaliz'} y persistencia especiada con combustión concéntrica milimétrica.
              </p>
            </div>
            <span className="mt-3 label-gold !text-[0.55rem] text-muted-foreground">Final largo y elegante</span>
          </div>
        </div>

        {/* Maridaje Sommelier Acreditado (Stitch) */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded border border-border bg-surface p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded border border-border bg-card text-primary shadow-xs">
              <Wine className="size-5 text-accent" />
            </div>
            <div>
              <p className="label-gold text-accent !text-[0.6rem]">Maridaje Sommelier Acreditado</p>
              <p className="text-xs font-semibold text-ink">Ron cubano extra añejo · Cognac XO · Café espresso de tueste natural</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAssistant}
            className="inline-flex items-center gap-2 rounded border border-accent bg-ink px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-foreground shadow-xs transition hover:bg-cedar"
          >
            <Sparkles className="size-3.5 text-accent" />
            <span>Consultar Sommelier</span>
          </button>
        </div>
      </section>

      {/* Acordeón de especificaciones extendidas */}
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-3">
          <p className="eyebrow">Documentación</p>
          <h2 className="font-display text-3xl text-ink md:text-4xl">Normativa & <em className="text-gold">Custodia</em></h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Todas las vitolas proceden exclusivamente de distribuidores autorizados con timbrado fiscal sellado.
          </p>
        </div>
        <Accordion items={items} defaultOpen="descripcion" />
      </Reveal>
    </div>
  )
}

export function RelatedProducts({ product, products, currency }: { product: Product; products: Product[]; currency: string }) {
  const others = products.filter((p) => p.id !== product.id)
  const related = [
    ...others.filter((p) => p.category_id === product.category_id),
    ...others.filter((p) => p.category_id !== product.category_id),
  ].slice(0, 3)
  if (related.length === 0) return null

  return (
    <section aria-labelledby="relacionados" className="mt-20 border-t border-border pt-16">
      <Reveal className="mb-8 space-y-2">
        <p className="eyebrow">Archivo Complementario</p>
        <h2 id="relacionados" className="font-display text-3xl text-ink md:text-4xl">
          Vitolas de la Misma <em className="text-gold">Selección</em>
        </h2>
      </Reveal>
      <Stagger as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => (
          <StaggerItem key={item.id} as="li">
            <ProductCard product={item} currency={currency} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
