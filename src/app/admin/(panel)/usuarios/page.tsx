import { requireRole } from '@/features/auth/session'
import { listUsers } from '@/features/admin/queries'
import { updateUserRole } from '@/features/admin/operations-actions'
import { AdminForm } from '@/features/admin/components/admin-form'
import { DataState } from '@/shared/components/data-state'
import { Select } from '@/shared/components/ui/field'

const ROLE_LABELS = {
  cliente: 'Cliente (sin acceso al panel)',
  atencion: 'Atención al cliente',
  pedidos: 'Pedidos',
  catalogo: 'Catálogo',
  admin: 'Administración',
} as const

export default async function UsersPage() {
  const current = await requireRole(['admin'])
  const users = await listUsers()

  return (
    <>
      <h1 className="text-3xl font-semibold">Usuarios y roles</h1>
      <p className="text-sm text-muted-foreground">Principio de mínimo privilegio: asigna a cada persona solo el rol que necesita.</p>
      <DataState result={users}>
        {(rows) => (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {rows.map((user) => (
              <li key={user.id} className="p-4">
                <AdminForm action={updateUserRole} submitLabel="Cambiar rol" variant="secondary" className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="user_id" value={user.id} />
                  <p className="min-w-56 text-sm font-medium">{user.email}{user.id === current.id && ' (tú)'}</p>
                  <Select label="Rol" name="role" defaultValue={user.role}>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </Select>
                </AdminForm>
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
