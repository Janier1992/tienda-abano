import { requireRole } from '@/features/auth/session'
import { listCategories } from '@/features/admin/queries'
import { createProduct } from '@/features/admin/product-actions'
import { AdminForm } from '@/features/admin/components/admin-form'
import { ProductFields } from '@/features/admin/components/product-form'

export default async function NewProductPage() {
  await requireRole(['catalogo'])
  const categories = await listCategories()

  return (
    <>
      <h1 className="text-3xl font-semibold">Nuevo producto</h1>
      <p className="text-sm text-muted-foreground">Se guarda como borrador. Podrás publicarlo cuando la ficha tenga todos los datos verificados y fotografías oficiales.</p>
      <AdminForm action={createProduct} submitLabel="Crear borrador">
        <ProductFields categories={categories.status === 'ok' ? categories.data : []} />
      </AdminForm>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
