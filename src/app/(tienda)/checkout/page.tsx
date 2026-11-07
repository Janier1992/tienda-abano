import type { Metadata } from 'next'
import { getBrandSettings } from '@/features/contenido/data'
import { DataState } from '@/shared/components/data-state'
import { Container } from '@/shared/components/layout'
import { Reveal } from '@/shared/components/motion/reveal'
import { CheckoutFlow } from './checkout-flow'

export const metadata: Metadata = { title: 'Finalizar pedido' }

export default async function CheckoutPage() {
  const settings = await getBrandSettings()
  return (
    <Container className="py-12 md:py-16">
      <Reveal className="mb-10 space-y-4">
        <p className="eyebrow">Finalizar</p>
        <h1 className="text-5xl md:text-6xl">Tu <em className="text-gold">pedido</em></h1>
      </Reveal>
      <DataState result={settings}>
        {(data) => (
          <CheckoutFlow
            currency={data.currency}
            minAge={data.min_age}
            salesEnabled={data.sales_enabled}
            regions={data.allowed_regions}
          />
        )}
      </DataState>
    </Container>
  )
}
