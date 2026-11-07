import { getBrandSettings, getPublishedPages, PENDING_BRAND_NAME } from '@/features/contenido/data'
import { AgeNotice } from '@/features/cumplimiento/age-notice'
import { ConsentBanner } from '@/features/cumplimiento/consent-banner'
import { AssistantWidget } from '@/features/asistente/assistant-widget'
import { CartDrawer } from '@/features/carrito/cart-drawer'
import { isDemoMode } from '@/shared/lib/env'
import { DemoRibbon } from './_components/demo-ribbon'
import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'

// Datos cacheados: el encabezado y el pie forman parte del shell estático
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settingsResult, pagesResult] = await Promise.all([getBrandSettings(), getPublishedPages()])
  const settings = settingsResult.status === 'ok' ? settingsResult.data : null
  const pages = pagesResult.status === 'ok' ? pagesResult.data : []
  const brandName = settings?.brand_name ?? PENDING_BRAND_NAME

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-card focus:px-4 focus:py-2">Saltar al contenido</a>
      <SiteHeader brandName={brandName} minAge={settings?.min_age ?? 18} />
      {isDemoMode() && <DemoRibbon />}
      <main id="contenido" className="min-h-[60vh]">{children}</main>
      <SiteFooter settings={settings} pages={pages} />
      <CartDrawer currency={settings?.currency ?? 'EUR'} />
      <AgeNotice minAge={settings?.min_age ?? 18} brandName={brandName} />
      <ConsentBanner />
      <AssistantWidget supportHours={settings?.support_hours ?? null} />
    </>
  )
}
