'use server'
import { z } from 'zod'
import { createServiceClient } from '@/shared/lib/supabase/server'
import { checkRateLimit, clientKey } from '@/shared/lib/rate-limit'
import { isSupabaseConfigured } from '@/shared/lib/env'
import { EVENT_NAMES } from './events'

const eventSchema = z.object({
  name: z.enum(EVENT_NAMES),
  path: z.string().max(200),
  props: z.record(z.string().max(40), z.union([z.string().max(120), z.number()])).optional(),
})

// El cliente solo llama a esta acción si hay consentimiento de analítica
export async function trackEvent(input: z.infer<typeof eventSchema>): Promise<void> {
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success || !isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return
  if (!checkRateLimit(await clientKey('analitica'), 120, 60_000)) return
  await createServiceClient().from('analytics_events').insert({
    name: parsed.data.name,
    path: parsed.data.path,
    props: parsed.data.props ?? {},
  })
}
