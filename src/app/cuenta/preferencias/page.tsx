import Link from 'next/link'
import { requireUser } from '@/features/auth/session'
import { getMyProfile } from '@/features/pedidos/account-queries'
import { AdminForm } from '@/features/admin/components/admin-form'
import { Checkbox } from '@/features/admin/components/checkbox'
import { DataState } from '@/shared/components/data-state'
import { Field } from '@/shared/components/ui/field'
import { updatePreferences } from '../actions'

export default async function PreferencesPage() {
  const user = await requireUser()
  const profile = await getMyProfile(user)

  return (
    <>
      <h1>Preferencias y privacidad</h1>
      <DataState result={profile}>
        {(data) => (
          <AdminForm action={updatePreferences} submitLabel="Guardar preferencias">
            <Field label="Nombre (opcional)" name="full_name" autoComplete="name" defaultValue={data.full_name ?? ''} />
            <Checkbox name="marketing_consent" defaultChecked={data.marketing_consent}
              label="Acepto recibir comunicaciones comerciales de la marca"
              hint="Opcional. Sin este consentimiento solo te escribiremos sobre tus pedidos y solicitudes." />
          </AdminForm>
        )}
      </DataState>
      <section className="glass space-y-3 rounded-[1.5rem] p-6 text-sm">
        <h2 className="text-3xl">Tus derechos sobre tus datos</h2>
        <p className="text-muted-foreground">
          Puedes solicitar el acceso, la rectificación o la eliminación de tus datos personales, o la exportación de tu historial.
          Envía tu petición desde el <Link href="/contacto" className="underline">formulario de contacto</Link> indicando el motivo; el equipo la atenderá conforme a la{' '}
          <Link href="/politicas/privacidad" className="underline">política de privacidad</Link>.
        </p>
      </section>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
