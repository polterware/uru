import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let supabaseClient: SupabaseClient<Database> | null = null

function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const publishableDefaultKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!url || !publishableDefaultKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.',
    )
  }

  return { url, publishableDefaultKey }
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    const { url, publishableDefaultKey } = getSupabaseConfig()
    supabaseClient = createClient<Database>(url, publishableDefaultKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  }

  return supabaseClient
}
