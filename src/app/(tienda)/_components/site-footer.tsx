import Link from 'next/link'
import { Clock, Mail, Phone, ShieldCheck } from 'lucide-react'
import type { BrandSettings, ContentPage } from '@/shared/types/domain'
import { BrandMark } from './site-header'

interface Props {
  settings: BrandSettings | null
  pages: Pick<ContentPage, 'slug' | 'title'>[]
}

const EXPLORE = [
  { href: '/catalogo', label: 'Colección de habanos' },
  { href: '/servicios', label: 'Atelier & servicios' },
  { href: '/preguntas-frecuentes', label: 'Preguntas frecuentes' },
  { href: '/contacto', label: 'Contacto' },
]

// Solo muestra canales y horarios que la marca configuró; nunca valores supuestos
export function SiteFooter({ settings, pages }: Props) {
  const name = settings?.brand_name ?? 'Tienda'
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-5 pt-16 md:px-8 xl:px-16">
        <div className="regulatory px-6 py-6 text-center">
          <p className="text-[0.8rem] font-bold uppercase tracking-[0.08em]">Advertencia sanitaria</p>
          <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-ink-foreground/85">
            Fumar perjudica gravemente su salud y la de los que están a su alrededor. Prohibida la venta a menores de {settings?.min_age ?? 18} años.
          </p>
        </div>

        <div className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <BrandMark name={name} />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings?.description ?? 'Descripción de la marca pendiente de configuración.'}
            </p>
            <p className="label-gold inline-flex items-center gap-2"><ShieldCheck className="size-4" /> Solo mayores de {settings?.min_age ?? 18} años</p>
          </div>

          <FooterColumn title="Explorar">
            {EXPLORE.map((item) => <FooterLink key={item.href} href={item.href}>{item.label}</FooterLink>)}
          </FooterColumn>

          <FooterColumn title="Concierge & atención">
            {settings?.support_hours && <p className="flex items-center gap-2"><Clock className="size-4 text-accent" />{settings.support_hours}</p>}
            {settings?.support_phone && <p className="flex items-center gap-2"><Phone className="size-4 text-accent" /><a href={`tel:${settings.support_phone}`} className="hover:text-ink">{settings.support_phone}</a></p>}
            {settings?.support_email && <p className="flex items-center gap-2"><Mail className="size-4 text-accent" /><a href={`mailto:${settings.support_email}`} className="hover:text-ink">{settings.support_email}</a></p>}
            {!settings?.support_email && !settings?.support_phone && <FooterLink href="/contacto">Formulario de contacto</FooterLink>}
          </FooterColumn>

          <FooterColumn title="Marco legal">
            {pages.map((page) => <FooterLink key={page.slug} href={`/politicas/${page.slug}`}>{page.title}</FooterLink>)}
            {pages.length === 0 && <p>Políticas pendientes de publicación.</p>}
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {name}. Todos los derechos reservados.</p>
          <p className="label-gold">Sitio exclusivo para personas adultas</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="label-gold">{title}</p>
      <div className="space-y-3 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="block transition-colors hover:text-ink">{children}</Link>
}
