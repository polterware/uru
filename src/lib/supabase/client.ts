import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getCachedSupabaseConfig } from "@/lib/supabase/runtime-config";

let supabaseClient: SupabaseClient<Database> | null = null;
let supabaseClientCacheKey: string | null = null;

export function getSupabaseConfig() {
  const runtimeConfig = getCachedSupabaseConfig();
  const url = runtimeConfig?.url;
  const publishableDefaultKey = runtimeConfig?.publishableKey;

  if (!url || !publishableDefaultKey) {
    throw new Error(
      "Supabase is not configured. Complete the connection setup or provide VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY for development.",
    );
  }

  return { url, publishableDefaultKey };
}

export function resetSupabaseClient() {
  supabaseClient = null;
  supabaseClientCacheKey = null;
}

export function getSupabaseClient() {
  const { url, publishableDefaultKey } = getSupabaseConfig();
  const cacheKey = `${url}|${publishableDefaultKey}`;

  if (!supabaseClient || supabaseClientCacheKey !== cacheKey) {
    supabaseClient = createClient<Database>(url, publishableDefaultKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    supabaseClientCacheKey = cacheKey;
  }

  return supabaseClient;
}
