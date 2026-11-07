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
    <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div className="space-y-4">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="max-w-2xl text-5xl md:text-6xl">{title}</h2>
      </div>
      {action}
    </Reveal>
  )
}

// Rejilla tipo "bento": cada categoría usa la imagen de uno de sus productos
export function CategoryBento({ categories, products }: { categories: Category[]; products: Product[] }) {
  if (categories.length === 0) return null
  const cover = (id: string) => products.find((p) => p.category_id === id)?.product_images[0]
  const spans = ['md:col-span-2 md:row-span-2', 'md:col-span-2', '', '']
  return (
    <Container className="py-28">
      <SectionTitle eyebrow="Explorar" title={<>Una colección <em className="text-gold">pensada</em> pieza a pieza</>} />
      <Stagger className="grid auto-rows-[16rem] gap-4 md:grid-cols-4 md:auto-rows-[15rem]">
        {categories.slice(0, 4).map((category, i) => {
          const image = cover(category.id)
          return (
            <StaggerItem key={category.id} className={spans[i]}>
              <Link href={`/catalogo?categoria=${category.slug}`} className="group relative block h-full overflow-hidden rounded-3xl border border-border bg-card">
                {image && <Image src={image.url} alt="" fill unoptimized sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-80 transition-all duration-[1.2s] group-hover:scale-105 group-hover:opacity-100" />}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <p className="text-xs text-muted-foreground">0{i + 1}</p>
                    <h3 className="text-3xl md:text-4xl">{category.name}</h3>
                  </div>
                  <span className="grid size-11 place-items-center rounded-full border border-border-strong bg-background/40 backdrop-blur transition-all duration-500 group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
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
    <Container className="py-28">
      <SectionTitle
        eyebrow="Selección destacada"
        title={<>Elegidos por nuestros <em className="text-gold">especialistas</em></>}
        action={<ButtonLink href="/catalogo" variant="outline">Ver toda la colección <ArrowUpRight className="size-4" /></ButtonLink>}
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
  { n: '01', title: 'Selección', text: 'Cada referencia del catálogo se revisa antes de publicarse: ficha verificada, presentación y condiciones claras.' },
  { n: '02', title: 'Asesoría', text: 'Un asistente disponible a cualquier hora y un equipo humano para lo que necesite una conversación de verdad.' },
  { n: '03', title: 'Transparencia', text: 'Precio, disponibilidad, envío y restricciones visibles antes de confirmar. Sin urgencias artificiales.' },
]

export function Experience() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface/40 py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 hairline" />
      <Container>
        <SectionTitle eyebrow="La experiencia" title={<>Te acompañamos <em className="text-gold">antes, durante y después</em></>} />
        <Stagger className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <StaggerItem key={pillar.n} className="group space-y-6 bg-background p-10 transition-colors duration-500 hover:bg-card">
              <span className="font-display text-7xl text-gold">{pillar.n}</span>
              <h3 className="text-4xl">{pillar.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{pillar.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}

export function AdvisorPanel({ supportHours }: { supportHours: string | null }) {
  return (
    <Container className="py-28">
      <Reveal>
        <div className="ring-gold relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-elevated via-card to-surface p-10 md:p-16">
          <div aria-hidden className="animate-aurora absolute -right-20 -top-20 size-96 rounded-full bg-primary/20 blur-[100px]" />
          <div className="relative grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="space-y-6">
              <p className="eyebrow">Atención</p>
              <h2 className="text-5xl md:text-6xl">¿Dudas? <em className="text-gold">Pregúntanos.</em></h2>
              <p className="max-w-lg leading-relaxed text-muted-foreground">
                Nuestro asistente responde al momento con información oficial. Si prefieres hablar con una persona, te derivamos con todo el contexto para que no repitas nada.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/contacto" size="lg">Hablar con un asesor</ButtonLink>
                <ButtonLink href="/preguntas-frecuentes" size="lg" variant="secondary">Preguntas frecuentes</ButtonLink>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { icon: Bot, title: 'Asistente al instante', text: 'Botón inferior derecho, en cualquier página.' },
                { icon: MessagesSquare, title: 'Equipo humano', text: supportHours ?? 'Horario pendiente de configuración.' },
                { icon: ShieldCheck, title: 'Sin presión', text: 'Información clara y sin tácticas de urgencia.' },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="glass flex items-center gap-4 rounded-2xl p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Icon className="size-5" /></span>
                  <span><span className="block font-semibold">{title}</span><span className="text-sm text-muted-foreground">{text}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </Container>
  )
}
