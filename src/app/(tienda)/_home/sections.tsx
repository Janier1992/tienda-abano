import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Bot, MessagesSquare, ShieldCheck } from 'lucide-react'
import type { Category, Product } from '@/shared/types/domain'
import { Container } from '@/shared/components/layout'
import { Reveal, Stagger, StaggerItem } from '@/shared/components/motion/reveal'
import { ButtonLink } from '@/shared/components/ui/button'
import { ProductCard } from '../_components/product-card'

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="space-y-3">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="max-w-2xl text-4xl sm:text-5xl md:text-6xl">{title}</h2>
      </div>
      {action}
    </Reveal>
  )
}

// Rejilla tipo "bento": cada categoría usa la imagen de uno de sus productos con geometría Stitch
export function CategoryBento({ categories, products }: { categories: Category[]; products: Product[] }) {
  if (categories.length === 0) return null
  const cover = (id: string) => products.find((p) => p.category_id === id)?.product_images[0]
  const spans = ['md:col-span-2 md:row-span-2', 'md:col-span-2', '', '']
  return (
    <Container className="py-20 md:py-28">
      <SectionTitle eyebrow="Explorar" title={<>Una colección <em className="text-gold">pensada</em> pieza a pieza</>} />
      <Stagger className="grid auto-rows-[16rem] gap-4 md:grid-cols-4 md:auto-rows-[15rem]">
        {categories.slice(0, 4).map((category, i) => {
          const image = cover(category.id)
          return (
            <StaggerItem key={category.id} className={spans[i]}>
              <Link href={`/catalogo?categoria=${category.slug}`} className="group relative block h-full overflow-hidden rounded border border-border bg-card transition hover:border-accent">
                {image && <Image src={image.url} alt="" fill unoptimized sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-85 transition-all duration-[1.2s] group-hover:scale-105 group-hover:opacity-100" />}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <p className="label-gold !text-[0.6rem] text-accent">Línea 0{i + 1}</p>
                    <h3 className="font-display text-2xl text-ink-foreground md:text-3xl">{category.name}</h3>
                  </div>
                  <span className="grid size-10 place-items-center rounded border border-accent/60 bg-ink/70 text-ink-foreground backdrop-blur-sm transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          )
        })}
      </Stagger>
    </Container>
  )
}

export function FeaturedProducts({ products, currency }: { products: Product[]; currency: string }) {
  if (products.length === 0) return null
  return (
    <Container className="py-20 md:py-28">
      <SectionTitle
        eyebrow="Selección destacada"
        title={<>Elegidos por nuestros <em className="text-gold">especialistas</em></>}
        action={<ButtonLink href="/catalogo" variant="outline">Ver toda la colección <ArrowUpRight className="size-4 text-accent" /></ButtonLink>}
      />
      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 3).map((product) => (
          <StaggerItem key={product.id}><ProductCard product={product} currency={currency} /></StaggerItem>
        ))}
      </Stagger>
    </Container>
  )
}

const PILLARS = [
  { n: '01', title: 'Selección Rigurosa', text: 'Cada referencia del catálogo se audita antes de publicarse: procedencia verificada, presentación oficial y condiciones estables de conservación.' },
  { n: '02', title: 'Asesoría Certificada', text: 'Un sommelier virtual disponible en todo momento y un equipo humano acreditado para consultas complejas o encargos especiales.' },
  { n: '03', title: 'Custodia & Trazabilidad', text: 'Temperatura constante a 18°C e higrometría regulada. Precintos fiscales sellados y transparencia antes de confirmar la compra.' },
]

export function Experience() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface/50 py-20 md:py-28">
      <Container>
        <SectionTitle eyebrow="La experiencia" title={<>Custodia y distinción <em className="text-gold">de origen a destino</em></>} />
        <Stagger className="grid gap-px overflow-hidden rounded border border-border bg-border md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <StaggerItem key={pillar.n} className="group space-y-5 bg-card p-8 md:p-10 transition-colors duration-300 hover:bg-surface-container-low">
              <span className="font-display text-5xl text-accent">{pillar.n}</span>
              <h3 className="text-2xl text-ink md:text-3xl">{pillar.title}</h3>
              <p className="leading-relaxed text-sm text-muted-foreground">{pillar.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}

export function AdvisorPanel({ supportHours }: { supportHours: string | null }) {
  return (
    <Container className="py-20 md:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded border border-border bg-card p-8 md:p-14 shadow-sm">
          <div aria-hidden className="absolute -right-20 -top-20 size-80 rounded-full bg-accent/10 blur-[100px]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="space-y-5">
              <p className="eyebrow">Atención & Sommelier</p>
              <h2 className="text-4xl text-ink sm:text-5xl md:text-6xl">¿Dudas sobre su elección? <em className="text-gold">Consúltenos.</em></h2>
              <p className="max-w-lg leading-relaxed text-sm text-muted-foreground md:text-base">
                Nuestro asistente sommelier responde al momento con datos de catálogo y cata oficial. Si requiere atención humana, transferimos el contexto completo de inmediato.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink href="/contacto" size="lg">Hablar con un asesor</ButtonLink>
                <ButtonLink href="/preguntas-frecuentes" size="lg" variant="secondary">Preguntas frecuentes</ButtonLink>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { icon: Bot, title: 'Sommelier virtual al instante', text: 'Consultas de vitola, maridaje y tiro en cualquier página.' },
                { icon: MessagesSquare, title: 'Equipo humano acreditado', text: supportHours ?? 'Lunes a viernes 9:00 - 19:00 CET.' },
                { icon: ShieldCheck, title: 'Sin urgencias artificiales', text: 'Información veraz conforme a normativa D.O.P. y legislación local.' },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-4 rounded border border-border bg-surface/70 p-4 shadow-2xs">
                  <span className="grid size-10 shrink-0 place-items-center rounded border border-border bg-card text-primary shadow-xs"><Icon className="size-4 text-accent" /></span>
                  <div>
                    <span className="block text-sm font-semibold text-ink">{title}</span>
                    <span className="text-xs text-muted-foreground">{text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </Container>
  )
}
