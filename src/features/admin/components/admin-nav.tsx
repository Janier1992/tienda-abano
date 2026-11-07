import { LogOut } from 'lucide-react'
import type { StaffRole } from '@/shared/types/domain'
import { hasRole, type CurrentUser } from '@/features/auth/session'
import { signOut } from '@/app/auth/actions'
import { SideNav, type NavItem } from './side-nav'

const LINKS: (NavItem & { roles: StaffRole[] })[] = [
  { href: '/admin', label: 'Resumen', icon: 'resumen', roles: ['catalogo', 'pedidos', 'atencion'] },
  { href: '/admin/productos', label: 'Productos', icon: 'productos', roles: ['catalogo'] },
  { href: '/admin/categorias', label: 'Categorías', icon: 'categorias', roles: ['catalogo'] },
  { href: '/admin/pedidos', label: 'Pedidos', icon: 'pedidos', roles: ['pedidos'] },
  { href: '/admin/consultas', label: 'Consultas', icon: 'consultas', roles: ['atencion'] },
  { href: '/admin/contenido/faqs', label: 'Contenido', icon: 'contenido', roles: ['admin'] },
  { href: '/admin/configuracion', label: 'Configuración', icon: 'configuracion', roles: ['admin'] },
  { href: '/admin/auditoria', label: 'Auditoría', icon: 'auditoria', roles: ['admin'] },
  { href: '/admin/usuarios', label: 'Usuarios y roles', icon: 'usuarios', roles: ['admin'] },
]

export const ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Administración', catalogo: 'Catálogo', pedidos: 'Pedidos', atencion: 'Atención', cliente: 'Cliente',
}

// Navegación según rol; ocultar enlaces es solo comodidad, cada página vuelve a verificar permisos
export function AdminNav({ user }: { user: CurrentUser }) {
  const items = LINKS.filter((link) => hasRole(user, link.roles)).map(({ href, label, icon }) => ({ href, label, icon }))
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 p-3">
        <span aria-hidden className="ring-gold grid size-10 shrink-0 place-items-center rounded-full bg-elevated font-display text-lg uppercase text-primary">
          {user.email.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.email}</p>
          <p className="text-xs text-primary">{ROLE_LABELS[user.role]}</p>
        </div>
      </div>
      <SideNav items={items} root="/admin" label="Panel" />
      <form action={signOut} className="hidden border-t border-border pt-4 lg:block">
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/60 hover:text-foreground">
          <LogOut aria-hidden className="size-4" /> Cerrar sesión
        </button>
      </form>
    </div>
  )
}

// Vista previa de los módulos (sin datos) para el estado "pendiente de configuración"
export const ADMIN_MODULES = LINKS.slice(1)
