import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { getBrandSettings, PENDING_BRAND_NAME } from '@/features/contenido/data'
import { isSupabaseConfigured } from '@/shared/lib/env'
import { Notice } from '@/shared/components/ui/notice'
import { Skeleton } from '@/shared/components/data-state'
import { LoginForm } from './login-form'
import { safeNextPath } from './next-path'

export const metadata: Metadata = { title: 'Acceder' }

const ERRORS: Record<string, string> = {
  enlace: 'El enlace no es válido o ha caducado. Solicita uno nuevo.',
}

type Params = Promise<{ next?: string; error?: string }>

// Pantalla dividida: panel artístico a la izquierda y acceso por enlace a la derecha
export default async function LoginPage({ searchParams }: { searchParams: Params }) {
  const settings = await getBrandSettings()
  const brandName = settings.status === 'ok' ? settings.data.brand_name : PENDING_BRAND_NAME

  return (
    <main className="grid min-h-[100svh] lg:grid-cols-[1.05fr_1fr]">
      <ArtPanel brandName={brandName} />

      <section className="relative flex flex-col justify-center px-5 py-10 md:px-12 lg:px-20">
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative mx-auto w-full max-w-md space-y-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
            <ArrowLeft aria-hidden className="size-4" /> Volver a la tienda
          </Link>
          <div className="space-y-4">
            <p className="eyebrow">Tu cuenta</p>
            <h1 className="text-5xl md:text-6xl">Acceder</h1>
            <p className="text-muted-foreground">Consulta tus pedidos, tus solicitudes y tus preferencias de comunicación.</p>
          </div>

          <div className="glass ring-gold rounded-[1.75rem] p-6 md:p-8">
            {isSupabaseConfigured() ? (
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <LoginContent searchParams={searchParams} />
              </Suspense>
            ) : (
              <Notice tone="warning" title="Acceso pendiente de configuración">
                El servicio de cuentas todavía no está conectado. Puedes explorar el catálogo y contactar con la marca sin cuenta.
              </Notice>
            )}
          </div>

          <ul className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {[
              { icon: KeyRound, text: 'Sin contraseñas' },
              { icon: Mail, text: 'Enlace de un solo uso' },
              { icon: ShieldCheck, text: 'Cuenta opcional' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border px-3 py-2">
                <Icon aria-hidden className="size-3.5 text-primary" /> {text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

function ArtPanel({ brandName }: { brandName: string }) {
  return (
    <aside className="relative h-56 overflow-hidden border-b border-border sm:h-72 lg:h-auto lg:border-b-0 lg:border-r">
      <Image src="/demo/caja-abierta.svg" alt="" fill priority unoptimized sizes="(min-width: 1024px) 50vw, 100vw" className="scale-110 object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10 lg:bg-gradient-to-r lg:from-background/20 lg:via-background/30 lg:to-background" />
      <div aria-hidden className="animate-aurora absolute -left-20 bottom-0 size-96 rounded-full bg-primary/15 blur-[120px]" />
      <div className="relative flex h-full flex-col justify-between p-6 md:p-10 lg:p-14">
        <Link href="/" className="flex items-center gap-3" aria-label={`${brandName}, inicio`}>
          <span aria-hidden className="ring-gold grid size-10 place-items-center rounded-full bg-surface/80 font-display text-xl italic text-primary backdrop-blur">{brandName.charAt(0)}</span>
          <span className="font-display text-2xl">{brandName}</span>
        </Link>
        <blockquote className="hidden max-w-md space-y-4 lg:block">
          <p className="font-display text-5xl leading-[1.05]">
            Cada pedido merece <em className="text-gold">atención</em>, no prisa.
          </p>
          <footer className="text-sm text-muted-foreground">Selección, conservación y asesoría en un solo lugar.</footer>
        </blockquote>
      </div>
    </aside>
  )
}

// Los parámetros de la URL son datos de petición: se leen dentro de Suspense
async function LoginContent({ searchParams }: { searchParams: Params }) {
  const { next, error } = await searchParams
  return (
    <div className="space-y-5">
      {error && <Notice tone="error" title={ERRORS[error] ?? 'No se pudo iniciar sesión.'} />}
      <LoginForm next={safeNextPath(next)} />
    </div>
  )
}
