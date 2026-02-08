'use server'

import { createClient } from '@/lib/db/server'
import { getSupabaseAdmin } from '@/lib/db/admin'

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Check if user is an admin (check by ID, not email)
  const { data: adminUser, error: adminError } = await getSupabaseAdmin()
    .from('admin_users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (!adminUser || adminError) {
    await supabase.auth.signOut()
    return { 
      success: false, 
      error: `Unauthorized access. User ID ${data.user.id} is not in admin_users table. Please run FIX_RLS_COMPLETE.sql in Supabase.` 
    }
  }

  return { success: true, user: data.user }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  if (!user) return false

  const { data } = await getSupabaseAdmin()
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single()

  return !!data
}
