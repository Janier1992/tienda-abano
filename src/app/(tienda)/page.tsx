import { getBrandSettings, PENDING_BRAND_NAME } from '@/features/contenido/data'
import { getActiveProducts, getCategories } from '@/features/catalogo/data'
import { Container } from '@/shared/components/layout'
import { Notice } from '@/shared/components/ui/notice'
import { Hero } from './_home/hero'
import { Marquee } from './_home/marquee'
import { AdvisorPanel, CategoryBento, Experience, FeaturedProducts } from './_home/sections'

export default async function HomePage() {
  const [settingsResult, categoriesResult, productsResult] = await Promise.all([getBrandSettings(), getCategories(), getActiveProducts()])
  const settings = settingsResult.status === 'ok' ? settingsResult.data : null
  const categories = categoriesResult.status === 'ok' ? categoriesResult.data : []
  const products = productsResult.status === 'ok' ? productsResult.data : []
  const images = products.flatMap((p) => p.product_images.slice(0, 1)).map(({ url, alt }) => ({ url, alt }))
  const featured = products.filter((p) => p.stock_status === 'disponible').concat(products.filter((p) => p.stock_status !== 'disponible'))

  return (
    <>
      <Hero brandName={settings?.brand_name ?? PENDING_BRAND_NAME} tagline={settings?.tagline ?? null} images={images} />
      <Marquee />
      {!settings?.sales_enabled && (
        <Container className="pt-16">
          <Notice tone="info" title="Compra online aún no habilitada">
            Puedes explorar la colección y dejar tu solicitud; un asesor te atenderá. La venta online se activará cuando la marca complete la validación legal.
          </Notice>
        </Container>
      )}
      <CategoryBento categories={categories} products={products} />
      <FeaturedProducts products={featured} currency={settings?.currency ?? 'EUR'} />
      <Experience />
      <AdvisorPanel supportHours={settings?.support_hours ?? null} />
    </>
  )
}
