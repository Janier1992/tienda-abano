import { notFound } from 'next/navigation'
import { requireRole } from '@/features/auth/session'
import { getProduct, listCategories } from '@/features/admin/queries'
import { deleteProductImage, updateProduct, uploadProductImage } from '@/features/admin/product-actions'
import { AdminForm } from '@/features/admin/components/admin-form'
import { ProductFields } from '@/features/admin/components/product-form'
import { formatDate } from '@/features/admin/components/checkbox'
import { getMissingFields } from '@/features/catalogo/domain/completeness'
import { DataState } from '@/shared/components/data-state'
import { Field } from '@/shared/components/ui/field'
import { Notice } from '@/shared/components/ui/notice'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(['catalogo'])
  const { id } = await params
  const [product, categories] = await Promise.all([getProduct(id), listCategories()])

  return (
    <DataState result={product}>
      {(data) => {
        if (!data) notFound()
        const missing = getMissingFields(data)
        return (
          <>
            <h1 className="text-3xl font-semibold">{data.name}</h1>
            <p className="text-xs text-muted-foreground">Última actualización: {formatDate(data.updated_at)}</p>
            {missing.length > 0 && <Notice tone="warning" title="Ficha incompleta: no puede publicarse">Falta: {missing.join(', ')}.</Notice>}
            <AdminForm action={updateProduct.bind(null, data.id)}>
              <ProductFields product={data} categories={categories.status === 'ok' ? categories.data : []} />
            </AdminForm>

            <section className="space-y-4 border-t border-border pt-6" aria-labelledby="fotos">
              <h2 id="fotos" className="text-2xl font-semibold">Fotografías oficiales</h2>
              <ul className="grid gap-4 sm:grid-cols-3">
                {data.product_images.map((image) => (
                  <li key={image.id} className="space-y-2 rounded-lg border border-border p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- vista previa de un archivo del bucket */}
                    <img src={image.url} alt={image.alt} className="aspect-square w-full rounded object-cover" />
                    <AdminForm action={deleteProductImage.bind(null, image.id)} submitLabel="Eliminar" variant="danger" className="space-y-2"><p className="text-xs">{image.alt}</p></AdminForm>
                  </li>
                ))}
              </ul>
              <AdminForm action={uploadProductImage.bind(null, data.id)} submitLabel="Subir imagen">
                <Field label="Imagen (JPG, PNG o WebP, máx. 5 MB)" name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
                <Field label="Texto alternativo" name="alt" required hint="Describe la imagen para personas que usan lector de pantalla." />
              </AdminForm>
            </section>
          </>
        )
      }}
    </DataState>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
