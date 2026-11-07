import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/shared/lib/env'
import { createSessionClient } from '@/shared/lib/supabase/server'
import { log } from '@/shared/lib/logger'
import { safeNextPath } from '@/app/ingresar/next-path'

// Destino del enlace mágico: admite el flujo PKCE (?code) y el de plantilla con token (?token_hash&type)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNextPath(searchParams.get('next'))
  const failure = NextResponse.redirect(new URL('/ingresar?error=enlace', origin))
  if (!isSupabaseConfigured()) return failure

  const supabase = await createSessionClient()
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error('Enlace incompleto') }

  if (error) {
    log('warn', 'auth', 'Enlace de acceso inválido', { message: error.message })
    return failure
  }
  return NextResponse.redirect(new URL(next, origin))
}
