import { ButtonLink } from '@/shared/components/ui/button'
import { Notice } from '@/shared/components/ui/notice'

export default function NoPermissionPage() {
  return (
    <div className="max-w-xl space-y-4">
      <Notice tone="warning" title="No tienes permiso para esta sección">
        Tu cuenta no tiene asignado el rol necesario. Si crees que es un error, pide a un administrador que revise tu rol.
      </Notice>
      <div className="flex gap-3">
        <ButtonLink href="/admin" variant="secondary">Volver al panel</ButtonLink>
        <ButtonLink href="/" variant="ghost">Ir a la tienda</ButtonLink>
      </div>
    </div>
  )
}
