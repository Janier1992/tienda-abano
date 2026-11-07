import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import type { Category, Product } from '@/shared/types/domain'
import { createPublicClient } from '@/shared/lib/supabase/server'
import { CACHE_TAGS, safeRead, unwrap } from '@/shared/lib/data-result'
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/shared/lib/demo/fixtures'

const PRODUCT_FIELDS =
  'id, slug, name, category_id, description, presentation, price_cents, stock_status, compliance_notice, blocked_regions, active, updated_at, brand, vitola_galera, ring_gauge, length_mm, strength, tasting_notes, product_images(id, url, alt, position)'

function sortImages(product: Product): Product {
  return { ...product, product_images: [...product.product_images].sort((a, b) => a.position - b.position) }
}

// RLS garantiza que el cliente anónimo solo ve productos activos
async function fetchActiveProducts(): Promise<Product[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.catalogo)
  const result = await createPublicClient().from('products').select(PRODUCT_FIELDS).eq('active', true).order('name')
  return unwrap(result).map((p) => sortImages(p as unknown as Product))
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.catalogo)
  const { data, error } = await createPublicClient()
    .from('products').select(PRODUCT_FIELDS).eq('slug', slug).eq('active', true).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? sortImages(data as unknown as Product) : null
}

async function fetchCategories(): Promise<Category[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.catalogo)
  const result = await createPublicClient().from('categories').select('*').eq('active', true).order('position')
  return unwrap(result) as Category[]
}

export const getActiveProducts = () => safeRead('catalogo', fetchActiveProducts, () => DEMO_PRODUCTS)
export const getProductBySlug = (slug: string) =>
  safeRead('catalogo', () => fetchProductBySlug(slug), () => DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null)
export const getCategories = () => safeRead('catalogo', fetchCategories, () => DEMO_CATEGORIES)
