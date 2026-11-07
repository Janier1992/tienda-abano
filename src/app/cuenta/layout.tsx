import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, LogOut } from 'lucide-react'
import { requireUser } from '@/features/auth/session'
import { SideNav, type NavItem } from '@/features/admin/components/side-nav'
import { isSupabaseConfigured } from '@/shared/lib/env'
import { ButtonLink } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/data-state'
import { signOut } from '@/app/auth/actions'

export const metadata: Metadata = { title: 'Mi cuenta', robots: { index: false, follow: false } }

const NAV: NavItem[] = [
  { href: '/cuenta', label: 'Resumen', icon: 'cuenta' },
  { href: '/cuenta/pedidos', label: 'Mis pedidos', icon: 'pedidos' },
  { href: '/cuenta/solicitudes', label: 'Mis solicitudes', icon: 'solicitudes' },
  { href: '/cuenta/preferencias', label: 'Preferencias y privacidad', icon: 'preferencias' },
]

// Estilo común de las páginas de cuenta (títulos y listas)
const CONTENT_STYLE = 'min-w-0 space-y-8 [&_h1]:font-display [&_h1]:text-5xl [&_h1]:font-normal [&_ul.divide-y]:rounded-2xl [&_ul.divide-y]:bg-card/40'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed -right-40 -top-40 -z-10 size-[34rem] rounded-full bg-primary/[0.08] blur-[140px]" />
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/cuenta" className="flex items-center gap-3">
            <span aria-hidden className="ring-gold grid size-9 place-items-center rounded-full bg-surface font-display text-lg italic text-primary">M</span>
            <span className="font-display text-2xl">Mi cuenta</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
            <ArrowLeft aria-hidden className="size-4" /> Volver a la tienda
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <AccountGate>{children}</AccountGate>
        </Suspense>
      </main>
    </div>
  )
}

async function AccountGate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <AccountUnavailable />
  await requireUser()
  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass space-y-4 rounded-[1.5rem] p-3 lg:p-4">
          <SideNav items={NAV} root="/cuenta" label="Cuenta" />
          <form action={signOut} className="hidden border-t border-border pt-4 lg:block">
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/60 hover:text-foreground">
              <LogOut aria-hidden className="size-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <section className={CONTENT_STYLE}>{children}</section>
    </div>
  )
}

// Estado "pendiente de configuración": explica qué ofrecerá la cuenta y ofrece alternativas
function AccountUnavailable() {
  return (
    <div className="ring-gold relative grid overflow-hidden rounded-[2rem] bg-card/60 md:grid-cols-[1fr_1.2fr]">
      <div className="relative min-h-56">
        <Image src="/demo/humidor.svg" alt="" fill unoptimized sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card" />
      </div>
      <div className="relative space-y-6 p-8 md:p-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/[0.08] px-3 py-1 text-xs text-warning">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-warning" /> Cuentas pendientes de configuración
        </span>
        <h1 className="text-5xl">Tu espacio <em className="text-gold">personal</em></h1>
        <p className="leading-relaxed text-muted-foreground">
          Muy pronto podrás consultar tus pedidos, seguir tus solicitudes y gestionar tus preferencias de comunicación. Mientras tanto, no necesitas cuenta para explorar ni para contactar con el equipo.
        </p>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {['Historial y estado de pedidos', 'Seguimiento de solicitudes', 'Preferencias de comunicación', 'Solicitudes de privacidad'].map((item) => (
            <li key={item} className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2.5">
              <span aria-hidden className="size-1.5 rounded-full bg-primary" /> {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/catalogo">Explorar la colección</ButtonLink>
          <ButtonLink href="/contacto" variant="secondary">Contactar al equipo</ButtonLink>
        </div>
      </div>
    </div>
  )
}
