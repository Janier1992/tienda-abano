import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured, publicEnv } from '@/shared/lib/env'

// Refresca la sesión de Supabase y hace una comprobación optimista en rutas privadas.
// La autorización real se repite en cada página y acción del servidor.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (!isSupabaseConfigured()) return response

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        // Se recrea la respuesta para que los Server Components reciban el token renovado
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const { data } = await supabase.auth.getUser()

  const isPrivate = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/cuenta')
  if (isPrivate && !data.user) {
    return NextResponse.redirect(new URL('/ingresar', request.url))
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)'],
}
