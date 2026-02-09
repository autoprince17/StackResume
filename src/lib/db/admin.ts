import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/lib/env'

// Lazy initialization of Supabase admin client
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient<Database>(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return supabaseAdmin
}
