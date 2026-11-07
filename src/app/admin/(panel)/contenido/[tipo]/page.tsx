import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/features/auth/session'
import { listContent } from '@/features/admin/queries'
import { saveContent } from '@/features/admin/content-actions'
import { CONTENT_TYPES, isContentType } from '@/features/admin/content-config'
import { AdminForm } from '@/features/admin/components/admin-form'
import { ContentFields } from '@/features/admin/components/content-fields'
import { formatDate } from '@/features/admin/components/checkbox'
import { DataState } from '@/shared/components/data-state'

export default async function ContentListPage({ params }: { params: Promise<{ tipo: string }> }) {
  await requireRole(['admin'])
  const { tipo } = await params
  if (!isContentType(tipo)) notFound()
  const config = CONTENT_TYPES[tipo]
  const rows = await listContent(tipo)

  return (
    <>
      <h1 className="text-3xl font-semibold">Contenido</h1>
      <nav aria-label="Tipo de contenido" className="flex gap-4 text-sm">
        {Object.entries(CONTENT_TYPES).map(([key, value]) => (
          <Link key={key} href={`/admin/contenido/${key}`} className={key === tipo ? 'font-semibold underline' : 'underline'}>{value.title}</Link>
        ))}
      </nav>
      <DataState result={rows}>
        {(items) => (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {items.length === 0 && <li className="p-4 text-sm text-muted-foreground">Sin contenido. Crea el primero con el texto oficial aprobado.</li>}
            {items.map((item) => {
              const id = String(item[config.key])
              return (
                <li key={id} className="flex items-center justify-between gap-2 p-4 text-sm">
                  <Link href={`/admin/contenido/${tipo}/${encodeURIComponent(id)}`} className="font-medium underline">{String(item[config.titleField])}</Link>
                  <span className="text-xs text-muted-foreground">{item.published ? 'Publicado' : 'Borrador'} · {String(item.responsible)} · {formatDate(String(item.updated_at))}</span>
                </li>
              )
            })}
          </ul>
        )}
      </DataState>
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-xl font-semibold">Nuevo: {config.title}</h2>
        <AdminForm action={saveContent.bind(null, tipo, null)} submitLabel="Crear"><ContentFields type={tipo} /></AdminForm>
      </section>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
