'use server'
import { z } from 'zod'
import type { ActionState } from '@/shared/lib/action-state'
import { requireUser } from '@/features/auth/session'
import { createSessionClient } from '@/shared/lib/supabase/server'

const preferencesSchema = z.object({
  full_name: z.string().trim().max(120).transform((value) => value || null),
  marketing_consent: z.boolean(),
})

// El usuario solo modifica su propio perfil (RLS lo impone; el rol queda protegido por trigger)
export async function updatePreferences(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const parsed = preferencesSchema.safeParse({
    full_name: String(formData.get('full_name') ?? ''),
    marketing_consent: formData.get('marketing_consent') === 'on',
  })
  if (!parsed.success) return { status: 'error', message: 'Revisa los datos indicados.' }

  const supabase = await createSessionClient()
  const { data, error } = await supabase.from('profiles').update(parsed.data).eq('id', user.id).select('id')
  if (error || !data?.length) return { status: 'error', message: 'No pudimos guardar tus preferencias. Inténtalo de nuevo.' }
  return {
    status: 'success',
    message: parsed.data.marketing_consent
      ? 'Preferencias guardadas. Podrás retirar tu consentimiento en cualquier momento.'
      : 'Preferencias guardadas. No recibirás comunicaciones comerciales.',
  }
}
