import { requireRole } from '@/features/auth/session'
import { getSettings } from '@/features/admin/queries'
import { updateBrandSettings } from '@/features/admin/operations-actions'
import { getSalesEnableMissing } from '@/features/admin/domain/settings'
import { AdminForm } from '@/features/admin/components/admin-form'
import { Checkbox, formatDate } from '@/features/admin/components/checkbox'
import { DataState } from '@/shared/components/data-state'
import { Field, TextArea } from '@/shared/components/ui/field'
import { Notice } from '@/shared/components/ui/notice'

export default async function SettingsPage() {
  await requireRole(['admin'])
  const settings = await getSettings()

  return (
    <>
      <h1 className="text-3xl font-semibold">Configuración de marca y venta</h1>
      <DataState result={settings}>
        {(s) => {
          const missing = getSalesEnableMissing(s)
          return (
            <AdminForm action={updateBrandSettings} submitLabel="Guardar configuración">
              <fieldset className="grid gap-4 md:grid-cols-2">
                <legend className="mb-2 text-xl font-semibold">Identidad y atención</legend>
                <Field label="Nombre de la marca" name="brand_name" required defaultValue={s.brand_name} />
                <Field label="Lema" name="tagline" defaultValue={s.tagline ?? ''} />
                <div className="md:col-span-2"><TextArea label="Descripción institucional" name="description" defaultValue={s.description ?? ''} /></div>
                <Field label="Correo de atención" name="support_email" type="email" defaultValue={s.support_email ?? ''} />
                <Field label="Teléfono de atención" name="support_phone" defaultValue={s.support_phone ?? ''} />
                <Field label="Horario real de atención" name="support_hours" defaultValue={s.support_hours ?? ''} hint="El asistente lo usa para informar disponibilidad. No indicar si no está confirmado." />
                <Field label="Moneda (ISO)" name="currency" required defaultValue={s.currency} />
              </fieldset>

              <fieldset className="grid gap-4 border-t border-border pt-4 md:grid-cols-2">
                <legend className="mb-2 text-xl font-semibold">Cumplimiento y venta online</legend>
                <Field label="Edad mínima" name="min_age" type="number" min={18} required defaultValue={s.min_age} />
                <Field label="Regiones habilitadas para venta" name="allowed_regions" defaultValue={s.allowed_regions.join(', ')} hint="Solo regiones con validación legal (códigos separados por comas)." />
                <Field label="Responsable de la validación legal" name="legal_responsible" defaultValue={s.legal_responsible ?? ''} />
                <Field label="Fecha de validación legal" name="legal_validated_at" type="date" defaultValue={s.legal_validated_at?.slice(0, 10) ?? ''} />
                <Field label="Proveedor de verificación de edad" name="age_verification_provider" defaultValue={s.age_verification_provider ?? ''} hint="Debe estar integrado técnicamente antes de activar la venta." />
                <Field label="Proveedor de pago autorizado" name="payment_provider" defaultValue={s.payment_provider ?? ''} hint="Debe aceptar productos de tabaco y estar integrado." />
                <div className="md:col-span-2 space-y-2">
                  {missing.length > 0 && <Notice tone="warning" title="La venta no puede activarse todavía">Falta: {missing.join(', ')}.</Notice>}
                  <Checkbox name="sales_enabled" label="Venta online habilitada" defaultChecked={s.sales_enabled} hint="Activar solo con revisión legal local completada. Esta acción queda registrada en auditoría." />
                </div>
              </fieldset>
              <p className="text-xs text-muted-foreground">Última actualización: {formatDate(s.updated_at)}</p>
            </AdminForm>
          )
        }}
      </DataState>
    </>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
