import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import type { StaffRole } from '@/shared/types/domain'
import { isSupabaseConfigured } from '@/shared/lib/env'
import { createSessionClient } from '@/shared/lib/supabase/server'

export interface CurrentUser {
  id: string
  email: string
  role: StaffRole
}

export const STAFF_ROLES: StaffRole[] = ['admin', 'catalogo', 'pedidos', 'atencion']

// Capa de acceso a la sesión: valida el token contra Supabase Auth (no confía en la cookie sin verificar)
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null
  const supabase = await createSessionClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
  return { id: data.user.id, email: data.user.email ?? '', role: (profile?.role as StaffRole) ?? 'cliente' }
})

export function hasRole(user: CurrentUser | null, roles: StaffRole[]): user is CurrentUser {
  return Boolean(user && (user.role === 'admin' || roles.includes(user.role)))
}

// Para páginas y acciones protegidas: redirige si no hay sesión o permisos
export async function requireRole(roles: StaffRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/ingresar')
  if (!hasRole(user, roles)) redirect('/admin/sin-permiso')
  return user
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/ingresar')
  return user
}
