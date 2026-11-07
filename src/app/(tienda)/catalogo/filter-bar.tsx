import Link from 'next/link'
import Form from 'next/form'
import { Search, X } from 'lucide-react'
import type { Category } from '@/shared/types/domain'
import type { CatalogParams } from './_lib/filter'

const STOCK_OPTIONS = [
  { value: '', label: 'Todo' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'consultar', label: 'A consultar' },
  { value: 'agotado', label: 'Sin disponibilidad' },
] as const

// Construye la URL del catálogo conservando los filtros que no cambian
function catalogHref(params: CatalogParams, overrides: Partial<CatalogParams>): string {
  const merged = { ...params, ...overrides }
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(merged)) if (value) query.set(key, value)
  const qs = query.toString()
  return qs ? `/catalogo?${qs}` : '/catalogo'
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href} scroll={false} aria-current={active ? 'true' : undefined}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
        active ? 'border-primary/60 bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_hsl(40_60%_60%/0.6)]' : 'border-border bg-surface/50 text-muted-foreground hover:border-border-strong hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  )
}

// Barra de filtros fija con vidrio: búsqueda por formulario GET y filtros como enlaces
export function FilterBar({ params, categories }: { params: CatalogParams; categories: Category[] }) {
  return (
    <div className="z-30 -mx-5 border-y md:sticky md:top-20 border-border bg-background/80 px-5 py-4 backdrop-blur-2xl md:top-20 md:-mx-8 md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <Form action="/catalogo" role="search" className="group relative w-full md:max-w-sm">
          <label htmlFor="q" className="sr-only">Buscar en la colección</label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            id="q" name="q" type="search" defaultValue={params.q} placeholder="Buscar por nombre o presentación"
            className="w-full rounded-full border border-border bg-surface/70 py-3 pl-11 pr-4 text-sm transition-all duration-300 placeholder:text-muted-foreground/70 hover:border-border-strong focus:border-primary/60 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
          {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
          {params.disponibilidad && <input type="hidden" name="disponibilidad" value={params.disponibilidad} />}
        </Form>

        <nav aria-label="Disponibilidad" className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] md:flex-wrap md:justify-end md:overflow-visible">
          {STOCK_OPTIONS.map((option) => (
            <Pill key={option.value} href={catalogHref(params, { disponibilidad: option.value })} active={params.disponibilidad === option.value}>{option.label}</Pill>
          ))}
        </nav>
      </div>
      <nav aria-label="Categorías" className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible">
        <span className="hidden shrink-0 self-center pr-2 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground md:inline">Categoría</span>
        <Pill href={catalogHref(params, { categoria: '' })} active={!params.categoria}>Todas</Pill>
        {categories.map((c) => (
          <Pill key={c.id} href={catalogHref(params, { categoria: c.slug })} active={params.categoria === c.slug}>{c.name}</Pill>
        ))}
      </nav>
      {params.q && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          Resultados para <span className="font-semibold text-foreground">“{params.q}”</span>
          <Link href={catalogHref(params, { q: '' })} scroll={false} aria-label="Quitar búsqueda" className="grid size-5 place-items-center rounded-full bg-muted hover:bg-elevated"><X className="size-3" /></Link>
        </p>
      )}
    </div>
  )
}
