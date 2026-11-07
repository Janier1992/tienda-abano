import { notFound } from 'next/navigation'
import { requireRole } from '@/features/auth/session'
import { getContent } from '@/features/admin/queries'
import { saveContent } from '@/features/admin/content-actions'
import { CONTENT_TYPES, isContentType } from '@/features/admin/content-config'
import { AdminForm } from '@/features/admin/components/admin-form'
import { ContentFields } from '@/features/admin/components/content-fields'
import { ButtonLink } from '@/shared/components/ui/button'
import { DataState } from '@/shared/components/data-state'

export default async function ContentEditPage({ params }: { params: Promise<{ tipo: string; id: string }> }) {
  await requireRole(['admin'])
  const { tipo, id: rawId } = await params
  if (!isContentType(tipo)) notFound()
  const id = decodeURIComponent(rawId)
  const item = await getContent(tipo, id)

  return (
    <DataState result={item}>
      {(values) => {
        if (!values) notFound()
        return (
          <>
            <ButtonLink href={`/admin/contenido/${tipo}`} variant="ghost">← {CONTENT_TYPES[tipo].title}</ButtonLink>
            <h1 className="text-3xl font-semibold">{String(values[CONTENT_TYPES[tipo].titleField])}</h1>
            <AdminForm action={saveContent.bind(null, tipo, id)}><ContentFields type={tipo} values={values} /></AdminForm>
          </>
        )
      }}
    </DataState>
  )
}

// Página privada dependiente de la sesión: no se valida como navegación instantánea
export const instant = false
