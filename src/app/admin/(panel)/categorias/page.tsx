import { requireRole } from '@/features/auth/session'
import { listCategories } from '@/features/admin/queries'
import { saveCategory } from '@/features/admin/product-actions'
import { AdminForm } from '@/features/admin/components/admin-form'
import { Checkbox } from '@/features/admin/components/checkbox'
import { DataState } from '@/shared/components/data-state'
import { Field } from '@/shared/components/ui/field'
import type { Category } from '@/shared/types/domain'

function CategoryFields({ category }: { category?: Category }) {
  return (
    <div className="grid items-end gap-3 md:grid-cols-4">
      <Field label="Nombre" name="name" required defaultValue={category?.name} />
      <Field label="Slug" name="slug" required defaultValue={category?.slug} />
      <Field label="Orden" name="position" type="number" min={0} defaultValue={category?.position ?? 0} />
      <Checkbox name="active" label="Visible" defaultChecked={category?.active ?? true} />
    </div>
  )
}

export default async function CategoriesPage() {
  await requireRole(['catalogo'])
  const categories = await listCategories()

  return (
    <>
      <h1 className="text-3xl font-semibold">Categorías</h1>
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-xl font-semibold">Nueva categoría</h2>
        <AdminForm action={saveCategory.bind(null, null)} submitLabel="Crear"><CategoryFields /></AdminForm>
      </section>
      <DataState result={categories}>
        {(rows) => (
          <ul className="space-y-3">
            {rows.map((category) => (
              <li key={category.id} className="rounded-lg border border-border p-4">
                <AdminForm action={saveCategory.bind(null, category.id)}><CategoryFields category={category} /></AdminForm>
              </li>
            ))}
          </ul>
        )}
      </DataState>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
