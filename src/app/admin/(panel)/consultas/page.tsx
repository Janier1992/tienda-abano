import Link from 'next/link'
import { requireRole } from '@/features/auth/session'
import { listRequests } from '@/features/admin/queries'
import { formatDate } from '@/features/admin/components/checkbox'
import { REQUEST_STATUS_LABELS } from '@/features/admin/domain/settings'
import { REQUEST_TYPE_LABELS } from '@/features/atencion/schema'
import { DataState } from '@/shared/components/data-state'
import type { RequestStatus } from '@/shared/types/domain'

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await requireRole(['atencion'])
  const { estado } = await searchParams
  const status = estado && estado in REQUEST_STATUS_LABELS ? (estado as RequestStatus) : undefined
  const requests = await listRequests(status)

  return (
    <>
      <h1 className="text-3xl font-semibold">Consultas y solicitudes</h1>
      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/consultas" className={!status ? 'font-semibold underline' : 'underline'}>Todas</Link>
        {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
          <Link key={value} href={`/admin/consultas?estado=${value}`} className={status === value ? 'font-semibold underline' : 'underline'}>{label}</Link>
        ))}
      </nav>
      <DataState result={requests}>
        {(rows) => rows.length === 0 ? <p className="text-muted-foreground">No hay solicitudes con este filtro.</p> : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {rows.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <Link href={`/admin/consultas/${request.id}`} className="font-medium underline">{REQUEST_TYPE_LABELS[request.type]} · {request.contact_name}</Link>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{request.message}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold">{REQUEST_STATUS_LABELS[request.status]}</p>
                  <p className="text-muted-foreground">{formatDate(request.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DataState>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
