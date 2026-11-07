import type { Metadata } from 'next'
import { getBrandSettings } from '@/features/contenido/data'
import { Container, PageHeader } from '@/shared/components/layout'
import { CartView } from './cart-view'

export const metadata: Metadata = { title: 'Carrito' }

export default async function CartPage() {
  const settings = await getBrandSettings()
  const currency = settings.status === 'ok' ? settings.data.currency : 'EUR'
  const salesEnabled = settings.status === 'ok' && settings.data.sales_enabled
  return (
    <>
      <PageHeader eyebrow="Tu selección" title={<>Tu <em className="text-gold">carrito</em></>} description="Revisa cantidades y precios orientativos antes de continuar. Nada se confirma hasta el final." />
      <Container className="py-12">
        <CartView currency={currency} salesEnabled={salesEnabled} />
      </Container>
    </>
  )
}
