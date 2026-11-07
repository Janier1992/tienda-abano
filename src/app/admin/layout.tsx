import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Panel de administración', robots: { index: false, follow: false } }

// Marco estático del panel; la verificación de sesión está en (panel)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed -left-40 -top-40 -z-10 size-[36rem] rounded-full bg-primary/[0.07] blur-[140px]" />
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 md:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <span aria-hidden className="ring-gold grid size-9 place-items-center rounded-full bg-surface font-display text-lg italic text-primary">P</span>
            <span className="font-display text-2xl">Panel</span>
            <span className="hidden rounded-full border border-border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground sm:inline">Equipo interno</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-xs font-semibold transition hover:border-primary/60 hover:text-primary">
            Ver tienda <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-[90rem] px-5 py-8 md:px-8">{children}</div>
    </div>
  )
}
