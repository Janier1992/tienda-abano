'use server'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/shared/lib/env'
import { createSessionClient } from '@/shared/lib/supabase/server'

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient()
    await supabase.auth.signOut()
  }
  redirect('/')
}
