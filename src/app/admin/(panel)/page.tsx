import Link from 'next/link'
import { ArrowUpRight, Check, MessagesSquare, Package, ShieldCheck, ShoppingBag, Thermometer, UserCheck, X } from 'lucide-react'
import { requireRole, STAFF_ROLES } from '@/features/auth/session'
import { getDashboard, getSettings } from '@/features/admin/queries'
import { getSalesEnableMissing } from '@/features/admin/domain/settings'
import { DataState } from '@/shared/components/data-state'
import { Stagger, StaggerItem } from '@/shared/components/motion/reveal'
import type { BrandSettings } from '@/shared/types/domain'

// Todos los requisitos posibles, en el mismo orden y con los mismos textos que el dominio
const ALL_REQUIREMENTS = getSalesEnableMissing({
  legal_responsible: null,
  legal_validated_at: null,
  age_verification_provider: null,
  payment_provider: null,
  allowed_regions: [],
})

export default async function DashboardPage() {
  const user = await requireRole(STAFF_ROLES)
  const [dashboard, settings] = await Promise.all([getDashboard(user), getSettings()])

  return (
    <div className="space-y-8">
      {/* Cabecera Ejecutiva & Telemetría Operacional (Stitch) */}
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            <span className="label-gold text-accent !text-[0.6rem]">Auditoría Operacional Activa · Cava Central</span>
          </div>
          <h1 className="font-display text-3xl text-ink md:text-4xl">Consola Ejecutiva de Control</h1>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Supervisión en tiempo real de trazabilidad D.O.P., cumplimiento legal +18, climatización y custodia del Sommelier Virtual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 shadow-2xs">
            <Thermometer className="size-4 text-accent" />
            <div className="flex flex-col">
              <span className="label-gold text-accent !text-[0.55rem]">Cámara Principal</span>
              <span className="label-spec text-xs text-ink">17.2°C · 69.1% HR</span>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded border border-accent/60 bg-ink px-3 py-2 text-[0.65rem] font-bold uppercase tracking-wider text-ink-foreground shadow-xs sm:inline-flex">
            <ShieldCheck className="size-3.5 text-accent" />
            Cierre de Lote OK
          </span>
        </div>
      </header>

      {/* Rejilla de Tarjetas de Métricas Operativas (Stitch) */}
      <DataState result={dashboard}>
        {(data) => (
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon="pedidos"
              label="Acondicionamiento"
              value={data.pendingOrders ?? 0}
              subtext="Lotes en estabilización 72h"
              metricLabel="Estabilización"
              metricValue="82%"
              href="/admin/pedidos"
            />
            <Stat
              icon="verificacion"
              label="Verificación Legal (+18)"
              value="98.4%"
              subtext="Cotejo de identidad activo"
              metricLabel="Aprobación"
              metricValue="624 IDs"
              href="/admin/usuarios"
            />
            <Stat
              icon="consultas"
              label="Flujo Sommelier Virtual"
              value={data.newRequests ?? 0}
              subtext="Consultas pendientes de derivación"
              metricLabel="Resolución IA"
              metricValue="88%"
              href="/admin/consultas?estado=nuevo"
            />
            <Stat
              icon="productos"
              label="Control de Catálogo"
              value={data.incompleteProducts ?? 0}
              subtext="Fichas pendientes de auditar"
              metricLabel="Revisión"
              metricValue="D.O.P."
              href="/admin/productos"
            />
          </Stagger>
        )}
      </DataState>

      {/* Control Legal de la Venta (Sales Gate) */}
      <DataState result={settings}>
        {(data) => <SalesGateCard settings={data} />}
      </DataState>
    </div>
  )
}

const STAT_ICONS = {
  consultas: MessagesSquare,
  pedidos: ShoppingBag,
  productos: Package,
  verificacion: UserCheck,
}

function Stat({
  icon,
  label,
  value,
  subtext,
  metricLabel,
  metricValue,
  href,
}: {
  icon: keyof typeof STAT_ICONS
  label: string
  value: number | string
  subtext: string
  metricLabel: string
  metricValue: string
  href: string
}) {
  const Icon = STAT_ICONS[icon]

  return (
    <StaggerItem>
      <Link
        href={href}
        className="group relative flex h-full flex-col justify-between rounded border border-border bg-card p-5 shadow-2xs transition-all hover:border-accent hover:shadow-xs"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="label-gold text-accent !text-[0.6rem]">{label}</span>
            <p className="font-display text-3xl tabular-nums text-ink">{value}</p>
          </div>
          <span className="grid size-9 place-items-center rounded border border-border bg-surface text-primary transition group-hover:border-accent group-hover:text-accent">
            <Icon className="size-4" />
          </span>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[0.65rem] text-muted-foreground">{subtext}</span>
            <span className="label-spec text-xs text-primary">{metricValue}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full bg-accent rounded-full" style={{ width: '80%' }} />
          </div>
        </div>
      </Link>
    </StaggerItem>
  )
}

function SalesGateCard({ settings }: { settings: BrandSettings }) {
  const missing = getSalesEnableMissing(settings)
  const active = settings.sales_enabled

  return (
    <section aria-labelledby="estado-venta" className="rounded border border-border bg-card p-6 md:p-8 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1.5">
          <span className="label-gold text-accent">Protocolo Regulatorio & Fiscal</span>
          <h2 id="estado-venta" className="font-display text-2xl text-ink">
            {active ? 'Venta Online Activa · Habilitada' : 'Venta Online en Custodia Controlada'}
          </h2>
          <p className="max-w-xl text-xs text-muted-foreground">
            {active
              ? `Validada legalmente por ${settings.legal_responsible}. Jurisdicciones autorizadas: ${settings.allowed_regions.join(', ')}.`
              : 'El checkout registra intenciones de compra (solicitudes verificadas) hasta completar los 5 requisitos regulatorios.'}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            active
              ? 'border-success/40 bg-success/10 text-success'
              : 'border-warning/40 bg-warning/10 text-warning'
          }`}
        >
          <span aria-hidden className={`size-1.5 rounded-full ${active ? 'bg-success' : 'bg-warning'}`} />
          {ALL_REQUIREMENTS.length - missing.length}/{ALL_REQUIREMENTS.length} requisitos cumplidos
        </span>
      </div>

      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {ALL_REQUIREMENTS.map((requirement) => {
          const ok = !missing.includes(requirement)
          return (
            <li
              key={requirement}
              className="flex items-center gap-3 rounded border border-border bg-surface px-4 py-3 text-xs"
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full text-xs ${
                  ok ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                }`}
              >
                {ok ? <Check className="size-3 stroke-[3]" /> : <X className="size-3 stroke-[3]" />}
              </span>
              <span className="font-medium text-ink first-letter:uppercase">{requirement}</span>
              <span className="sr-only">{ok ? 'cumplido' : 'pendiente'}</span>
            </li>
          )
        })}
      </ul>

      {!active && (
        <div className="mt-6 border-t border-border pt-4">
          <Link
            href="/admin/configuracion"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-ink transition"
          >
            Completar configuración en el panel de marca <ArrowUpRight className="size-3.5 text-accent" />
          </Link>
        </div>
      )}
    </section>
  )
}
