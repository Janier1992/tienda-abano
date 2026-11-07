import type { Product } from '@/shared/types/domain'

const STRENGTH_LABELS = ['Suave', 'Suave a media', 'Media', 'Media a fuerte', 'Fuerte'] as const

export function strengthLabel(strength: number): string {
  return STRENGTH_LABELS[Math.min(5, Math.max(1, strength)) - 1]
}

// Cepo en 64avos de pulgada → milímetros, como en las fichas oficiales
export function ringGaugeMm(ringGauge: number): string {
  return ((ringGauge / 64) * 25.4).toFixed(1).replace('.', ',')
}

// Fortaleza 1–5 con sellos dorados
export function StrengthPips({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Fortaleza ${value} de 5: ${strengthLabel(value)}`}>
      <span aria-hidden className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`size-2.5 rounded-full border ${i <= value ? 'border-accent bg-accent' : 'border-border-strong bg-transparent'}`} />
        ))}
      </span>
      {showLabel && <span className="text-xs text-muted-foreground">{strengthLabel(value)}</span>}
    </span>
  )
}

type SpecProduct = Pick<Product, 'vitola_galera' | 'ring_gauge' | 'length_mm' | 'strength'>

// Filas compactas para tarjetas de catálogo; solo muestra los datos que existen
export function SpecRows({ product }: { product: SpecProduct }) {
  const rows = [
    product.ring_gauge && product.length_mm && { label: 'Cepo & largo', value: `${product.ring_gauge} · ${product.length_mm} mm` },
    product.strength && { label: 'Fortaleza', value: <StrengthPips value={product.strength} showLabel={false} /> },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[]
  if (rows.length === 0) return null
  return (
    <dl className="space-y-1.5 border-t border-border pt-3 text-xs">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="label-spec">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Losetas de "especificaciones canónicas" para la ficha de producto
export function SpecTiles({ product }: { product: SpecProduct }) {
  const tiles = [
    product.vitola_galera && { label: 'Vitola de galera', value: product.vitola_galera },
    product.ring_gauge && { label: 'Cepo (diámetro)', value: `${product.ring_gauge} (${ringGaugeMm(product.ring_gauge)} mm)` },
    product.length_mm && { label: 'Longitud', value: `${product.length_mm} mm` },
    product.strength && { label: 'Fortaleza', value: <StrengthPips value={product.strength} /> },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[]
  if (tiles.length === 0) return null
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border">
      {tiles.map((tile) => (
        <div key={tile.label} className="space-y-1.5 bg-card p-4">
          <dt className="label-gold">{tile.label}</dt>
          <dd className="label-spec text-sm">{tile.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function TastingNotes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Notas dominantes">
      {notes.map((note) => (
        <li key={note} className="rounded-sm border border-border bg-surface px-2 py-1 text-[0.7rem] text-muted-foreground">{note}</li>
      ))}
    </ul>
  )
}
