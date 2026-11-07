// Lectura centralizada de variables de entorno. Una integración sin credenciales queda "pendiente", nunca simulada.

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
}

export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey)
}

// Modo prototipo: solo con la bandera explícita y sin base de datos real conectada
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !isSupabaseConfigured()
}

export function isAssistantConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY)
}

export const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL ?? 'anthropic/claude-sonnet-4.5'
