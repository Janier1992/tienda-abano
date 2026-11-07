import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Clock, Mail, MessageCircle, Phone } from 'lucide-react'
import { getBrandSettings } from '@/features/contenido/data'
import { SupportForm } from '@/features/atencion/support-form'
import { Skeleton } from '@/shared/components/data-state'
import { Container } from '@/shared/components/layout'
import { Reveal } from '@/shared/components/motion/reveal'
import { Notice } from '@/shared/components/ui/notice'
import type { BrandSettings } from '@/shared/types/domain'

export const metadata: Metadata = { title: 'Contacto' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const settings = await getBrandSettings()
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="animate-aurora pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[130px]" />
      <Container className="relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <Reveal className="space-y-10">
          <div className="space-y-5">
            <p className="eyebrow">Contacto</p>
            <h1 className="text-5xl md:text-7xl">Hablemos con <em className="text-gold">calma</em></h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Cuéntanos qué necesitas. Un integrante del equipo continuará la atención con el contexto que nos indiques.
            </p>
          </div>
          <Channels settings={settings.status === 'ok' ? settings.data : null} />
        </Reveal>

        <Reveal delay={0.15}>
          <div className="glass ring-gold rounded-[2rem] p-6 md:p-10">
            <p className="mb-6 flex items-center gap-3 font-display text-3xl">
              <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary"><MessageCircle aria-hidden className="size-5" /></span>
              Escríbenos
            </p>
            <Suspense fallback={<Skeleton className="h-96" />}>
              <ContextualForm searchParams={searchParams} />
            </Suspense>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

// Si se llega desde un pedido o producto, se conserva esa referencia para no repetirla
async function ContextualForm({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.slice(0, 120)
  const orderReference = pick(params.pedido)?.replace(/[^A-Z0-9]/gi, '').slice(0, 20)
  const productSlug = pick(params.producto)?.replace(/[^a-z0-9-]/g, '')

  return (
    <SupportForm
      context={{ origin: orderReference ? 'pedido' : productSlug ? 'producto' : 'contacto', orderReference, productSlug }}
      defaultType={orderReference ? 'soporte_pedido' : 'consulta'}
      defaultMessage={orderReference ? `Consulta sobre el pedido ${orderReference}: ` : ''}
    />
  )
}

function ChannelCard({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <li className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-border-strong">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Icon aria-hidden className="size-5" /></span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        <span className="block truncate font-medium">{children}</span>
      </span>
    </li>
  )
}

// Solo canales y horarios configurados por la marca; no se prometen tiempos de respuesta
function Channels({ settings }: { settings: BrandSettings | null }) {
  const hasChannels = Boolean(settings?.support_email || settings?.support_phone)
  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Canales de atención</h2>
      {!hasChannels && <Notice title="Canales pendientes de configuración">Por ahora, el formulario es la vía de contacto disponible.</Notice>}
      <ul className="space-y-3">
        {settings?.support_email && <ChannelCard icon={Mail} label="Correo"><a href={`mailto:${settings.support_email}`} className="hover:text-primary">{settings.support_email}</a></ChannelCard>}
        {settings?.support_phone && <ChannelCard icon={Phone} label="Teléfono"><a href={`tel:${settings.support_phone}`} className="hover:text-primary">{settings.support_phone}</a></ChannelCard>}
        <ChannelCard icon={Clock} label="Horario de atención">{settings?.support_hours ?? 'Pendiente de publicación'}</ChannelCard>
      </ul>
      <p className="text-xs text-muted-foreground">Responderemos por correo en cuanto un asesor revise tu solicitud.</p>
    </div>
  )
}
