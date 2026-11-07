import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, hasRole, STAFF_ROLES } from '@/features/auth/session'
import { AdminNav } from '@/features/admin/components/admin-nav'
import { PanelPreview } from '@/features/admin/components/panel-preview'
import { isSupabaseConfigured } from '@/shared/lib/env'
import { Skeleton } from '@/shared/components/data-state'

// Estilo editorial común para todas las páginas del panel (títulos, tablas y listas)
const CONTENT_STYLE = [
  'min-w-0 space-y-8',
  '[&_h1]:font-display [&_h1]:text-5xl [&_h1]:font-normal',
  '[&_table]:w-full [&_thead]:sticky [&_thead]:top-16 [&_thead]:bg-elevated/95 [&_thead]:backdrop-blur',
  '[&_th]:text-[0.68rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.14em] [&_th]:text-muted-foreground',
  '[&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-primary/[0.05] [&_tbody_tr:nth-child(even)]:bg-surface/40',
  '[&_.overflow-x-auto]:rounded-2xl [&_.overflow-x-auto]:bg-card/40',
  '[&_ul.divide-y]:rounded-2xl [&_ul.divide-y]:bg-card/40 [&_ul.divide-y>li]:transition-colors [&_ul.divide-y>li:hover]:bg-primary/[0.04]',
].join(' ')

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <StaffGate>{children}</StaffGate>
    </Suspense>
  )
}

// Lee la sesión en tiempo de petición; sin Supabase muestra un estado controlado en vez de redirigir en bucle
async function StaffGate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <PanelPreview />
  const user = await getCurrentUser()
  if (!user) redirect('/ingresar?next=/admin')
  if (!hasRole(user, STAFF_ROLES)) redirect('/admin/sin-permiso')

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-[1.5rem] p-3 lg:p-4"><AdminNav user={user} /></div>
      </aside>
      <section className={CONTENT_STYLE}>{children}</section>
    </div>
  )
}
