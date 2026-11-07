'use server'
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ActionState } from '@/shared/lib/action-state'
import { CACHE_TAGS } from '@/shared/lib/data-result'
import { getMissingFields } from '@/features/catalogo/domain/completeness'
import { categorySchema, IMAGE_TYPES, MAX_IMAGE_BYTES, productSchema } from './schemas'
import { failed, formToObject, runStaffAction, saved, writeProblem, type StaffContext } from './run-action'

const CATALOG: ['catalogo'] = ['catalogo']
type ProductInput = z.infer<typeof productSchema>

// Impide publicar fichas incompletas, incluida la fotografía oficial (la BD no puede comprobarla)
async function publishProblem(data: ProductInput, productId: string | null, { supabase }: StaffContext): Promise<string | null> {
  if (!data.active) return null
  let images: { id: string }[] = []
  if (productId) {
    const { data: rows } = await supabase.from('product_images').select('id').eq('product_id', productId)
    images = rows ?? []
  }
  const missing = getMissingFields({ ...data, product_images: images.map((row) => ({ ...row, url: '', alt: '', position: 0 })) })
  return missing.length ? `No se puede publicar: falta ${missing.join(', ')}.` : null
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let createdId: string | null = null
  const result = await runStaffAction(CATALOG, productSchema, formToObject(formData), async (data, ctx) => {
    // Un producto nuevo no tiene imágenes: se crea siempre inactivo
    const { data: row, error } = await ctx.supabase
      .from('products').insert({ ...data, active: false, updated_by: ctx.user.id }).select('id').single()
    if (error) return failed(error)
    createdId = row.id
    updateTag(CACHE_TAGS.catalogo)
    return saved('Producto creado como borrador. Añade fotografías y publícalo cuando esté completo.')
  })
  if (createdId) redirect(`/admin/productos/${createdId}?creado=1`)
  return result
}

export async function updateProduct(productId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return runStaffAction(CATALOG, productSchema, formToObject(formData), async (data, ctx) => {
    const incomplete = await publishProblem(data, productId, ctx)
    if (incomplete) return { status: 'error', message: incomplete }
    const problem = writeProblem(await ctx.supabase
      .from('products').update({ ...data, updated_by: ctx.user.id, updated_at: new Date().toISOString() }).eq('id', productId).select('id'))
    if (problem) return problem
    updateTag(CACHE_TAGS.catalogo)
    return saved(data.active ? 'Producto guardado y publicado.' : 'Producto guardado (no publicado).')
  })
}

const imageSchema = z.object({
  alt: z.string().trim().min(3, 'Describe la imagen para accesibilidad').max(200),
  file: z
    .instanceof(File, { message: 'Selecciona una imagen' })
    .refine((file) => file.size > 0 && file.size <= MAX_IMAGE_BYTES, 'La imagen debe pesar como máximo 5 MB')
    .refine((file) => (IMAGE_TYPES as readonly string[]).includes(file.type), 'Formatos admitidos: JPG, PNG o WebP'),
})

export async function uploadProductImage(productId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return runStaffAction(CATALOG, imageSchema, formToObject(formData), async ({ alt, file }, { supabase }) => {
    const extension = file.type.split('/')[1]
    const path = `${productId}/${crypto.randomUUID()}.${extension}`
    const upload = await supabase.storage.from('productos').upload(path, file, { contentType: file.type })
    if (upload.error) return { status: 'error', message: 'No se pudo subir la imagen. Inténtalo de nuevo.' }

    const url = supabase.storage.from('productos').getPublicUrl(path).data.publicUrl
    const { count } = await supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('product_id', productId)
    const { error } = await supabase.from('product_images').insert({ product_id: productId, url, alt, position: count ?? 0 })
    if (error) {
      await supabase.storage.from('productos').remove([path])
      return failed(error)
    }
    updateTag(CACHE_TAGS.catalogo)
    return saved('Imagen añadida.')
  })
}

export async function deleteProductImage(imageId: string): Promise<ActionState> {
  return runStaffAction(CATALOG, z.object({}), {}, async (_data, { supabase }) => {
    const { data: image } = await supabase.from('product_images').select('url, product_id').eq('id', imageId).single()
    if (!image) return { status: 'error', message: 'La imagen ya no existe.' }
    const { error } = await supabase.from('product_images').delete().eq('id', imageId)
    if (error) return failed(error)
    // Ruta del objeto dentro del bucket a partir de la URL pública
    const objectPath = image.url.split('/productos/').pop()
    if (objectPath) await supabase.storage.from('productos').remove([objectPath])

    // Sin fotografía la ficha deja de estar completa: se retira de la tienda
    const { count } = await supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('product_id', image.product_id)
    const unpublished = count === 0
    if (unpublished) await supabase.from('products').update({ active: false }).eq('id', image.product_id)
    updateTag(CACHE_TAGS.catalogo)
    return saved(unpublished ? 'Imagen eliminada. El producto se retiró de la tienda por no tener fotografías.' : 'Imagen eliminada.')
  })
}

export async function saveCategory(categoryId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return runStaffAction(CATALOG, categorySchema, formToObject(formData), async (data, { supabase }) => {
    const problem = writeProblem(categoryId
      ? await supabase.from('categories').update(data).eq('id', categoryId).select('id')
      : await supabase.from('categories').insert(data).select('id'))
    if (problem) return problem
    updateTag(CACHE_TAGS.catalogo)
    return saved(categoryId ? 'Categoría actualizada.' : 'Categoría creada.')
  })
}
