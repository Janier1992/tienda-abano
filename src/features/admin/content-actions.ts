'use server'
import { updateTag } from 'next/cache'
import type { ActionState } from '@/shared/lib/action-state'
import { CACHE_TAGS } from '@/shared/lib/data-result'
import { faqSchema, pageSchema, serviceSchema } from './schemas'
import { formToObject, runStaffAction, saved, writeProblem } from './run-action'
import { CONTENT_TYPES, type ContentType } from './content-config'

const SCHEMAS = { faqs: faqSchema, servicios: serviceSchema, paginas: pageSchema } as const

// Alta o edición de contenido publicado; registra fecha de actualización (el responsable va en el formulario)
export async function saveContent(type: ContentType, id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { table, key } = CONTENT_TYPES[type]
  return runStaffAction(['admin'], SCHEMAS[type], formToObject(formData), async (data, { supabase }) => {
    const row: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() }
    const problem = writeProblem(id
      ? await supabase.from(table).update(row).eq(key, id).select(key)
      : await supabase.from(table).insert(row).select(key))
    if (problem) return problem
    updateTag(CACHE_TAGS.contenido)
    return saved(id ? 'Contenido actualizado.' : 'Contenido creado.')
  })
}
