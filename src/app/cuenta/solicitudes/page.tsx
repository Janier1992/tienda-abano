import { requireUser } from '@/features/auth/session'
import { listMyRequests } from '@/features/pedidos/account-queries'
import { REQUEST_TYPE_LABELS } from '@/features/atencion/schema'
import { REQUEST_STATUS_LABELS } from '@/features/admin/domain/settings'
import { formatDate } from '@/features/admin/components/checkbox'
import { DataState } from '@/shared/components/data-state'
import { ButtonLink } from '@/shared/components/ui/button'

export default async function MyRequestsPage() {
  const user = await requireUser()
  const requests = await listMyRequests(user)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1>Mis solicitudes</h1>
        <ButtonLink href="/contacto" variant="secondary">Nueva consulta</ButtonLink>
      </div>
      <DataState result={requests}>
        {(rows) => rows.length === 0 ? <p className="text-muted-foreground">No has enviado solicitudes con esta cuenta.</p> : (
          <ul className="space-y-3">
            {rows.map((request) => (
              <li key={request.id} className="space-y-2 rounded-2xl border border-border bg-card/50 p-5 text-sm transition hover:border-primary/30">
                <p className="flex items-center justify-between gap-3 font-semibold"><span>{REQUEST_TYPE_LABELS[request.type]}</span><span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{REQUEST_STATUS_LABELS[request.status]}</span></p>
                <p className="line-clamp-2 text-muted-foreground">{request.message}</p>
                {request.resolution && <p><span className="font-medium">Respuesta:</span> {request.resolution}</p>}
                <p className="text-xs text-muted-foreground">Enviada {formatDate(request.created_at)} · Ref. {request.id.slice(0, 8).toUpperCase()}</p>
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
