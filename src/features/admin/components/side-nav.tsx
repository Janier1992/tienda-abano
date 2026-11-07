'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  ClipboardList, FileText, FolderTree, History, LayoutDashboard, MessagesSquare, Package,
  Settings, ShoppingBag, SlidersHorizontal, UserRound, Users,
} from 'lucide-react'

// Los iconos se eligen por nombre: un componente de servidor no puede pasar funciones a uno de cliente
const ICONS = {
  resumen: LayoutDashboard, productos: Package, categorias: FolderTree, pedidos: ShoppingBag,
  consultas: MessagesSquare, contenido: FileText, configuracion: Settings, auditoria: History,
  usuarios: Users, cuenta: UserRound, solicitudes: ClipboardList, preferencias: SlidersHorizontal,
} as const

export type NavIcon = keyof typeof ICONS
export interface NavItem { href: string; label: string; icon: NavIcon }

function isActive(pathname: string, href: string, root: string): boolean {
  if (href === root) return pathname === root
  return pathname === href || pathname.startsWith(`${href.split('/').slice(0, 3).join('/')}`)
}

// Navegación lateral con indicador animado del elemento activo
export function SideNav({ items, root, label }: { items: NavItem[]; root: string; label: string }) {
  const pathname = usePathname()
  return (
    <nav aria-label={label} className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map((item) => {
        const Icon = ICONS[item.icon]
        const active = isActive(pathname, item.href, root)
        return (
          <Link
            key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
            className={`relative flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${active ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}
          >
            {active && (
              <motion.span
                layoutId={`nav-activo-${root}`} aria-hidden
                className="absolute inset-0 -z-10 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/15 to-primary/[0.03]"
                transition={{ type: 'spring', damping: 30, stiffness: 380 }}
              />
            )}
            <Icon aria-hidden className={`size-4 ${active ? 'text-primary' : ''}`} />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
