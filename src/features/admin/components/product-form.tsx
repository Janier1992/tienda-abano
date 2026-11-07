import type { Category, Product } from '@/shared/types/domain'
import { Field, Select, TextArea } from '@/shared/components/ui/field'
import { STOCK_LABELS } from '@/features/catalogo/domain/completeness'
import { Checkbox } from './checkbox'

interface Props {
  product?: Product
  categories: Category[]
}

// Campos de la ficha. Vacío = dato pendiente; nunca se rellena con valores supuestos.
export function ProductFields({ product, categories }: Props) {
  const price = product?.price_cents != null ? (product.price_cents / 100).toFixed(2).replace('.', ',') : ''
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nombre" name="name" required defaultValue={product?.name} />
      <Field label="Identificador URL (slug)" name="slug" required defaultValue={product?.slug} hint="Minúsculas, números y guiones." />
      <Select label="Categoría" name="category_id" defaultValue={product?.category_id ?? ''}>
        <option value="">Sin categoría</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </Select>
      <Field label="Presentación / contenido del empaque" name="presentation" defaultValue={product?.presentation ?? ''} />
      <Field label="Precio (en la moneda configurada)" name="price_cents" inputMode="decimal" defaultValue={price} hint="Déjalo vacío si el precio no está confirmado." />
      <Select label="Disponibilidad" name="stock_status" defaultValue={product?.stock_status ?? 'pendiente'}>
        {Object.entries(STOCK_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </Select>
      <div className="md:col-span-2"><TextArea label="Descripción verificada" name="description" defaultValue={product?.description ?? ''} rows={6} /></div>
      <div className="md:col-span-2"><TextArea label="Aviso de cumplimiento exigido" name="compliance_notice" defaultValue={product?.compliance_notice ?? ''} rows={2} /></div>
      <Field label="Regiones bloqueadas" name="blocked_regions" defaultValue={product?.blocked_regions.join(', ') ?? ''} hint="Códigos separados por comas (ej.: ES-CN, ES-CE)." />
      {product && (
        <Checkbox name="active" label="Publicado en la tienda" defaultChecked={product.active} hint="Solo posible con descripción, precio, disponibilidad y al menos una fotografía." />
      )}
    </div>
  )
}
