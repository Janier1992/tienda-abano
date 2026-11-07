import { requireRole } from '@/features/auth/session'
import { listAudit, type AuditEntry } from '@/features/admin/queries'
import { formatDate } from '@/features/admin/components/checkbox'
import { DataState } from '@/shared/components/data-state'

const ACTIONS: Record<string, string> = { INSERT: 'Alta', UPDATE: 'Cambio', DELETE: 'Baja' }
const IGNORED = new Set(['updated_at', 'created_at'])

// Solo los campos que cambiaron; la auditoría no guarda datos personales
function changedFields(entry: AuditEntry): string[] {
  const before = entry.changes?.antes ?? {}
  const after = entry.changes?.despues ?? {}
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  return [...keys].filter((key) => !IGNORED.has(key) && JSON.stringify(before[key]) !== JSON.stringify(after[key]))
}

export default async function AuditPage() {
  await requireRole(['admin'])
  const entries = await listAudit()

  return (
    <>
      <h1 className="text-3xl font-semibold">Auditoría</h1>
      <p className="text-sm text-muted-foreground">Últimos 100 cambios registrados automáticamente por la base de datos. Solo lectura.</p>
      <DataState result={entries}>
        {(rows) => (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left"><tr><th className="p-2">Fecha</th><th className="p-2">Acción</th><th className="p-2">Entidad</th><th className="p-2">Campos</th><th className="p-2">Autor</th></tr></thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id} className="border-t border-border align-top">
                    <td className="p-2 whitespace-nowrap">{formatDate(entry.created_at)}</td>
                    <td className="p-2">{ACTIONS[entry.action] ?? entry.action}</td>
                    <td className="p-2">{entry.entity} <span className="text-xs text-muted-foreground">{entry.entity_id?.slice(0, 8)}</span></td>
                    <td className="p-2 text-xs">{changedFields(entry).join(', ') || '—'}</td>
                    <td className="p-2 text-xs text-muted-foreground">{entry.actor_id?.slice(0, 8) ?? 'sistema'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataState>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
