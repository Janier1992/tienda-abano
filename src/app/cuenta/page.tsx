import Link from 'next/link'
import { ArrowUpRight, ClipboardList, LayoutDashboard, ShoppingBag, SlidersHorizontal, Store } from 'lucide-react'
import { hasRole, requireUser, STAFF_ROLES } from '@/features/auth/session'
import { Stagger, StaggerItem } from '@/shared/components/motion/reveal'

const SHORTCUTS = [
  { href: '/cuenta/pedidos', icon: ShoppingBag, title: 'Mis pedidos', text: 'Estado del pedido y del pago, por separado.' },
  { href: '/cuenta/solicitudes', icon: ClipboardList, title: 'Mis solicitudes', text: 'Consultas enviadas y respuestas del equipo.' },
  { href: '/cuenta/preferencias', icon: SlidersHorizontal, title: 'Preferencias', text: 'Comunicaciones y derechos sobre tus datos.' },
  { href: '/catalogo', icon: Store, title: 'Colección', text: 'Volver a explorar el catálogo.' },
]

export default async function AccountPage() {
  const user = await requireUser()
  const shortcuts = hasRole(user, STAFF_ROLES)
    ? [...SHORTCUTS, { href: '/admin', icon: LayoutDashboard, title: 'Panel de administración', text: 'Acceso del equipo según tu rol.' }]
    : SHORTCUTS

  return (
    <>
      <header className="space-y-3">
        <p className="eyebrow">Resumen</p>
        <h1>Hola</h1>
        <p className="text-muted-foreground">Has iniciado sesión como <span className="text-foreground">{user.email}</span>.</p>
      </header>
      <Stagger className="grid gap-4 sm:grid-cols-2">
        {shortcuts.map(({ href, icon: Icon, title, text }) => (
          <StaggerItem key={href}>
            <Link href={href} className="group flex h-full items-start gap-4 rounded-[1.5rem] border border-border bg-card/50 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:bg-card">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Icon aria-hidden className="size-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl">{title}</span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </span>
              <ArrowUpRight aria-hidden className="size-4 text-muted-foreground transition group-hover:rotate-45 group-hover:text-primary" />
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
