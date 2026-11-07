'use client'
import { createBrowserClient } from '@supabase/ssr'
import { publicEnv } from '@/shared/lib/env'

// Cliente del navegador: solo para autenticación; los datos se leen en el servidor.
export function createBrowserSupabase() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey)
}
