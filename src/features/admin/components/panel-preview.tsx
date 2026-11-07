import { Check, Database, KeyRound, ShieldCheck } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/shared/components/motion/reveal'
import { ADMIN_MODULES } from './admin-nav'

const DESCRIPTIONS: Record<string, string> = {
  '/admin/productos': 'Fichas, fotografías, precios y publicación con control de completitud.',
  '/admin/categorias': 'Organización del catálogo y orden de presentación.',
  '/admin/pedidos': 'Estados del pedido separados del estado de pago confirmado por la pasarela.',
  '/admin/consultas': 'Bandeja de atención con contexto, resumen del asistente y asignación.',
  '/admin/contenido/faqs': 'Preguntas frecuentes, servicios y políticas con responsable y fecha.',
  '/admin/configuracion': 'Datos de marca y control legal de la venta online.',
  '/admin/auditoria': 'Registro inmutable de cambios relevantes, sin datos personales.',
  '/admin/usuarios': 'Roles con mínimo privilegio: catálogo, pedidos, atención y administración.',
}

const STEPS = [
  { icon: Database, title: 'Conectar Supabase', text: 'URL y claves del proyecto en las variables de entorno.' },
  { icon: ShieldCheck, title: 'Aplicar el esquema', text: 'Tablas, seguridad por fila y auditoría (supabase/migrations).' },
  { icon: KeyRound, title: 'Designar al primer administrador', text: 'Un comando SQL; el resto de roles se asignan desde el panel.' },
]

// Estado "pendiente de configuración" del panel: presenta los módulos y los pasos para activarlo
export function PanelPreview() {
  return (
    <div className="space-y-10">
      <Reveal>
        <div className="ring-gold relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-elevated via-card to-surface p-8 md:p-12">
          <div aria-hidden className="animate-aurora absolute -right-24 -top-24 size-96 rounded-full bg-primary/15 blur-[110px]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/[0.08] px-3 py-1 text-xs text-warning">
                <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-warning" /> Pendiente de configuración
              </span>
              <h1 className="text-5xl md:text-6xl">Panel del <em className="text-gold">equipo</em></h1>
              <p className="max-w-lg leading-relaxed text-muted-foreground">
                Catálogo, pedidos, atención y contenido en un solo lugar, con permisos por rol y trazabilidad de cada cambio.
                Se activa al conectar la base de datos de la marca.
              </p>
            </div>
            <ol className="space-y-3">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="glass flex items-start gap-4 rounded-2xl p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Icon aria-hidden className="size-4" /></span>
                  <span>
                    <span className="block text-sm font-semibold"><span className="text-primary">0{i + 1} · </span>{title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>

      <section aria-labelledby="modulos" className="space-y-5">
        <p id="modulos" className="eyebrow">Módulos incluidos</p>
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ADMIN_MODULES.map((module) => (
            <StaggerItem key={module.href} className="group rounded-2xl border border-border bg-card/50 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:bg-card">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl">{module.label}</p>
                <Check aria-hidden className="size-4 text-success opacity-70" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{DESCRIPTIONS[module.href]}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  )
}
