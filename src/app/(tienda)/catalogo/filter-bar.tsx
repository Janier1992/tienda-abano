'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Form from 'next/form'
import { Search, Thermometer, X } from 'lucide-react'
import type { Category } from '@/shared/types/domain'
import type { CatalogParams } from './_lib/filter'

const MARCAS = [
  { value: '', label: 'Todas las Casas (D.O.P.)' },
  { value: 'Cohiba', label: 'Cohiba (El Laguito)' },
  { value: 'Montecristo', label: 'Montecristo' },
  { value: 'Partagás', label: 'Partagás' },
  { value: 'Trinidad', label: 'Trinidad' },
  { value: 'Romeo y Julieta', label: 'Romeo y Julieta' },
  { value: 'Hoyo de Monterrey', label: 'Hoyo de Monterrey' },
  { value: 'H. Upmann', label: 'H. Upmann' },
] as const

const FORTALEZAS = [
  { value: '', label: 'Toda Fortaleza (1 - 5)' },
  { value: '1', label: 'Suave (1/5)' },
  { value: '2', label: 'Medio-Suave (2/5)' },
  { value: '3', label: 'Medio (3/5)' },
  { value: '4', label: 'Medio a Fuerte (4/5)' },
  { value: '5', label: 'Fuerte Intenso (5/5)' },
] as const

const CEPOS = [
  { value: '', label: 'Todos los Calibres' },
  { value: 'fino', label: 'Cepo Delgado (38 - 42)' },
  { value: 'medio', label: 'Cepo Clásico (43 - 48)' },
  { value: 'robusto', label: 'Cepo Robusto (50 - 52)' },
  { value: 'grueso', label: 'Cepo Sublime (54+)' },
] as const

const DISPONIBILIDADES = [
  { value: '', label: 'Cualquier Estado' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'consultar', label: 'A consultar' },
  { value: 'agotado', label: 'Sin disponibilidad' },
] as const

function catalogHref(params: CatalogParams, overrides: Partial<CatalogParams>): string {
  const merged = { ...params, ...overrides }
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(merged)) {
    if (value) query.set(key, value)
  }
  const qs = query.toString()
  return qs ? `/catalogo?${qs}` : '/catalogo'
}

export function FilterBar({ params, categories }: { params: CatalogParams; categories: Category[] }) {
  const router = useRouter()

  const handleSelectChange = (key: keyof CatalogParams, value: string) => {
    const url = catalogHref(params, { [key]: value })
    router.push(url, { scroll: false })
  }

  const hasFilters = Boolean(params.q || params.categoria || params.disponibilidad || params.marca || params.fortaleza || params.cepo)

  return (
    <div className="z-30 space-y-4 border-b border-border bg-card/95 py-5 backdrop-blur-md">
      {/* Barra de Bóveda y Búsqueda */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Form action="/catalogo" role="search" className="relative w-full max-w-md">
          <label htmlFor="q" className="sr-only">Buscar en el archivo D.O.P.</label>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q}
            placeholder="Buscar por vitola, marca, cepo o cata..."
            className="w-full rounded border border-border bg-surface py-2.5 pl-10 pr-4 text-xs text-ink transition hover:border-accent focus:border-accent focus:bg-card focus:outline-none"
          />
          {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
          {params.disponibilidad && <input type="hidden" name="disponibilidad" value={params.disponibilidad} />}
          {params.marca && <input type="hidden" name="marca" value={params.marca} />}
          {params.fortaleza && <input type="hidden" name="fortaleza" value={params.fortaleza} />}
          {params.cepo && <input type="hidden" name="cepo" value={params.cepo} />}
        </Form>

        {/* Indicador de Bóveda en Vivo (Stitch) */}
        <div className="flex items-center gap-3 self-start rounded border border-border bg-surface px-3.5 py-2 shadow-2xs lg:self-auto">
          <div className="flex flex-col">
            <span className="label-gold !text-[0.55rem] text-accent">Bóveda Principal</span>
            <span className="label-spec text-xs text-ink">69.2% HR · 17.8°C</span>
          </div>
          <div className="grid size-7 place-items-center rounded-full bg-accent-soft/30 text-primary">
            <Thermometer className="size-3.5 text-accent" />
          </div>
        </div>
      </div>

      {/* Rejilla de Selectores Arquitectónicos (Stitch) */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca & Fábrica */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-marca" className="label-gold !text-[0.6rem] text-muted-foreground">Marca & Fábrica</label>
          <select
            id="filter-marca"
            value={params.marca ?? ''}
            onChange={(e) => handleSelectChange('marca', e.target.value)}
            className="w-full cursor-pointer rounded border border-border bg-surface px-3 py-2 text-xs text-ink transition hover:border-accent focus:border-accent focus:outline-none"
          >
            {MARCAS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Fortaleza */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-fortaleza" className="label-gold !text-[0.6rem] text-muted-foreground">Fortaleza (1 - 5)</label>
          <select
            id="filter-fortaleza"
            value={params.fortaleza ?? ''}
            onChange={(e) => handleSelectChange('fortaleza', e.target.value)}
            className="w-full cursor-pointer rounded border border-border bg-surface px-3 py-2 text-xs text-ink transition hover:border-accent focus:border-accent focus:outline-none"
          >
            {FORTALEZAS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Cepo */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-cepo" className="label-gold !text-[0.6rem] text-muted-foreground">Calibre / Cepo</label>
          <select
            id="filter-cepo"
            value={params.cepo ?? ''}
            onChange={(e) => handleSelectChange('cepo', e.target.value)}
            className="w-full cursor-pointer rounded border border-border bg-surface px-3 py-2 text-xs text-ink transition hover:border-accent focus:border-accent focus:outline-none"
          >
            {CEPOS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Disponibilidad */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-stock" className="label-gold !text-[0.6rem] text-muted-foreground">Disponibilidad</label>
          <select
            id="filter-stock"
            value={params.disponibilidad ?? ''}
            onChange={(e) => handleSelectChange('disponibilidad', e.target.value)}
            className="w-full cursor-pointer rounded border border-border bg-surface px-3 py-2 text-xs text-ink transition hover:border-accent focus:border-accent focus:outline-none"
          >
            {DISPONIBILIDADES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pestañas de Categoría */}
      <nav aria-label="Categorías" className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pt-1 [scrollbar-width:none]">
        <span className="hidden shrink-0 pr-2 label-gold !text-[0.6rem] text-muted-foreground sm:inline">Línea:</span>
        <Link
          href={catalogHref(params, { categoria: '' })}
          scroll={false}
          className={`shrink-0 rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
            !params.categoria
              ? 'border-accent bg-ink text-ink-foreground'
              : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-ink'
          }`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={catalogHref(params, { categoria: c.slug })}
            scroll={false}
            className={`shrink-0 rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              params.categoria === c.slug
                ? 'border-accent bg-ink text-ink-foreground'
                : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-ink'
            }`}
          >
            {c.name}
          </Link>
        ))}

        {hasFilters && (
          <Link
            href="/catalogo"
            scroll={false}
            className="ml-auto inline-flex items-center gap-1 rounded border border-danger/40 bg-danger/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-danger transition hover:bg-danger/20"
          >
            <X className="size-3" />
            Limpiar filtros
          </Link>
        )}
      </nav>

      {params.q && (
        <p className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          Resultados para <span className="font-semibold text-ink">“{params.q}”</span>
          <Link href={catalogHref(params, { q: '' })} scroll={false} aria-label="Quitar búsqueda" className="grid size-4 place-items-center rounded bg-muted hover:bg-elevated">
            <X className="size-3" />
          </Link>
        </p>
      )}
    </div>
  )
}
