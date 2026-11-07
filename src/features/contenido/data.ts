import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import type { BrandSettings, ContentPage, Faq, Service } from '@/shared/types/domain'
import { createPublicClient } from '@/shared/lib/supabase/server'
import { CACHE_TAGS, safeRead, unwrap } from '@/shared/lib/data-result'
import { DEMO_FAQS, DEMO_PAGES, DEMO_SERVICES, DEMO_SETTINGS } from '@/shared/lib/demo/fixtures'

async function fetchBrandSettings(): Promise<BrandSettings> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.marca)
  const result = await createPublicClient().from('brand_settings').select('*').eq('id', 1).single()
  return unwrap(result) as BrandSettings
}

async function fetchFaqs(): Promise<Faq[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.contenido)
  const result = await createPublicClient().from('faqs').select('*').eq('published', true).order('position')
  return unwrap(result) as Faq[]
}

async function fetchServices(): Promise<Service[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.contenido)
  const result = await createPublicClient().from('services').select('*').eq('published', true).order('name')
  return unwrap(result) as Service[]
}

async function fetchPage(slug: string): Promise<ContentPage | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.contenido)
  const { data, error } = await createPublicClient()
    .from('content_pages').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  if (error) throw new Error(error.message)
  return data as ContentPage | null
}

async function fetchPublishedPages(): Promise<Pick<ContentPage, 'slug' | 'title'>[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.contenido)
  const result = await createPublicClient().from('content_pages').select('slug, title').eq('published', true).order('title')
  return unwrap(result) as Pick<ContentPage, 'slug' | 'title'>[]
}

export const getBrandSettings = () => safeRead('marca', fetchBrandSettings, () => DEMO_SETTINGS)
export const getFaqs = () => safeRead('contenido', fetchFaqs, () => DEMO_FAQS)
export const getServices = () => safeRead('contenido', fetchServices, () => DEMO_SERVICES)
export const getPage = (slug: string) => safeRead('contenido', () => fetchPage(slug), () => DEMO_PAGES.find((p) => p.slug === slug) ?? null)
export const getPublishedPages = () =>
  safeRead('contenido', fetchPublishedPages, () => DEMO_PAGES.map(({ slug, title }) => ({ slug, title })))

export const PENDING_BRAND_NAME = 'Marca pendiente de configuración'
