'use client'
import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Search, UserRound, X } from 'lucide-react'
import { CartBadge } from '@/features/carrito/cart-badge'

const NAV = [
  { href: '/', label: 'Inicio & Boutique' },
  { href: '/catalogo', label: 'Colección de Habanos' },
  { href: '/servicios', label: 'Atelier & Servicios' },
  { href: '/preguntas-frecuentes', label: 'Ayuda' },
  { href: '/contacto', label: 'Contacto' },
]

// El asistente escucha este evento para abrirse desde cualquier parte de la tienda
export const OPEN_ASSISTANT_EVENT = 'abrir-asistente'

export function BrandMark({ name, subtitle = 'Selección privada' }: { name: string; subtitle?: string }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={`${name}, inicio`}>
      <Image src="/stitch/emblema.png" alt="" width={44} height={42} className="mix-blend-multiply transition-transform duration-500 group-hover:rotate-[-6deg]" />
      <span className="leading-none">
        <span className="block font-display text-lg uppercase tracking-[0.08em] text-ink md:text-xl">{name}</span>
        <span className="label-gold mt-1 block !text-[0.6rem]">{subtitle}</span>
      </span>
    </Link>
  )
}

// La ruta actual es dato de URL: se lee dentro de <Suspense> para no bloquear rutas dinámicas
function NavLinks({ pathname }: { pathname: string | null }) {
  return NAV.map((item) => {
    const active = pathname !== null && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))
    return (
      <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
        className={`link-gold py-1 transition-colors ${active ? '!text-ink font-semibold after:!left-0 after:!right-0' : '!text-muted-foreground hover:!text-ink'}`}>
        {item.label}
      </Link>
    )
  })
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />
}

export function SiteHeader({ brandName, minAge }: { brandName: string; minAge: number }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <p className="regulatory px-4 py-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.12em]">
        Aviso legal: venta exclusiva para mayores de {minAge} años según la legislación vigente.
      </p>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6 px-5 md:px-8 xl:px-16">
          <BrandMark name={brandName} />
          <nav aria-label="Principal" className="hidden items-center gap-7 text-[0.8rem] lg:flex">
            <Suspense fallback={<NavLinks pathname={null} />}><ActiveNavLinks /></Suspense>
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/catalogo" className="grid size-10 place-items-center rounded hover:bg-muted" aria-label="Buscar en la colección"><Search aria-hidden className="size-[1.1rem]" /></Link>
            <SommelierButton />
            <CartBadge />
            <Link href="/cuenta" className="grid size-10 place-items-center rounded-full bg-ink text-ink-foreground transition hover:bg-cedar" aria-label="Mi cuenta">
              <UserRound aria-hidden className="size-4" />
            </Link>
            <button type="button" onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded hover:bg-muted lg:hidden" aria-label="Abrir menú" aria-expanded={menuOpen}>
              <Menu aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

function SommelierButton() {
  return (
    <button
      type="button" onClick={() => window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT))}
      className="mx-1 hidden items-center gap-2 rounded border border-accent/60 bg-accent-soft/25 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ink transition hover:bg-accent-soft/50 sm:inline-flex"
    >
      <span aria-hidden className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-success/60" /><span className="size-2 rounded-full bg-success" /></span>
      Sommelier online
    </button>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-label="Menú" className="fixed inset-0 z-50 flex flex-col bg-background px-6 py-6 lg:hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button onClick={onClose} className="ml-auto grid size-11 place-items-center rounded border border-border" aria-label="Cerrar menú"><X className="size-5" /></button>
          <nav aria-label="Móvil" className="mt-8 flex flex-col">
            {[...NAV, { href: '/cuenta', label: 'Mi cuenta' }].map((item, i) => (
              <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.05 }}>
                <Link href={item.href} onClick={onClose} className="block border-b border-border py-4 font-display text-3xl text-ink">{item.label}</Link>
              </motion.div>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
