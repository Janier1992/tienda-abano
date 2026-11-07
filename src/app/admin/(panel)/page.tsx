import Link from 'next/link'
import { ArrowUpRight, Check, MessagesSquare, Package, ShoppingBag, X } from 'lucide-react'
import { requireRole, STAFF_ROLES } from '@/features/auth/session'
import { getDashboard, getSettings } from '@/features/admin/queries'
import { getSalesEnableMissing } from '@/features/admin/domain/settings'
import { DataState } from '@/shared/components/data-state'
import { Stagger, StaggerItem } from '@/shared/components/motion/reveal'
import type { BrandSettings } from '@/shared/types/domain'

// Todos los requisitos posibles, en el mismo orden y con los mismos textos que el dominio
const ALL_REQUIREMENTS = getSalesEnableMissing({
  legal_responsible: null, legal_validated_at: null, age_verification_provider: null, payment_provider: null, allowed_regions: [],
})

export default async function DashboardPage() {
  const user = await requireRole(STAFF_ROLES)
  const [dashboard, settings] = await Promise.all([getDashboard(user), getSettings()])

  return (
    <>
      <header className="space-y-3">
        <p className="eyebrow">Resumen</p>
        <h1>Hola de nuevo</h1>
        <p className="text-muted-foreground">Lo que requiere tu atención hoy, según tu rol.</p>
      </header>
      <DataState result={dashboard}>
        {(data) => (
          <Stagger className="grid gap-4 sm:grid-cols-3">
            <Stat icon="consultas" label="Consultas nuevas" value={data.newRequests} href="/admin/consultas?estado=nuevo" />
            <Stat icon="pedidos" label="Pedidos que requieren gestión" value={data.pendingOrders} href="/admin/pedidos" />
            <Stat icon="productos" label="Productos con ficha incompleta" value={data.incompleteProducts} href="/admin/productos" />
          </Stagger>
        )}
      </DataState>
      <DataState result={settings}>{(data) => <SalesGateCard settings={data} />}</DataState>
    </>
  )
}

const STAT_ICONS = { consultas: MessagesSquare, pedidos: ShoppingBag, productos: Package }

// Un valor null significa que el rol no tiene acceso a ese dato
function Stat({ icon, label, value, href }: { icon: keyof typeof STAT_ICONS; label: string; value: number | null; href: string }) {
  if (value === null) return null
  const Icon = STAT_ICONS[icon]
  return (
    <StaggerItem>
      <Link href={href} className="group relative block overflow-hidden rounded-[1.5rem] border border-border bg-card/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-[0_30px_60px_-30px_hsl(40_60%_40%/0.5)]">
        <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 md:opacity-60" />
        <div className="relative flex items-start justify-between">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary"><Icon aria-hidden className="size-4" /></span>
          <ArrowUpRight aria-hidden className="size-4 text-muted-foreground transition group-hover:rotate-45 group-hover:text-primary" />
        </div>
        <p className="relative mt-6 font-display text-6xl tabular-nums text-gold">{value}</p>
        <p className="relative mt-1 text-sm text-muted-foreground">{label}</p>
      </Link>
    </StaggerItem>
  )
}

function SalesGateCard({ settings }: { settings: BrandSettings }) {
  const missing = getSalesEnableMissing(settings)
  const active = settings.sales_enabled
  return (
    <section aria-labelledby="estado-venta" className="glass rounded-[1.5rem] p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Control legal de la venta</p>
          <h2 id="estado-venta" className="text-3xl">{active ? 'Venta online activa' : 'Venta online desactivada'}</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            {active
              ? `Validada por ${settings.legal_responsible}. Regiones: ${settings.allowed_regions.join(', ')}.`
              : 'El checkout solo registra intenciones de compra hasta completar todos los requisitos.'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
          <span aria-hidden className={`size-1.5 rounded-full ${active ? 'bg-success' : 'bg-warning'}`} />
          {ALL_REQUIREMENTS.length - missing.length}/{ALL_REQUIREMENTS.length} requisitos
        </span>
      </div>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {ALL_REQUIREMENTS.map((requirement) => {
          const ok = !missing.includes(requirement)
          return (
            <li key={requirement} className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm">
              <span className={`grid size-6 shrink-0 place-items-center rounded-full ${ok ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                {ok ? <Check aria-hidden className="size-3.5" /> : <X aria-hidden className="size-3.5" />}
              </span>
              <span className="first-letter:uppercase">{requirement}</span>
              <span className="sr-only">{ok ? 'cumplido' : 'pendiente'}</span>
            </li>
          )
        })}
      </ul>
      {!active && (
        <Link href="/admin/configuracion" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          Ir a configuración <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      )}
    </section>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
