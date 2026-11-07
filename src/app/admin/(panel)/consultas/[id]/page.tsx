import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import { requireRole, type CurrentUser } from '@/features/auth/session'
import { getRequest, listUsers, type StaffMember } from '@/features/admin/queries'
import { addSupportNote, updateSupportRequest } from '@/features/admin/operations-actions'
import { AdminForm } from '@/features/admin/components/admin-form'
import { formatDate } from '@/features/admin/components/checkbox'
import { REQUEST_STATUS_LABELS } from '@/features/admin/domain/settings'
import { REQUEST_TYPE_LABELS } from '@/features/atencion/schema'
import { DataState } from '@/shared/components/data-state'
import { Select, TextArea } from '@/shared/components/ui/field'
import type { SupportRequest } from '@/shared/types/domain'

// Personal asignable: un admin ve a todo el equipo; el resto solo puede asignarse a sí mismo
async function assignableStaff(user: CurrentUser): Promise<StaffMember[]> {
  if (user.role !== 'admin') return [{ id: user.id, email: user.email, role: user.role }]
  const users = await listUsers()
  return users.status === 'ok' ? users.data.filter((member) => member.role !== 'cliente') : [{ id: user.id, email: user.email, role: user.role }]
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['atencion'])
  const { id } = await params
  const [request, staff] = await Promise.all([getRequest(id), assignableStaff(user)])

  return (
    <DataState result={request}>
      {(data) => {
        if (!data) notFound()
        return (
          <>
            <h1 className="text-3xl font-semibold">{REQUEST_TYPE_LABELS[data.type]}</h1>
            <p className="text-sm text-muted-foreground">{data.contact_name} · {data.contact_email} · {formatDate(data.created_at)}</p>
            <section className="space-y-2 rounded-lg border border-border p-4">
              <h2 className="text-xl font-semibold">Mensaje del cliente</h2>
              {/* Contenido del visitante: se muestra como texto, nunca como HTML */}
              <p className="whitespace-pre-wrap text-sm">{data.message}</p>
              <RequestContext context={data.context} />
              {data.assistant_summary && (
                <div className="rounded bg-muted p-3 text-sm"><p className="font-semibold">Resumen del asistente</p><p className="whitespace-pre-wrap">{data.assistant_summary}</p></div>
              )}
            </section>
            <section className="rounded-lg border border-border p-4">
              <h2 className="mb-3 text-xl font-semibold">Gestión</h2>
              <AdminForm action={updateSupportRequest.bind(null, data.id)}><RequestFields request={data} staff={staff} /></AdminForm>
            </section>
            <section className="space-y-3 rounded-lg border border-border p-4">
              <h2 className="text-xl font-semibold">Notas internas</h2>
              <ul className="space-y-2 text-sm">
                {data.support_notes.map((note) => (
                  <li key={note.id} className="rounded bg-muted p-2"><p className="whitespace-pre-wrap">{note.body}</p><p className="text-xs text-muted-foreground">{formatDate(note.created_at)}</p></li>
                ))}
                {data.support_notes.length === 0 && <li className="text-muted-foreground">Sin notas.</li>}
              </ul>
              <AdminForm action={addSupportNote.bind(null, data.id)} submitLabel="Añadir nota" variant="secondary">
                <TextArea label="Nueva nota (no visible para el cliente)" name="body" required rows={3} />
              </AdminForm>
            </section>
          </>
        )
      }}
    </DataState>
  )
}

function RequestFields({ request, staff }: { request: SupportRequest; staff: StaffMember[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Select label="Estado" name="status" defaultValue={request.status}>
        {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </Select>
      <Select label="Asignada a" name="assigned_to" defaultValue={request.assigned_to ?? ''}>
        <option value="">Sin asignar</option>
        {staff.map((member) => <option key={member.id} value={member.id}>{member.email}</option>)}
      </Select>
      <div className="md:col-span-2"><TextArea label="Resolución" name="resolution" defaultValue={request.resolution ?? ''} rows={3} hint="Obligatoria para marcar como resuelto." /></div>
      <div className="md:col-span-2"><TextArea label="Motivo de escalamiento" name="escalation_reason" defaultValue={request.escalation_reason ?? ''} rows={2} /></div>
    </div>
  )
}

const CONTEXT_LABELS: Record<string, string> = { origin: 'Origen', productSlug: 'Producto', orderReference: 'Pedido', region: 'Región' }

function RequestContext({ context }: { context: Record<string, unknown> }) {
  const cart = Array.isArray(context.cart) ? (context.cart as { name: string; quantity: number }[]) : []
  const entries = Object.entries(CONTEXT_LABELS).filter(([key]) => typeof context[key] === 'string')
  if (entries.length === 0 && cart.length === 0) return null
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
      {entries.map(([key, label]) => <Fragment key={key}><dt className="font-semibold">{label}</dt><dd>{String(context[key])}</dd></Fragment>)}
      {cart.length > 0 && <><dt className="font-semibold">Carrito</dt><dd>{cart.map((line) => `${line.quantity} × ${line.name}`).join(', ')}</dd></>}
    </dl>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
